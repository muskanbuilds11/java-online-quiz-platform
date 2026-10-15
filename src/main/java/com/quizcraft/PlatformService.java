package com.quizcraft;

import static com.quizcraft.ApiController.*;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.*;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

@Service
@EnableScheduling
public class PlatformService {
  private final JdbcStore db;
  private final ScoringPolicy scoring;
  private final PasswordEncoder encoder;
  private final SessionRegistry sessions;

  public PlatformService(
      JdbcStore db, PasswordEncoder encoder, SessionRegistry sessions, ScoringPolicy scoring) {
    this.db = db;
    this.encoder = encoder;
    this.sessions = sessions;
    this.scoring = scoring;
  }

  private void expireSessionsAfterCommit(String email) {
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCommit() {
            for (Object principal : sessions.getAllPrincipals())
              if (principal instanceof UserDetails details && details.getUsername().equals(email))
                sessions.getAllSessions(principal, false).forEach(session -> session.expireNow());
          }
        });
  }

  @Transactional
  public Map<String, Object> saveProfile(String email, ProfileInput input) {
    var u = user(email);
    db.update("UPDATE app_users SET name=? WHERE id=?", input.name().trim(), number(u, "id"));
    return Map.of("message", "Your profile has been updated.");
  }

  @Transactional
  public Map<String, Object> changePassword(String email, PasswordInput input) {
    var u = user(email);
    var account = one("SELECT password_hash FROM app_users WHERE id=? FOR UPDATE", number(u, "id"));
    String hash = (String) account.get("passwordHash");
    if (!encoder.matches(input.currentPassword(), hash))
      throw fail(HttpStatus.BAD_REQUEST, "Your current password is incorrect.");
    if (encoder.matches(input.newPassword(), hash))
      throw fail(HttpStatus.BAD_REQUEST, "Choose a different new password.");
    db.update(
        "UPDATE app_users SET password_hash=? WHERE id=?",
        encoder.encode(input.newPassword()),
        number(u, "id"));
    expireSessionsAfterCommit(email);
    return Map.of("message", "Password updated. Sign in again with your new password.");
  }

  private List<Map<String, Object>> rows(String sql, Object... args) {
    return db.rows(sql, args);
  }

  private Map<String, Object> one(String sql, Object... args) {
    return db.one(sql, args);
  }

  private long insert(String sql, Object... args) {
    return db.insert(sql, args);
  }

  static long number(Map<String, Object> row, String key) {
    return ((Number) row.get(key)).longValue();
  }

  static ResponseStatusException fail(HttpStatus status, String message) {
    return new ResponseStatusException(status, message);
  }

  private int count(String sql, Object... args) {
    return db.queryForObject(sql, Integer.class, args);
  }

  private Map<String, Object> user(String email) {
    var u = one("SELECT id,name,email,role,active,created_at FROM app_users WHERE email=?", email);
    if (!Boolean.TRUE.equals(u.get("active")))
      throw fail(
          HttpStatus.UNAUTHORIZED,
          "This account is inactive. Please sign in with an active account.");
    return u;
  }

  private void role(Map<String, Object> u, String... roles) {
    if (!Arrays.asList(roles).contains(u.get("role")))
      throw fail(HttpStatus.FORBIDDEN, "Your role cannot perform this action.");
  }

  private Map<String, Object> settings() {
    return one("SELECT * FROM system_settings WHERE id=1");
  }

  private void ownsQuiz(Map<String, Object> u, Map<String, Object> q) {
    role(u, "ADMIN", "CREATOR");
    if (!u.get("role").equals("ADMIN") && number(q, "creatorId") != number(u, "id"))
      throw fail(HttpStatus.FORBIDDEN, "This quiz belongs to another creator.");
  }

  private Map<String, Object> quiz(long id) {
    return one("SELECT * FROM quizzes WHERE id=?", id);
  }

  private Map<String, Object> lockedAttempt(long id) {
    return one("SELECT * FROM attempts WHERE id=? FOR UPDATE", id);
  }

  private void ownsAttempt(Map<String, Object> u, Map<String, Object> a) {
    if (number(a, "participantId") != number(u, "id"))
      throw fail(HttpStatus.FORBIDDEN, "This attempt belongs to another participant.");
  }

  private void readableAttempt(Map<String, Object> u, Map<String, Object> a) {
    boolean owner = number(a, "participantId") == number(u, "id");
    boolean creator =
        u.get("role").equals("CREATOR")
            && number(quiz(number(a, "quizId")), "creatorId") == number(u, "id");
    if (!owner && !creator && !u.get("role").equals("ADMIN"))
      throw fail(HttpStatus.FORBIDDEN, "You cannot view this report.");
  }

  @Transactional
  public Map<String, Object> register(Register input) {
    if (Boolean.TRUE.equals(settings().get("maintenance")))
      throw fail(HttpStatus.SERVICE_UNAVAILABLE, "Registration is paused during maintenance.");
    String email = input.email().trim().toLowerCase(Locale.ROOT);
    if (count("SELECT COUNT(*) FROM app_users WHERE email=?", email) > 0)
      throw fail(HttpStatus.CONFLICT, "An account with this email already exists.");
    long id =
        insert(
            "INSERT INTO app_users(name,email,password_hash,role,active,created_at)"
                + " VALUES(?,?,?,'PARTICIPANT',TRUE,?)",
            input.name().trim(),
            email,
            encoder.encode(input.password()),
            System.currentTimeMillis());
    return Map.of("id", id, "message", "Your account is ready. Sign in to begin.");
  }

  @Transactional
  public Map<String, Object> saveUser(String email, Long id, UserInput input) {
    one("SELECT id FROM system_settings WHERE id=1 FOR UPDATE");
    var actor = user(email);
    role(actor, "ADMIN");
    if (!Set.of("ADMIN", "CREATOR", "PARTICIPANT").contains(input.role()))
      throw fail(HttpStatus.BAD_REQUEST, "Choose a valid role.");
    String address = input.email().trim().toLowerCase(Locale.ROOT);
    if (count(
            "SELECT COUNT(*) FROM app_users WHERE email=? AND id<>?", address, id == null ? -1 : id)
        > 0) throw fail(HttpStatus.CONFLICT, "This email is already in use.");
    if (id == null) {
      if (input.password() == null || input.password().length() < 8)
        throw fail(HttpStatus.BAD_REQUEST, "New users need a password of at least 8 characters.");
      id =
          insert(
              "INSERT INTO app_users(name,email,password_hash,role,active,created_at)"
                  + " VALUES(?,?,?,?,?,?)",
              input.name().trim(),
              address,
              encoder.encode(input.password()),
              input.role(),
              input.active(),
              System.currentTimeMillis());
    } else {
      var existing = one("SELECT * FROM app_users WHERE id=? FOR UPDATE", id);
      if (id == number(actor, "id")
          && (!input.active() || !input.role().equals("ADMIN") || !address.equals(email)))
        throw fail(
            HttpStatus.BAD_REQUEST,
            "Keep your own admin account active with its current email and role.");
      if (existing.get("role").equals("ADMIN")
          && Boolean.TRUE.equals(existing.get("active"))
          && (!input.active() || !input.role().equals("ADMIN"))
          && count("SELECT COUNT(*) FROM app_users WHERE role='ADMIN' AND active=TRUE") <= 1)
        throw fail(HttpStatus.BAD_REQUEST, "At least one active administrator is required.");
      db.update(
          "UPDATE app_users SET name=?,email=?,role=?,active=? WHERE id=?",
          input.name().trim(),
          address,
          input.role(),
          input.active(),
          id);
      if (input.password() != null && !input.password().isBlank()) {
        if (input.password().length() < 8)
          throw fail(HttpStatus.BAD_REQUEST, "Password must contain at least 8 characters.");
        db.update(
            "UPDATE app_users SET password_hash=? WHERE id=?",
            encoder.encode(input.password()),
            id);
      }
      if (!input.active()
          || !input.role().equals(existing.get("role"))
          || !address.equals(existing.get("email"))
          || (input.password() != null && !input.password().isBlank()))
        expireSessionsAfterCommit((String) existing.get("email"));
    }
    return Map.of("id", id, "message", "User saved successfully.");
  }

  @Transactional
  public Map<String, Object> deactivateUser(String email, long id) {
    one("SELECT id FROM system_settings WHERE id=1 FOR UPDATE");
    var actor = user(email);
    role(actor, "ADMIN");
    if (number(actor, "id") == id)
      throw fail(HttpStatus.BAD_REQUEST, "You cannot deactivate your own account.");
    var target = one("SELECT * FROM app_users WHERE id=? FOR UPDATE", id);
    if (target.get("role").equals("ADMIN")
        && Boolean.TRUE.equals(target.get("active"))
        && count("SELECT COUNT(*) FROM app_users WHERE role='ADMIN' AND active=TRUE") <= 1)
      throw fail(HttpStatus.BAD_REQUEST, "At least one active administrator is required.");
    db.update("UPDATE app_users SET active=FALSE WHERE id=?", id);
    expireSessionsAfterCommit((String) target.get("email"));
    return Map.of("message", "Account deactivated. Quiz history is preserved.");
  }

  @Transactional
  public Map<String, Object> saveQuiz(String email, Long id, QuizInput input) {
    var u = user(email);
    role(u, "CREATOR", "ADMIN");
    if (!Set.of("Beginner", "Intermediate", "Advanced").contains(input.difficulty()))
      throw fail(HttpStatus.BAD_REQUEST, "Choose a valid difficulty.");
    String status = input.submitForReview() ? "PENDING" : "DRAFT";
    if (id == null) {
      id =
          insert(
              "INSERT INTO"
                  + " quizzes(title,description,topic,difficulty,duration_minutes,creator_id,status,created_at)"
                  + " VALUES(?,?,?,?,?,?,?,?)",
              input.title().trim(),
              input.description().trim(),
              input.topic().trim(),
              input.difficulty(),
              input.durationMinutes(),
              number(u, "id"),
              status,
              System.currentTimeMillis());
    } else {
      var q = one("SELECT * FROM quizzes WHERE id=? FOR UPDATE", id);
      ownsQuiz(u, q);
      if (count("SELECT COUNT(*) FROM attempts WHERE quiz_id=?", id) > 0)
        throw fail(
            HttpStatus.CONFLICT,
            "This quiz already has attempts. Create a new quiz to preserve existing reports.");
      db.update(
          "UPDATE quizzes SET"
              + " title=?,description=?,topic=?,difficulty=?,duration_minutes=?,status=?,review_note=''"
              + " WHERE id=?",
          input.title().trim(),
          input.description().trim(),
          input.topic().trim(),
          input.difficulty(),
          input.durationMinutes(),
          status,
          id);
      db.update("DELETE FROM questions WHERE quiz_id=?", id);
    }
    int position = 0;
    for (var q : input.questions())
      db.update(
          "INSERT INTO"
              + " questions(quiz_id,position,prompt,option_a,option_b,option_c,option_d,correct_index,explanation)"
              + " VALUES(?,?,?,?,?,?,?,?,?)",
          id,
          position++,
          q.prompt().trim(),
          q.options().get(0).trim(),
          q.options().get(1).trim(),
          q.options().get(2).trim(),
          q.options().get(3).trim(),
          q.correctIndex(),
          q.explanation().trim());
    return Map.of(
        "id",
        id,
        "message",
        input.submitForReview() ? "Quiz submitted for admin approval." : "Draft saved.");
  }

  public Map<String, Object> editQuiz(String email, long id) {
    var u = user(email);
    var q = quiz(id);
    ownsQuiz(u, q);
    q.put("questions", questionList(id, true));
    return q;
  }

  @Transactional
  public Map<String, Object> deleteQuiz(String email, long id) {
    var u = user(email);
    var q = one("SELECT * FROM quizzes WHERE id=? FOR UPDATE", id);
    ownsQuiz(u, q);
    if (count("SELECT COUNT(*) FROM attempts WHERE quiz_id=?", id) > 0)
      throw fail(
          HttpStatus.CONFLICT,
          "Quizzes with attempts cannot be deleted. Their reports must remain available.");
    db.update("DELETE FROM reminders WHERE quiz_id=?", id);
    db.update("DELETE FROM quizzes WHERE id=?", id);
    return Map.of("message", "Quiz deleted.");
  }

  @Transactional
  public Map<String, Object> review(String email, long id, ReviewInput input) {
    role(user(email), "ADMIN");
    if (!Set.of("APPROVED", "REJECTED").contains(input.status()))
      throw fail(HttpStatus.BAD_REQUEST, "Choose approved or rejected.");
    var q = one("SELECT * FROM quizzes WHERE id=? FOR UPDATE", id);
    if (!q.get("status").equals("PENDING"))
      throw fail(HttpStatus.CONFLICT, "Only submitted quizzes can be reviewed.");
    if (input.status().equals("REJECTED") && (input.note() == null || input.note().isBlank()))
      throw fail(HttpStatus.BAD_REQUEST, "Add a reason so the creator can revise the quiz.");
    db.update(
        "UPDATE quizzes SET status=?,review_note=? WHERE id=?",
        input.status(),
        Objects.requireNonNullElse(input.note(), ""),
        id);
    return Map.of(
        "message",
        input.status().equals("APPROVED")
            ? "Quiz approved and published."
            : "Quiz returned to the creator.");
  }

  private List<Map<String, Object>> questionList(long quizId, boolean reveal) {
    var result = rows("SELECT * FROM questions WHERE quiz_id=? ORDER BY position", quizId);
    for (var q : result) {
      q.put(
          "options",
          List.of(
              q.remove("optionA"), q.remove("optionB"), q.remove("optionC"), q.remove("optionD")));
      if (!reveal) {
        q.remove("correctIndex");
        q.remove("explanation");
      }
    }
    return result;
  }

  @Transactional
  public Map<String, Object> start(String email, long quizId) {
    var u = user(email);
    role(u, "PARTICIPANT");
    long uid = number(u, "id");
    one("SELECT id FROM app_users WHERE id=? FOR UPDATE", uid);
    var existing =
        rows(
            "SELECT * FROM attempts WHERE quiz_id=? AND participant_id=? AND submitted_at IS NULL",
            quizId,
            uid);
    if (!existing.isEmpty()) {
      var active = existing.get(0);
      if (number(active, "deadlineAt") > System.currentTimeMillis())
        return attempt(email, number(active, "id"));
      finish(number(active, "id"));
    }
    var s = settings();
    if (Boolean.TRUE.equals(s.get("maintenance")))
      throw fail(
          HttpStatus.SERVICE_UNAVAILABLE,
          "New quizzes are paused for maintenance. Existing attempts can still be submitted.");
    var q = one("SELECT * FROM quizzes WHERE id=? FOR UPDATE", quizId);
    if (!q.get("status").equals("APPROVED"))
      throw fail(HttpStatus.BAD_REQUEST, "This quiz is not published.");
    if (count("SELECT COUNT(*) FROM attempts WHERE quiz_id=? AND participant_id=?", quizId, uid)
        >= number(s, "maxAttempts"))
      throw fail(HttpStatus.CONFLICT, "You have reached the attempt limit for this quiz.");
    long now = System.currentTimeMillis();
    int total = count("SELECT COUNT(*) FROM questions WHERE quiz_id=?", quizId);
    long id =
        insert(
            "INSERT INTO attempts(quiz_id,participant_id,started_at,deadline_at,total,pass_percent)"
                + " VALUES(?,?,?,?,?,?)",
            quizId,
            uid,
            now,
            now + number(q, "durationMinutes") * 60000,
            total,
            number(s, "passPercent"));
    return attempt(email, id);
  }

  private void enrichAttempt(Map<String, Object> a) {
    long score = a.get("manualScore") == null ? number(a, "score") : number(a, "manualScore");
    QuizScore result =
        scoring.evaluate((int) score, (int) number(a, "total"), (int) number(a, "passPercent"));
    a.put("effectiveScore", score);
    a.put("percent", result.percentage());
    a.put("passed", result.passed());
  }

  @Transactional
  public Map<String, Object> attempt(String email, long id) {
    var u = user(email);
    var a = lockedAttempt(id);
    readableAttempt(u, a);
    if (a.get("submittedAt") == null && number(a, "deadlineAt") <= System.currentTimeMillis()) {
      finish(id);
      a = lockedAttempt(id);
    }
    var q = quiz(number(a, "quizId"));
    a.put("title", q.get("title"));
    a.put("topic", q.get("topic"));
    a.put(
        "participantName",
        one("SELECT name FROM app_users WHERE id=?", number(a, "participantId")).get("name"));
    boolean submitted = a.get("submittedAt") != null;
    if (!submitted && number(a, "participantId") != number(u, "id"))
      throw fail(HttpStatus.CONFLICT, "This participant is still taking the quiz.");
    a.put("questions", questionList(number(a, "quizId"), submitted));
    a.put("answers", rows("SELECT question_id,selected_index FROM answers WHERE attempt_id=?", id));
    a.put("serverNow", System.currentTimeMillis());
    enrichAttempt(a);
    return a;
  }

  @Transactional
  public Map<String, Object> saveAnswers(String email, long id, AnswerInput input, boolean submit) {
    var u = user(email);
    var a = lockedAttempt(id);
    ownsAttempt(u, a);
    if (a.get("submittedAt") != null) return attempt(email, id);
    if (number(a, "deadlineAt") <= System.currentTimeMillis()) {
      finish(id);
      return attempt(email, id);
    }
    Set<Long> valid =
        rows("SELECT id FROM questions WHERE quiz_id=?", number(a, "quizId")).stream()
            .map(q -> number(q, "id"))
            .collect(Collectors.toSet());
    for (var answer : input.answers().entrySet()) {
      if (!valid.contains(answer.getKey()) || answer.getValue() == null)
        throw fail(HttpStatus.BAD_REQUEST, "One of the answers does not belong to this quiz.");
      if (db.update(
              "UPDATE answers SET selected_index=? WHERE attempt_id=? AND question_id=?",
              answer.getValue(),
              id,
              answer.getKey())
          == 0)
        db.update(
            "INSERT INTO answers(attempt_id,question_id,selected_index) VALUES(?,?,?)",
            id,
            answer.getKey(),
            answer.getValue());
    }
    if (submit) finish(id);
    return attempt(email, id);
  }

  private void finish(long id) {
    var a = lockedAttempt(id);
    if (a.get("submittedAt") != null) return;
    int score =
        count(
            "SELECT COUNT(*) FROM answers a JOIN questions q ON a.question_id=q.id WHERE"
                + " a.attempt_id=? AND a.selected_index=q.correct_index",
            id);
    db.update(
        "UPDATE attempts SET score=?,submitted_at=? WHERE id=? AND submitted_at IS NULL",
        score,
        Math.min(System.currentTimeMillis(), number(a, "deadlineAt")),
        id);
  }

  @Scheduled(fixedDelay = 15000)
  @Transactional
  public void expireAttempts() {
    for (var a :
        rows(
            "SELECT id FROM attempts WHERE submitted_at IS NULL AND deadline_at<=?",
            System.currentTimeMillis())) finish(number(a, "id"));
  }

  @Transactional
  public Map<String, Object> grade(String email, long id, GradeInput input) {
    var u = user(email);
    var a = lockedAttempt(id);
    ownsQuiz(u, quiz(number(a, "quizId")));
    if (a.get("submittedAt") == null)
      throw fail(HttpStatus.CONFLICT, "Wait for the participant to submit.");
    if (input.score() > number(a, "total"))
      throw fail(HttpStatus.BAD_REQUEST, "Score cannot exceed the number of questions.");
    db.update(
        "UPDATE attempts SET manual_score=?,grade_feedback=?,reviewed_by=? WHERE id=?",
        input.score(),
        input.feedback().trim(),
        number(u, "id"),
        id);
    return Map.of("message", "Review and grade saved.");
  }

  @Transactional
  public Map<String, Object> sendMessage(String email, MessageInput input) {
    var sender = user(email);
    var recipient = one("SELECT id,role,active FROM app_users WHERE id=?", input.recipientId());
    if (!Boolean.TRUE.equals(recipient.get("active")))
      throw fail(HttpStatus.BAD_REQUEST, "This recipient is inactive.");
    String from = sender.get("role").toString(), to = recipient.get("role").toString();
    if (!(from.equals("PARTICIPANT") && to.equals("CREATOR")
        || from.equals("CREATOR") && to.equals("PARTICIPANT")))
      throw fail(
          HttpStatus.FORBIDDEN, "Messages are available between participants and quiz creators.");
    long id =
        insert(
            "INSERT INTO messages(sender_id,recipient_id,body,created_at) VALUES(?,?,?,?)",
            number(sender, "id"),
            input.recipientId(),
            input.body().trim(),
            System.currentTimeMillis());
    return Map.of("id", id, "message", "Message sent.");
  }

  @Transactional
  public Map<String, Object> addReminder(String email, ReminderInput input) {
    var u = user(email);
    role(u, "PARTICIPANT");
    if (!quiz(input.quizId()).get("status").equals("APPROVED"))
      throw fail(HttpStatus.BAD_REQUEST, "Choose a published quiz.");
    if (input.remindAt() <= System.currentTimeMillis())
      throw fail(HttpStatus.BAD_REQUEST, "Choose a future reminder time.");
    long id =
        insert(
            "INSERT INTO reminders(user_id,quiz_id,remind_at,created_at) VALUES(?,?,?,?)",
            number(u, "id"),
            input.quizId(),
            input.remindAt(),
            System.currentTimeMillis());
    return Map.of("id", id, "message", "Reminder saved. It will appear in your dashboard alerts.");
  }

  @Transactional
  public Map<String, Object> deleteReminder(String email, long id) {
    var u = user(email);
    if (db.update("DELETE FROM reminders WHERE id=? AND user_id=?", id, number(u, "id")) == 0)
      throw fail(HttpStatus.NOT_FOUND, "Reminder not found.");
    return Map.of("message", "Reminder removed.");
  }

  @Transactional
  public Map<String, Object> saveSettings(String email, SettingsInput input) {
    role(user(email), "ADMIN");
    db.update(
        "UPDATE system_settings SET"
            + " site_name=?,pass_percent=?,default_duration=?,max_attempts=?,maintenance=? WHERE"
            + " id=1",
        input.siteName().trim(),
        input.passPercent(),
        input.defaultDuration(),
        input.maxAttempts(),
        input.maintenance());
    return Map.of("message", "System settings updated.");
  }

  @Transactional
  public Map<String, Object> bootstrap(String email) {
    var u = user(email);
    long uid = number(u, "id");
    String r = u.get("role").toString();
    for (var a :
        rows(
            "SELECT id FROM attempts WHERE submitted_at IS NULL AND deadline_at<=?",
            System.currentTimeMillis())) finish(number(a, "id"));
    String filter =
        r.equals("ADMIN")
            ? ""
            : r.equals("CREATOR") ? " WHERE q.creator_id=" + uid : " WHERE q.status='APPROVED'";
    var quizzes =
        rows(
            "SELECT q.*,u.name AS creator_name,(SELECT COUNT(*) FROM questions x WHERE"
                + " x.quiz_id=q.id) AS question_count,(SELECT COUNT(*) FROM attempts a WHERE"
                + " a.quiz_id=q.id AND a.submitted_at IS NOT NULL) AS attempt_count FROM quizzes q"
                + " JOIN app_users u ON q.creator_id=u.id"
                + filter
                + " ORDER BY q.created_at DESC");
    String attemptFilter =
        r.equals("ADMIN")
            ? ""
            : r.equals("CREATOR") ? " WHERE q.creator_id=" + uid : " WHERE a.participant_id=" + uid;
    var attempts =
        rows(
            "SELECT a.*,q.title,q.topic,u.name AS participant_name FROM attempts a JOIN quizzes q"
                + " ON q.id=a.quiz_id JOIN app_users u ON u.id=a.participant_id"
                + attemptFilter
                + " ORDER BY a.started_at DESC");
    attempts.forEach(this::enrichAttempt);
    var messages =
        rows(
            "SELECT m.*,s.name AS sender_name,r.name AS recipient_name FROM messages m JOIN"
                + " app_users s ON m.sender_id=s.id JOIN app_users r ON m.recipient_id=r.id WHERE"
                + " m.sender_id=? OR m.recipient_id=? ORDER BY m.created_at",
            uid,
            uid);
    List<Map<String, Object>> contacts =
        r.equals("ADMIN")
            ? List.of()
            : rows(
                "SELECT id,name,role FROM app_users WHERE active=TRUE AND role=? ORDER BY name",
                r.equals("CREATOR") ? "PARTICIPANT" : "CREATOR");
    var reminders =
        rows(
            "SELECT r.*,q.title FROM reminders r JOIN quizzes q ON r.quiz_id=q.id WHERE r.user_id=?"
                + " ORDER BY r.remind_at",
            uid);
    var users =
        r.equals("ADMIN")
            ? rows(
                "SELECT id,name,email,role,active,created_at FROM app_users ORDER BY created_at"
                    + " DESC")
            : List.of();
    var leaders =
        rows(
            "SELECT u.id,u.name,COUNT(b.quiz_id) AS quizzes,ROUND(AVG(b.best_percent)) AS"
                + " average_score,SUM(b.best_percent) AS points FROM app_users u JOIN (SELECT"
                + " participant_id,quiz_id,MAX(COALESCE(manual_score,score)*100.0/total) AS"
                + " best_percent FROM attempts WHERE submitted_at IS NOT NULL GROUP BY"
                + " participant_id,quiz_id) b ON b.participant_id=u.id WHERE u.active=TRUE AND"
                + " u.role='PARTICIPANT' GROUP BY u.id,u.name ORDER BY points DESC,average_score"
                + " DESC,u.name");
    for (int i = 0; i < leaders.size(); i++) leaders.get(i).put("rank", i + 1);
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("user", u);
    data.put("settings", settings());
    data.put("quizzes", quizzes);
    data.put("attempts", attempts);
    data.put("messages", messages);
    data.put("contacts", contacts);
    data.put("reminders", reminders);
    data.put("users", users);
    data.put("leaderboard", leaders);
    data.put("serverNow", System.currentTimeMillis());
    return data;
  }
}
