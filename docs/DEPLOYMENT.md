# Free hosting

Use Render for the Java Docker web service and Neon for persistent PostgreSQL. Render Free sleeps after 15 minutes without requests and has an ephemeral filesystem. Its free PostgreSQL database expires after 30 days. An external database prevents account/result loss when the web container restarts. [Render free limits](https://render.com/docs/free).

Neon offers a free PostgreSQL plan with usage/storage limits. Verify its current allowance before choosing a plan. [Neon pricing](https://neon.com/pricing), [free storage announcement](https://neon.com/blog/neon-free-plan-1-gb-per-project).

## Database

Create a Neon project on its Free plan. Record its database host, database name, username and password from the connection panel. Store secrets only in Render's environment fields.

```text
DATABASE_URL=jdbc:postgresql://YOUR_HOST/YOUR_DATABASE?sslmode=require
DATABASE_USER=YOUR_DATABASE_USER
DATABASE_PASSWORD=YOUR_DATABASE_PASSWORD
```

Use a JDBC URL starting with `jdbc:postgresql://`. Keep credentials in separate fields rather than pasting a `postgresql://user:password@...` URI.

## Application

Connect the GitHub repository to Render and create a Blueprint from `render.yaml`, or create a Docker Web Service manually. Choose **Free**. The Blueprint sets `plan: free` and prompts for secrets with `sync: false`. [Blueprint documentation](https://render.com/docs/blueprint-spec).

| Variable | Value |
| --- | --- |
| SPRING_PROFILES_ACTIVE | cloud |
| DATABASE_URL | Your JDBC PostgreSQL URL with TLS |
| DATABASE_USER | Private database username |
| DATABASE_PASSWORD | Private database password |
| ADMIN_NAME | Initial admin display name |
| ADMIN_EMAIL | Initial admin sign-in email |
| ADMIN_PASSWORD | Unique password with 12–72 characters |

The Docker build runs tests. The cloud profile uses PostgreSQL, binds `0.0.0.0`, respects the platform PORT, handles forwarded HTTPS headers, enables secure cookies and disables sample accounts/content. Initial provisioning creates one administrator and never resets an existing admin password. Missing credentials on an empty cloud database fail startup.

## Verification after deployment

Open the actual HTTPS URL, register a participant, sign in as configured admin, create a creator, publish a quiz, take it, and download the result. Restart the web service, sign in again, and confirm the account/result persists. Local H2 sample records are not uploaded. Sessions are in memory and restart requires a new login, while saved quiz answers remain in PostgreSQL.

Free hosting has cold starts and provider quotas. It is suitable for a project demonstration, not an uptime guarantee. Email delivery/push notifications are outside scope.

Live URL:
