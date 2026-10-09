import assert from 'node:assert/strict'
import test from 'node:test'
import { assessSourceEvidence, SOURCE_EVIDENCE_MAX_AGE_DAYS } from '../scripts/source-freshness-age.mjs'

const now = new Date('2026-10-09T12:00:00Z')

test('recent exact source verification may be called within window', () => {
  const result = assessSourceEvidence('2026-10-08T12:00:00Z', now)
  assert.equal(result.expired, false)
  assert.equal(result.age_days, 1)
  assert.equal(SOURCE_EVIDENCE_MAX_AGE_DAYS, 7)
})

test('old CURRENT status does not grant evergreen freshness', () => {
  const result = assessSourceEvidence('2026-09-07T20:16:53.593Z', now)
  assert.equal(result.expired, true)
  assert.ok(result.age_days > 30)
})

test('missing invalid and excessively future verification fail closed', () => {
  for (const input of [null, '', 'not-a-time', '2026-10-10T13:00:00Z']) {
    assert.equal(assessSourceEvidence(input, now).expired, true)
  }
})

test('freshness window boundary uses exact 7 days, not rounded displayed age', () => {
  assert.equal(assessSourceEvidence('2026-10-02T12:00:00Z', now).expired, false)
  assert.equal(assessSourceEvidence('2026-10-02T11:59:59Z', now).expired, true)
})
