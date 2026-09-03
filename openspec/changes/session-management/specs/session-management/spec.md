# Session Management Specification

## Overview

The session management capability defines how users authenticate to the system and how sessions are managed during their active use.

**Extracted from:** Pet Store Legacy Application (legacy-source/web/WEB-INF/)  
**Confidence:** High (2 rules, 1 ambiguity requiring review)  
**Risk Class:** Operational (authentication, user experience, security posture)

## Rules

### Rule 1: Form-Based Authentication

**Requirement:** The system SHALL use form-based authentication (FORM) for user login. Users authenticate via an HTML login form (username/password submission) rather than alternative mechanisms (HTTP Basic, certificate-based, OAuth, SAML, etc.).

**Confidence:** High

**Trace:** `legacy-source/web/WEB-INF/web.xml:4`

**Implementation:**

```xml
<login-config>
  <auth-method>FORM</auth-method>
</login-config>
```

**Rationale:** Form-based authentication provides a familiar, user-friendly authentication method. Users submit credentials via an HTML form, which the servlet container validates against a configured realm. This is a standard servlet/J2EE pattern and works across all browsers and clients without special configuration.

**Edge Cases:**

- No credentials submitted → Login form displayed
- Invalid credentials → Login form displayed with error message
- Valid credentials → HttpSession created, user redirected to requested resource
- Session exists → User bypasses login form, accesses protected resources

**Implicit Assumptions:**

- An authentication realm is configured (database, LDAP, etc.)
- The login form is accessible without authentication (no chicken-and-egg problem)
- Credentials are transmitted securely (HTTPS expected in production)
- The container handles session creation and JSESSIONID cookie management

---

### Rule 2: Session Timeout

**Requirement:** The system SHALL terminate user sessions after 30 minutes of inactivity. Sessions that remain idle for 30 minutes or more SHALL be automatically invalidated.

GIVEN a session that has been idle for 30 minutes, THEN the session SHALL be terminated.  
GIVEN a request to a protected resource with an expired session, THEN the user SHALL be redirected to the login form.

**Confidence:** Medium

**Trace:** `legacy-source/web/WEB-INF/web.xml:5`

**Implementation:**

```xml
<session-config>
  <session-timeout>30</session-timeout>
</session-config>
```

**Rationale:** The 30-minute timeout balances security (automatic logout prevents unauthorized access if user steps away) with user experience (reasonable time between active sessions without requiring re-authentication for brief interruptions). The timeout applies to **idle time** — any request activity resets the inactivity clock.

**Ambiguity:** The specific value (30 minutes) is a bare literal with no documented business justification. **This requires SME review** to confirm whether the timeout is compliance-driven (regulatory/security standard), performance-driven (server resource constraints), or user experience-driven (balance between usability and security).

**Edge Cases:**

- Session age: 29 minutes, 59 seconds → Valid
- Session age: 30 minutes exactly → Invalidated
- Session age: 30 minutes, 1 second → Invalidated
- Activity at 29 minutes: resets counter → Session valid for another 30 minutes
- Concurrent requests: only last request timestamp considered → No race conditions

**Boundary Condition:** Sessions exactly at 30 minutes of inactivity are invalidated (inclusive boundary).

**Implicit Assumptions:**

- Inactivity is measured from last request timestamp
- All HTTP requests to the application count as activity (reset the timer)
- Non-HTTP requests (direct database access, batch jobs) do NOT reset the timer
- Session invalidation is handled automatically by the servlet container
- User is not explicitly notified of impending timeout (no warning dialogs)

---

## Summary Table

| Rule                      | Status    | Confidence | Notes                                               |
| ------------------------- | --------- | ---------- | --------------------------------------------------- |
| Form-based authentication | Extracted | High       | Declaratively configured; no ambiguities            |
| 30-minute session timeout | Extracted | Medium     | Clearly configured; business rationale undocumented |

## Related Capabilities

- **card-acceptance:** Card validation is independent of session management
- **order-approval:** Order approval rules are independent of session management
- **order-fulfillment:** Fulfillment rules are independent of session management
- **refund-policy:** Refund eligibility is independent of session management

## Regulatory Context

- **Security Standards:** NIST, OWASP recommend session timeouts (typical range: 15-30 minutes)
- **Compliance:** PCI DSS requires "session termination" for payment systems; specific timeout varies
- **User Experience:** Balance between security and usability affects adoption and support costs

## Open Items for SME Review

1. **Session Timeout Rationale:** Document business justification for 30-minute window (compliance, security, performance, or UX)
2. **Timeout Warning:** Should users receive a warning before session expires? (e.g., "Session expiring in 1 minute")
3. **Remember Me:** Should "remember me" or "keep me logged in" features be supported? (extends timeout)
4. **Authorization Model:** No role-based access control (RBAC) is defined at the web tier. Should authorization be enforced here or at the module tier?
5. **Session Binding:** Are sessions bound to IP address or other client identifier? (prevents session hijacking)
6. **Cookie Security:** Are session cookies marked HttpOnly and Secure? (prevents XSS theft and downgrade attacks)
7. **Logout Behavior:** Is logout explicit, or only via timeout? (user experience for "sign out" action)

## Notes

The web tier configuration is minimal and declarative. It delegates actual credential validation to the servlet container's authentication realm. Authorization (determining which authenticated users can access which resources) is **not defined at the web tier** — no `<security-constraint>` elements exist. Authorization logic may be implemented in the application modules (orders, billing) or may not be enforced at all. This should be clarified during implementation.
