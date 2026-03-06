## Description
Provide a brief summary of the changes.

## Architecture Quality Gates
- [ ] **Data Isolation:** No cross-schema SQL joins. Engine A only reads `cluster_a`, and Engine B only reads `cluster_b`.
- [ ] **REST Contract:** Cross-engine communication uses direct REST calls to `/internal/` endpoints with a 5-second timeout.
- [ ] **Saga Pattern:** If this PR touches a cross-engine business transaction, it is modeled as a Saga and includes defined compensation (undo) steps.
- [ ] **Idempotency:** Idempotency keys are checked before processing commands to prevent duplicate execution.

## Reviewer Checklist
- [ ] Unit tests pass for the modified engine.
- [ ] Are all new internal endpoints prefixed with `/internal/`?