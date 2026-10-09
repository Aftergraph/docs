// @ts-nocheck
// Knowledge Plane source verification is historical evidence, not a live lease.
// Do not repin repositories or manufacture freshness when this threshold expires.
export const SOURCE_EVIDENCE_MAX_AGE_DAYS = 7

export function assessSourceEvidence(checkedAt, now = new Date()) {
  const checked = checkedAt ? Date.parse(checkedAt) : NaN
  const present = now instanceof Date ? now.valueOf() : Number(now)
  const ageMs = present - checked
  const valid = Number.isFinite(checked) && Number.isFinite(present) &&
    ageMs >= -300_000 // tolerate at most 5 minutes of clock skew
  const ageDays = valid ? Math.max(0, Math.floor(ageMs / 86_400_000)) : null
  return {
    checked_at: checkedAt || null,
    age_days: ageDays,
    expired: !valid || ageMs > SOURCE_EVIDENCE_MAX_AGE_DAYS * 86_400_000,
  }
}
