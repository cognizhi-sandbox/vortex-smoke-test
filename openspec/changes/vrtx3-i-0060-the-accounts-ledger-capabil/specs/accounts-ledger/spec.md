## ADDED Requirements

### Requirement: Ledger posting
The system SHALL enforce the accounts-ledger rules recorded here.

#### Scenario: Balanced posting
- **GIVEN** a caller with a valid session
- **WHEN** the accounts-ledger operation is invoked
- **THEN** the operation is recorded and its outcome is returned

#### Scenario: Invalid input
- **GIVEN** a caller with a valid session
- **WHEN** the accounts-ledger operation is invoked with input that fails validation
- **THEN** the operation is rejected and nothing is written
