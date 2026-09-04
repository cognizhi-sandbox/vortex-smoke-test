## ADDED Requirements

### Requirement: Invoice — issue and render
The system SHALL enforce the billing-invoices rules recorded here.

#### Scenario: Invoice finalised
- **GIVEN** a caller with a valid session
- **WHEN** the billing-invoices operation is invoked
- **THEN** the operation is recorded and its outcome is returned

#### Scenario: Invalid input
- **GIVEN** a caller with a valid session
- **WHEN** the billing-invoices operation is invoked with input that fails validation
- **THEN** the operation is rejected and nothing is written
