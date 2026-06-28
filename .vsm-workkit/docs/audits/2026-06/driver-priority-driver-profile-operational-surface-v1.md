# Driver Priority + Driver Profile Operational Surface v1

Date: 2026-06-24
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

Canonize the source-level closure of the Driver `Prioridad` and driver profile operational lanes that had already landed in the client repo but were still missing accepted canon coverage. This lane establishes the real code surface for driver stats, vehicle/photo/contact data, and QA runtime contract hardening before the later hosted/browser proof lane.

## Code State

- Client repo: `F:\ivoy\ivoy1.6`
- Remote: `ventasdoodles/ivoy`
- Commit: `c1e5c62`
- Message: `feat(client): close priority and driver profile lanes`

## Changes

- `components/DriverPriorityTab.tsx`
  - Renders the premium `Prioridad` stats surface with score, tier, rating scale, review list, connected minutes, streak, and radius-bonus explanation.

- `components/profile/ProfileSettingsTab.tsx`
  - Adds driver-only operational fields for:
    - real driver photo upload
    - operational WhatsApp number
    - vehicle type / make / model / year / plate
    - payout banking data including CLABE

- `components/profile/ProfileDriverOnboardingTab.tsx`
  - Extends driver onboarding so operational contact/vehicle requirements are captured before later profile editing.

- `supabase/migrations/20260624121000_driver_profile_vehicle_v1.sql`
  - Adds vehicle columns plus validation constraints to `public.profiles`.

- `supabase/migrations/20260624150000_driver_profile_photo_v1.sql`
  - Creates the driver photo storage contract for bucket `driver-profile-photos` and the related access model.

- `scripts/qa-runtime-contract-check.cjs`
  - Hardens the non-secret QA runtime contract so this broader driver QA surface can be exercised safely.

- Test coverage added or expanded:
  - `src/test/DriverPriorityTab.test.tsx`
  - `src/test/ProfileDriverOnboardingTab.test.tsx`
  - `src/test/ProfileSettingsTab.driverOperational.test.tsx`
  - `src/test/driverProfileVehicleMigration.test.ts`
  - `src/test/driverProfilePhotoMigration.test.ts`
  - `src/test/qaRuntimeContractCheck.test.ts`
  - `src/test/verifyE2eQaWorkflow.test.ts`

## Evidence

- Fresh focused proof passed on the current code descended from this lane:
  - `npm run test:run -- src/test/DriverPriorityTab.test.tsx src/test/ProfileDriverOnboardingTab.test.tsx src/test/ProfileSettingsTab.driverOperational.test.tsx src/test/qaRuntimeContractCheck.test.ts`
  - result: `9 passed`

- Fresh broad source/build proof passed:
  - `npm run typecheck`
  - `npm run build`
  - `git diff --check`

- Later hosted/browser proof on the same functional surface also exists and remains green on current head:
  - driver priority surface
  - driver profile settings surface
  - those runtime/browser proofs are canonized separately in `hosted-priority-and-driver-profile-browser-qa-v1.md`

## Verification

- `npm run test:run -- src/test/DriverPriorityTab.test.tsx src/test/ProfileDriverOnboardingTab.test.tsx src/test/ProfileSettingsTab.driverOperational.test.tsx src/test/qaRuntimeContractCheck.test.ts`
  - `9` passed.

- `npm run typecheck`
  - Pass.

- `npm run build`
  - Pass.

- `git diff --check`
  - Pass.

## Known Non-Blocking Output

- Build still prints the pre-existing Lightning CSS/Tailwind at-rule warnings and large Mapbox chunk warning.

## Residual Risks

- This lane establishes the source/migration/contract surface and current local proof, not fresh remote Supabase apply proof for the new profile migrations.
- Hosted/browser proof is accepted in a later QA lane, not claimed as originating from this commit itself.
- No physical mobile proof, identity verification of photo realism, payment settlement proof, GPS proof, push/WhatsApp provider proof, or global marketplace completion claim is made.
