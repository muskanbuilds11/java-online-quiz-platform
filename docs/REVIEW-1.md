# Review 1 and marking evidence

Project: **QuizNova: Java-Based Online Quiz and Performance Management System**

Student name:

Roll number:

Team name:

The screenshots contain separate GUI and Web rubrics. This is a Java **Web** project. The visible web rubric totals **33 marks**. Category maxima are not predicted or awarded scores.

| Web category | Maximum | Working evidence |
| --- | ---: | --- |
| Problem Understanding & Solution Design | 8 | Three roles, content approval, timed attempts, architecture and ER diagram, responsive screenshots, documented setup |
| Core Java Concepts | 10 | Immutable `QuizScore`, `ScoringPolicy` interface and implementation, generic `ReportFormatter<T>`, `JdbcStore.queryForObject`, List/Map/Set and streams, servlet inheritance, validated exceptions, scheduler and row locks |
| Database Integration (JDBC) | 8 | Eight tables, keys/constraints/indexes, `JdbcStore`, explicitly bound PreparedStatement parameters, generated keys, CRUD, transactions, persistent H2 and PostgreSQL configuration |
| Servlets & Web Integration | 7 | `PerformanceReportServlet extends HttpServlet`, overridden `doGet`, principal/request path and response headers, servlet registration, Tomcat, REST DispatcherServlet, browser fetch, session login and CSRF |
| **Total** | **33** | Final marks belong to the evaluator |

## Required submission evidence

- Project structure and responsibilities: README and source tree.
- Database design and connectivity: ARCHITECTURE.md, schema.sql, JdbcStore, persistence tests.
- UI aesthetics/responsiveness: custom colors, actual Three.js scene, phone navigation, readable forms and stacked tables.
- Presentation: the review deck contains app screenshots, architecture, database design, implementation evidence and a demonstration plan.
- GitHub: https://github.com/muskanbuilds11/java-online-quiz-platform must remain public or accessible to reviewers.
- Code quality: separate controller, service, repository, scoring model/policy, formatter, servlet, configuration and frontend modules.

## Demonstration order

1. Register a fresh participant and show an empty personal history.
2. Create a quiz as creator, submit it, and approve it as admin.
3. Take it as participant, refresh to show autosave and the original timer, then submit.
4. Show scoring, explanations, history, charts, and the downloaded servlet report.
5. Add creator feedback/manual review and reopen the participant report.
6. Show users/settings, private messages, reminders and leaderboard.
7. Run `mvn verify` and open the source evidence for each category.

The GUI rubric is not added to the Web rubric. Its overlapping OOP, collections, background task and JDBC concepts remain demonstrable, but this app uses a web UI instead of Swing/JavaFX.

No deadline or reviewer identity appears in the supplied screenshots. Missing student/team information stays empty. Prepare files and verify access before submitting through the institution's form. This document does not claim institutional submission or an awarded score.
