# Demo and viva guide

## Five-minute walkthrough

| Time | Screen/source | Explanation |
| --- | --- | --- |
| 0:00–0:45 | Signup and fresh participant | Normal registration, separate history, real sessions |
| 0:45–1:30 | Creator and admin | Create, submit, inspect, approve |
| 1:30–2:30 | Timed attempt | Select, refresh, resume, submit |
| 2:30–3:15 | Results and report | Scores, explanations, native servlet download |
| 3:15–4:15 | Source and schema | OOP contracts, JDBC, foreign keys and transactions |
| 4:15–5:00 | Tests and phone UI | Success/failure cases and responsive layout |

## Questions to practise

**Where is OOP?** Immutable `QuizScore` encapsulates a valid score. The service depends on `ScoringPolicy`, which `MultipleChoiceScoringPolicy` implements. `TextReportFormatter` implements generic `ReportFormatter<T>`. `PerformanceReportServlet` inherits `HttpServlet` and overrides `doGet`.

**Where are collections and generics?** Lists hold questions/reports, maps index saved answers, a set validates allowed question IDs, and streams collect IDs. `ReportFormatter<T>` and `JdbcStore.queryForObject(Class<T>)` use generics.

**Is JdbcTemplate JDBC?** Yes. JdbcStore explicitly creates PreparedStatement objects, binds parameters and retrieves generated identities. JdbcTemplate manages connections and cleanup. SQL and transaction boundaries remain visible. There is no JPA/Hibernate ORM layer.

**Why a server timer?** Refreshing a browser or changing its clock must not extend a quiz. The server persists and checks the original deadline. JavaScript only displays the remaining time.

**How do overlapping requests stay safe?** Tomcat request threads and the expiry scheduler use transactions and row locks. The user lock prevents duplicate starts. The attempt lock serializes answer saves and submission. Submission is idempotent.

**Which servlet is yours?** PerformanceReportServlet at `/reports/attempts/*`. Its doGet validates the path, reads getUserPrincipal(), obtains a permitted submitted attempt and writes a text attachment. Spring's DispatcherServlet separately handles REST.

**How do passwords/roles work?** BCrypt hashes passwords. Spring Security authenticates form login and maintains server sessions. CSRF protects writes. Backend role/ownership checks protect data. Public registration cannot grant admin/creator access.

**Why can displayed 67% fail a 67% threshold?** 2/3 is about 66.67%. The display rounds to 67, but the pass decision uses the exact percentage. A unit test documents that boundary.

**What survives restart?** Accounts/content/results/messages/reminders persist in H2 locally or external PostgreSQL in cloud. Sessions require a fresh login. Active attempts retain saved answers and their original deadline.

**What is outside scope?** Email verification/recovery, push notifications, essay grading and execution of Java submissions. Explain these limits instead of presenting a simulated feature.

## Final check

Open the deck, check screenshot consistency, run `mvn verify`, and ensure reviewers can open the repository. Student/team details and a deadline remain empty unless confirmed.
