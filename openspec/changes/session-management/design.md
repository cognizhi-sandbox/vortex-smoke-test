# Session Management Technical Design

## Components

1. **Authentication Mechanism** — HTML form-based login
   - Users submit credentials via HTML login form
   - Form submission handled by servlet container
   - Credentials validated against container-configured realm/security domain

2. **Session Lifecycle Manager** — HTTP session management
   - Sessions created on successful authentication
   - Sessions tracked via HttpSession (servlet API)
   - Inactivity timeout: 30 minutes
   - Idle sessions automatically invalidated

## Authentication Flow

1. User accesses protected resource
2. Unauthenticated → redirected to login form
3. User submits credentials via HTML form
4. Servlet container validates credentials
5. If valid → creates HttpSession, redirects to requested resource
6. If invalid → returns to login form with error

## Session Lifecycle

1. **Creation:** Immediately after successful authentication
2. **Activity:** Session marked active on each request
3. **Inactivity:** 30 minutes without request triggers invalidation
4. **Termination:** Explicit logout or timeout invalidation

## Implementation Notes

### Authentication Configuration

Form-based authentication is declared in `web.xml`:

```xml
<login-config>
  <auth-method>FORM</auth-method>
</login-config>
```

The servlet container handles credential validation using a configured realm (database, LDAP, etc.).

### Session Timeout

Session timeout is declared in `web.xml`:

```xml
<session-config>
  <session-timeout>30</session-timeout>
</session-config>
```

The value is in **minutes**. The container invalidates any session with no activity for ≥30 minutes.

### Session Tracking

Sessions are tracked via HTTP cookies (standard `JSESSIONID` cookie). Cookie-based tracking ensures compatibility with stateless HTTP protocol.

## Configuration

- Authentication method: Form-based (HTML form submission)
- Session timeout: 30 minutes (bare literal, no configuration option)
- Session tracking: HTTP cookies

## Testing Strategy

1. **Unit tests** for session creation/termination logic
2. **Integration tests** for authentication flow
3. **E2E tests** for login → session creation → timeout/logout scenarios
