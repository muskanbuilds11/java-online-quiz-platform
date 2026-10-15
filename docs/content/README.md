# Java starter library

The live QuizNova site contains six approved Java quizzes with 36 questions. Each quiz has six four-option questions, a correct answer and an explanation.

| Quiz | Topic | Duration |
| --- | --- | --- |
| Java foundations | Core Java | 10 minutes |
| Think in objects | Object-oriented programming | 15 minutes |
| Collections, decoded | Collections | 12 minutes |
| Handle the unexpected | Exception handling | 10 minutes |
| Streams & lambdas | Streams and lambdas | 20 minutes |
| Concurrency workshop | Concurrency | 20 minutes |

Reviewers can create a participant account on the [live website](https://quiznova-muskanbuilds11.onrender.com), sign in, choose a quiz and start its timer. The dedicated shared participant demo login is documented in the review presentation. Register a separate account for an independent attempt history.

Each correct answer earns one point. Wrong and unanswered questions earn zero, with no negative marking. Each quiz therefore has a maximum of six points. The current passing threshold is captured when an attempt starts. At the default 60% threshold, four correct answers out of six pass. The result includes explanations and supports a text report download.

## Content files

- `java-starter-quizzes.json` contains the questions and answer keys for review and maintenance. These are intentionally available in this public learning-project repository.
- `import-java-starter-quizzes.sql` imports this bank into PostgreSQL. Run it after the schema and a private administrator have been provisioned. It assigns the quizzes to the first active administrator and publishes them as approved content.

The import runs in one transaction and locks the settings row to serialize simultaneous imports. Its versioned review-note markers prevent duplicate insertion when the unchanged import is run again. It does not alter existing accounts, passwords, attempts or quizzes. Preserve those markers if you need to repeat the import. Content changes should follow the application's normal quiz lifecycle after participants have attempted a quiz.

Only question content was imported into the hosted database. Local sample people, scores, messages and reminders were not uploaded.

## Live verification

On 15 October 2026, the shared participant login was verified through the normal sign-in form. All six quizzes were visible. A Java foundations attempt restored its timer and two saved answers after refresh. Four correct answers, one wrong choice and one unanswered question produced 4/6 (67%) with a pass at the configured 60% threshold. The explanations and native servlet text-report download were verified. This is a real verification attempt in the shared demo account, not a fabricated performance record.
