# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# ADOPTION REVIEW — A71 EXACT-PATH IMPROVEMENT SCOPE EXPANSION

## 1. qué cambió

Committed `HEAD` shows that A71 did not land as one perfectly narrow lane.

It landed as:

- [2b8be13](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts): exact-path improvement in the originally approved 3-file core
- [33aa6b0](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-mappers.ts): extra public-contract propagation for `description`
- [0ddf854](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/AUDIT_LOG.md): canon reconciliation

So the package is broader than the previously approved narrow 3-file lane.

## 2. qué quedó validado

What actually changed in committed `HEAD`:

- [src/services/ai-capsule-orchestrator.service.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
  - exact query now selects `description, specs`
  - mapper now carries `description`
- [src/lib/product-search-capsule.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts)
  - BRANCH C now uses tiering:
    - `ai_sales_note`
    - then `specs`
    - then generic fallback
- [src/lib/ai-capsule-schemas.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts)
  - `internalResolvedProductSchema` adds `description`
  - `publicAttachmentSchema` also adds `description`
- [src/lib/ai-capsule-mappers.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-mappers.ts)
  - frontend attachment mapping now propagates `description`
- [AUDIT_LOG.md](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/AUDIT_LOG.md)
  - A71 documents the whole package as one reconciliation
- [AI_CONTEXT.md](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/AI_CONTEXT.md)
  - summarizes A71 as exact-path improvement with full context lift

Cold judgment on necessity:

- The 3-file core was **necessary** for the approved exact-path fix.
- The public attachment propagation was **not necessary** for BRANCH C itself.
- It is better classified as **contract alignment** or **scope expansion**, not as required exact-path behavior.

Phrase accuracy:

- `no new field bridges` is **not soberly accurate** for the package as a whole.
- Why:
  - [33aa6b0](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-mappers.ts) explicitly propagates `description` into the public attachment contract
  - that is a real downstream field propagation step, even if small

## 3. qué sigue abierto

What remains open is not code integrity but classification discipline.

The package should not be narrated as one purely narrow exact-path lane without qualification, because:

- exact-path improvement and contract alignment were separate commits
- the public attachment propagation exceeded the originally justified minimum for BRANCH C

The docs are mostly sober on the code facts, but one canon phrase is too aggressive:

- `No new field bridges`

That phrase is only defensible if talking narrowly about BRANCH C drafting behavior after `description` was already available elsewhere.
It is not accurate for the full reconciled package that added public attachment propagation.

## 4. qué se aprueba

**APPROVE-WITH-QUALIFICATION**

Best factual classification:

- **exact-path improvement + contract alignment**

Not best classification:

- exact-path improvement only

If you want maximum precision, split A71 into these factual subclaims:

1. exact-path improvement
   - query lift
   - internal mapper/schema lift
   - BRANCH C fallback naturalness
2. downstream contract alignment
   - `publicAttachmentSchema`
   - `ai-capsule-mappers.ts`

Canon sobriety:

- [AI_CONTEXT.md](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/AI_CONTEXT.md) is broadly accurate but slightly too compressed
- [AUDIT_LOG.md](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/AUDIT_LOG.md) is structurally accurate on file facts, but the line `No new field bridges` is not canonically clean for the full package

## 5. cuál es la siguiente jugada exacta

Do not reopen implementation.

If canon is reconciled later, the exact correction should be:

- keep A71 as adopted
- rephrase it as:
  - `exact-path improvement with small public-contract alignment`
- remove or narrow the claim:
  - `No new field bridges`

Most precise safe wording:

`A71 was a real exact-path improvement, plus a small downstream contract-alignment step for description propagation.`
