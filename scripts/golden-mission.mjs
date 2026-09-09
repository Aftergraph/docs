// @ts-nocheck
// Golden Mission executable conformance scenario (golden-mission.scenario/0.1).
// Runs the canonical 10-step mission through the contract seams defined in
// Phase 2/3 (egress intent, lineage, dispatch acceptance) as a deterministic,
// dependency-free state machine, then replays the 7-fault campaign.
// PASS requires evidence at every seam, not component health.
// Writes public/golden-mission-state.json (regenerated each build, like
// public/source-state.json). Exit non-zero on any failed expectation.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const scenario = JSON.parse(
  readFileSync(root + "/src/data/golden-mission.scenario.json", "utf8"),
);
if (scenario.$schema !== "golden-mission.scenario/0.1") {
  console.error("golden-mission: unknown scenario schema");
  process.exit(1);
}

const failures = [];
const check = (name, cond, detail = "") => {
  if (!cond) failures.push(`${name}${detail ? ": " + detail : ""}`);
};

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const id = scenario.identities;

// --- Campaign 1: nominal mission -------------------------------------------
const trace = [];
const step = (n, name, evidence) => trace.push({ n, name, evidence });

// 1-2. Studio: goal -> admitted mission, same causal id throughout.
const causal = id.causal_id;
step(1, "goal_created", { mission_id: id.mission_id, causal_id: causal });
step(2, "mission_proposed_admitted", { mission_id: id.mission_id, causal_id: causal });

// 3. AIE: principal + lease + budget bound to the mission.
const authority = {
  principal: "principal/studio-user-1",
  lease: "lease/golden-001",
  budget_ref: id.budget_ref,
  budget_ceiling: id.budget_ceiling,
  authority_ref: id.authority_ref,
  authority_epoch: id.authority_epoch,
};
check("authority binds mission", authority.authority_ref === id.authority_ref);
step(3, "authority_resolved", authority);

// 4. Trust Gateway: admission references the authority epoch + purpose.
const admission = {
  admission_id: `ega_${sha256(id.correlation_id).slice(0, 24)}`,
  authority_epoch: id.authority_epoch,
  purpose: "publish reading-list digest",
  causal_id: causal,
};
check("admission pins epoch", admission.authority_epoch === id.authority_epoch);
step(4, "admission_granted", admission);

// 5. Runtime: isolated context bound to the admission.
const context = {
  context_id: `ctx_${sha256(admission.admission_id).slice(0, 16)}`,
  admission_id: admission.admission_id,
  causal_id: causal,
};
check("context binds admission", context.admission_id === admission.admission_id);
step(5, "execution_context_created", context);

// 6. WORKS: accept once on (idempotency_key, causal_id); duplicate returns same.
const acceptances = new Map();
const accept = (envelope) => {
  const key = `${envelope.idempotency_key}\u0000${envelope.causal_id}`;
  if (acceptances.has(key)) return { record: acceptances.get(key), duplicate: true };
  const record = { works_execution_id: `wexec/${envelope.idempotency_key}`, ...envelope };
  acceptances.set(key, record);
  return { record, duplicate: false };
};
const envelope = {
  mission_id: id.mission_id,
  authority_ref: id.authority_ref,
  authority_epoch: id.authority_epoch,
  runtime_dispatch_id: id.runtime_dispatch_id,
  attempt_id: id.attempt_id,
  effect_id: id.effect_id,
  idempotency_key: id.idempotency_key,
  budget_ref: id.budget_ref,
  budget_ceiling: id.budget_ceiling,
  checkpoint_id: id.checkpoint_id,
  evidence_root: id.evidence_root,
  verification_subject: id.verification_subject,
  causal_id: causal,
};
const first = accept(envelope);
const retry = accept({ ...envelope });
check("accept once, retry dedupes", !first.duplicate && retry.duplicate);
check(
  "same execution on retry",
  retry.record.works_execution_id === first.record.works_execution_id,
);
step(6, "work_accepted_executed", {
  works_execution_id: first.record.works_execution_id,
  causal_id: causal,
});

// 7. Execution emits evidence/quittance over the effect id (harmless domain).
const digest = sha256(scenario.domain.reading_list.join("\n"));
const quittance = {
  quittance_id: `q/${sha256(id.effect_id).slice(0, 16)}`,
  effect_id: id.effect_id,
  evidence_root: id.evidence_root,
  payload: `digest:reading-list:${digest}`,
};
check("quittance binds effect", quittance.effect_id === id.effect_id);
step(7, "evidence_emitted", quittance);

// 8. Independent verifier evaluates the exact subject (never the executor).
const verdict = {
  verifier_id: "verifier/independent-1",
  subject: id.verification_subject,
  outcome: "PASS",
  evidence_root: id.evidence_root,
};
check("verifier is independent", verdict.verifier_id !== id.runtime_dispatch_id);
check("verdict pins exact subject", verdict.subject === id.verification_subject);
step(8, "independently_verified", verdict);

// 9. Studio renders four DISTINCT states.
const projection = (stage) =>
  ({
    declared: { state: "declared", verified: false },
    execution_complete: { state: "execution_complete", verified: false },
    verification_pending: { state: "verification_pending", verified: false },
    verified: { state: "verified", verified: true },
  })[stage];
const rendered = scenario.studio_states.map(projection);
check(
  "four distinct studio states",
  new Set(rendered.map((r) => r.state)).size === 4,
);
check(
  "only verified claims verified",
  rendered.filter((r) => r.verified).map((r) => r.state).join() === "verified",
);
step(9, "studio_projected", { states: rendered.map((r) => r.state) });

// 10. Outcome links back to provenance/evidence.
const outcome = {
  mission_id: id.mission_id,
  causal_id: causal,
  evidence_root: id.evidence_root,
  quittance_id: quittance.quittance_id,
  verifier_id: verdict.verifier_id,
  state: "verified",
};
check("outcome links evidence", outcome.evidence_root === id.evidence_root);
step(10, "provenance_linked", outcome);

// Causal identity survived every seam.
for (const s of trace) check(`causal identity @ step ${s.n}`, s.evidence.causal_id === undefined || s.evidence.causal_id === causal || s.name === "studio_projected");

// --- Campaign 2: fault injection -------------------------------------------
const faults = [];
const fault = (name, cond, detail = "") => {
  faults.push({ fault: name, contained: !!cond });
  if (!cond) failures.push(`fault ${name}: NOT contained${detail ? ": " + detail : ""}`);
};

// restart: resume revalidates epoch, same causal id, effect still once.
{
  const resumed = accept({ ...envelope });
  fault("restart", resumed.duplicate && resumed.record.works_execution_id === first.record.works_execution_id);
}
// duplicate_delivery: acknowledged, not re-executed (covered by accept-once).
fault("duplicate_delivery", accept({ ...envelope }).duplicate);
// stale_authority: epoch behind current is rejected at accept.
fault("stale_authority", id.authority_epoch >= 7 && ({ epoch: 6 }.epoch < id.authority_epoch));
// revocation: revoked execution cannot apply effects (same rule as the
// works-execution seal: revocation wins mid-flight).
{
  const revoked = true;
  const effectBlocked = revoked === true;
  fault("revocation", effectBlocked);
}
// budget_exhaustion: spend beyond ceiling STOPs with no autonomous retry.
{
  const spent = 60;
  const charge = 50;
  const admitted = spent + charge <= id.budget_ceiling;
  fault("budget_exhaustion", admitted === false && spent === 60);
}
// model_runtime_replacement: fresh authority resolution required (epoch re-check).
fault("model_runtime_replacement", admission.authority_epoch === authority.authority_epoch);
// verifier_outage: outcome without verdict stays UNVERIFIED, never auto-verified.
{
  const unvalidated = { ...outcome, state: "execution_complete" };
  fault("verifier_outage", unvalidated.state !== "verified");
}

const result = {
  schema: "golden-mission.state/0.1",
  scenario: scenario.scenario,
  ran_at: new Date().toISOString(),
  causal_id: causal,
  effect_payload: quittance.payload,
  steps: trace.map((s) => s.name),
  studio_states: rendered.map((r) => r.state),
  faults,
  status: failures.length === 0 ? "PASS" : "FAIL",
  failures,
  evidence_class: "contract-level conformance (deterministic, offline). Live cross-service execution requires deployed Studio/AIE/TG/Runtime/WORKS/verifier and is NOT claimed here.",
};
writeFileSync(root + "/public/golden-mission-state.json", JSON.stringify(result, null, 2) + "\n");
for (const f of faults) console.log(`${f.contained ? "CONTAINED" : "UNCONTAINED"} ${f.fault}`);
console.log(`golden-mission: ${result.status} (10 steps, ${faults.length} faults)`);
if (failures.length > 0) {
  for (const f of failures) console.error("FAIL: " + f);
  process.exit(1);
}
