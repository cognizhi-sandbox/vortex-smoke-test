## ADDED Requirements

### Requirement: Password login
The system SHALL enforce the identity-user-auth rules recorded here.

#### Scenario: Valid credentials
- **GIVEN** a caller with a valid session
- **WHEN** the identity-user-auth operation is invoked
- **THEN** the operation is recorded and its outcome is returned

#### Scenario: Invalid input
- **GIVEN** a caller with a valid session
- **WHEN** the identity-user-auth operation is invoked with input that fails validation
- **THEN** the operation is rejected and nothing is written
