package com.quizcraft;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.*;

@SpringBootTest(
    properties = {
      "spring.datasource.url=${TEST_DATABASE_URL:jdbc:h2:mem:quiztest;DB_CLOSE_DELAY=-1}",
      "spring.datasource.username=${TEST_DATABASE_USER:sa}",
      "spring.datasource.password=${TEST_DATABASE_PASSWORD:}",
      "quizcraft.seed-demo=true"
    })
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class PlatformIntegrationTest {
  @Test
  @Order(15)
  void simultaneousStartRequestsShareOneActiveAttempt() throws Exception {
    String email = "parallel@example.test";
    send(
        "POST",
        "/api/auth/register",
        null,
        Map.of("name", "Parallel Learner", "email", email, "password", "ParallelTest123!"),
        200);
    var pool = java.util.concurrent.Executors.newFixedThreadPool(6);
    try {
      var gate = new java.util.concurrent.CountDownLatch(1);
      var tasks = new ArrayList<java.util.concurrent.Future<Long>>();
      for (int i = 0; i < 6; i++)
        tasks.add(
            pool.submit(
                () -> {
                  gate.await();
                  return send("POST", "/api/quizzes/" + quizId + "/start", email, null, 200)
                      .path("id")
                      .asLong();
                }));
      gate.countDown();
      var ids = new HashSet<Long>();
      for (var task : tasks) ids.add(task.get(15, java.util.concurrent.TimeUnit.SECONDS));
      assertEquals(1, ids.size());
      assertEquals(
          1,
          db.queryForObject(
              "SELECT COUNT(*) FROM attempts a JOIN app_users u ON a.participant_id=u.id WHERE"
                  + " u.email=?",
              Integer.class,
              email));
    } finally {
      pool.shutdownNow();
    }
  }

  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired JdbcTemplate db;
  @Autowired PasswordEncoder encoder;
  static long quizId, attemptId, questionId, newUserId;
  static final String participant = "participant@quizcraft.dev",
      creator = "creator@quizcraft.dev",
      admin = "admin@quizcraft.dev";

  Map<String, Object> quizPayload(boolean submit) {
    return Map.of(
        "title",
        "Integration quiz",
        "description",
        "A meaningful end-to-end test.",
        "topic",
        "Core Java",
        "difficulty",
        "Beginner",
        "durationMinutes",
        1,
        "submitForReview",
        submit,
        "questions",
        List.of(
            Map.of(
                "prompt",
                "Which is the JVM?",
                "options",
                List.of("A compiler", "A virtual machine", "An editor", "A library"),
                "correctIndex",
                1,
                "explanation",
                "The JVM executes bytecode.")));
  }

  MockHttpSession login(String email, String password) throws Exception {
    return (MockHttpSession)
        mvc.perform(
                post("/api/auth/login")
                    .with(csrf())
                    .param("email", email)
                    .param("password", password))
            .andExpect(status().isOk())
            .andExpect(authenticated())
            .andReturn()
            .getRequest()
            .getSession(false);
  }

  @Test
  @Order(13)
  void realRegistrationLoginPasswordChangeAndLogout() throws Exception {
    String email = "real.learner@example.com",
        original = "MyPassword123!",
        updated = "UpdatedPassword456!";
    send(
        "POST",
        "/api/auth/register",
        null,
        Map.of("name", "Real Learner", "email", email, "password", original),
        200);
    send(
        "POST",
        "/api/auth/register",
        null,
        Map.of("name", "Duplicate", "email", email, "password", original),
        409);
    String stored =
        db.queryForObject("SELECT password_hash FROM app_users WHERE email=?", String.class, email);
    assertNotEquals(original, stored);
    assertTrue(encoder.matches(original, stored));
    var first = login(email, original);
    var second = login(email, original);
    var boot =
        mvc.perform(get("/api/bootstrap").session(first)).andExpect(status().isOk()).andReturn();
    var payload = json.readTree(boot.getResponse().getContentAsString());
    assertEquals("PARTICIPANT", payload.path("user").path("role").asText());
    assertEquals(0, payload.path("attempts").size());
    assertFalse(payload.toString().contains("passwordHash"));
    mvc.perform(
            put("/api/account/profile")
                .session(first)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Updated Learner\"}"))
        .andExpect(status().isOk());
    assertEquals(
        "Updated Learner",
        db.queryForObject("SELECT name FROM app_users WHERE email=?", String.class, email));
    mvc.perform(
            put("/api/account/password")
                .session(first)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    json.writeValueAsBytes(
                        Map.of("currentPassword", "WrongPassword", "newPassword", updated))))
        .andExpect(status().isBadRequest());
    mvc.perform(get("/api/bootstrap").session(second)).andExpect(status().isOk());
    mvc.perform(
            put("/api/account/password")
                .session(first)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    json.writeValueAsBytes(
                        Map.of("currentPassword", original, "newPassword", updated))))
        .andExpect(status().isOk());
    mvc.perform(get("/api/bootstrap").session(first)).andExpect(status().isUnauthorized());
    mvc.perform(get("/api/bootstrap").session(second)).andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/auth/login").with(csrf()).param("email", email).param("password", original))
        .andExpect(status().isUnauthorized());
    var fresh = login(email, updated);
    mvc.perform(post("/api/auth/logout").session(fresh).with(csrf()))
        .andExpect(status().isNoContent());
    assertTrue(fresh.isInvalid());
    mvc.perform(get("/api/bootstrap")).andExpect(status().isUnauthorized());
  }

  @Test
  @Order(14)
  void adminPasswordResetAndDeactivationRevokeExistingLogins() throws Exception {
    String email = "revocation@example.com",
        password = "AccountPass123!",
        reset = "ResetPassword456!";
    long id =
        send(
                "POST",
                "/api/users",
                admin,
                Map.of(
                    "name",
                    "Revocation User",
                    "email",
                    email,
                    "role",
                    "PARTICIPANT",
                    "password",
                    password,
                    "active",
                    true),
                200)
            .path("id")
            .asLong();
    var old = login(email, password);
    send(
        "PUT",
        "/api/users/" + id,
        admin,
        Map.of(
            "name",
            "Revocation User",
            "email",
            email,
            "role",
            "PARTICIPANT",
            "password",
            reset,
            "active",
            true),
        200);
    mvc.perform(get("/api/bootstrap").session(old)).andExpect(status().isUnauthorized());
    var active = login(email, reset);
    send("DELETE", "/api/users/" + id, admin, null, 200);
    mvc.perform(get("/api/bootstrap").session(active)).andExpect(status().isUnauthorized());
    mvc.perform(post("/api/auth/login").with(csrf()).param("email", email).param("password", reset))
        .andExpect(status().isUnauthorized());
  }

  JsonNode send(String method, String path, String user, Object body, int status) throws Exception {
    var request =
        switch (method) {
          case "POST" -> post(path);
          case "PUT" -> put(path);
          case "DELETE" -> delete(path);
          default -> get(path);
        };
    if (user != null) request.with(user(user));
    if (!method.equals("GET")) request.with(csrf());
    if (body != null)
      request.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsBytes(body));
    var result = mvc.perform(request).andExpect(status().is(status)).andReturn();
    String content = result.getResponse().getContentAsString();
    return content.isBlank() ? json.createObjectNode() : json.readTree(content);
  }

  @Test
  @Order(1)
  void authenticationAndCsrfAreRequired() throws Exception {
    mvc.perform(get("/api/bootstrap")).andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/quizzes")
                .with(user(creator))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(quizPayload(true))))
        .andExpect(status().isForbidden());
    mvc.perform(
            post("/api/auth/login")
                .with(csrf())
                .param("email", participant)
                .param("password", "bad-password"))
        .andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/auth/login")
                .with(csrf())
                .param("email", participant)
                .param("password", "JavaLab@123"))
        .andExpect(status().isOk())
        .andExpect(authenticated());
  }

  @Test
  @Order(2)
  void creatorCanSubmitAndParticipantCannotApprove() throws Exception {
    send("POST", "/api/quizzes", participant, quizPayload(true), 403);
    quizId = send("POST", "/api/quizzes", creator, quizPayload(true), 200).path("id").asLong();
    send(
        "POST",
        "/api/quizzes/" + quizId + "/review",
        participant,
        Map.of("status", "APPROVED", "note", ""),
        403);
    send("POST", "/api/quizzes/" + quizId + "/start", participant, null, 400);
    send(
        "POST",
        "/api/quizzes/" + quizId + "/review",
        admin,
        Map.of("status", "APPROVED", "note", "Looks good"),
        200);
  }

  @Test
  @Order(3)
  void startHidesAnswersAndResumesSameAttempt() throws Exception {
    var attempt = send("POST", "/api/quizzes/" + quizId + "/start", participant, null, 200);
    attemptId = attempt.path("id").asLong();
    questionId = attempt.path("questions").get(0).path("id").asLong();
    assertFalse(attempt.path("questions").get(0).has("correctIndex"));
    assertFalse(attempt.path("questions").get(0).has("explanation"));
    assertEquals(
        attemptId,
        send("POST", "/api/quizzes/" + quizId + "/start", participant, null, 200)
            .path("id")
            .asLong());
    send("GET", "/api/quizzes/" + quizId + "/edit", participant, null, 403);
    send("GET", "/api/attempts/" + attemptId, "priya@quizcraft.dev", null, 403);
  }

  @Test
  @Order(4)
  void answersAreValidatedAndScoredOnServer() throws Exception {
    send(
        "PUT",
        "/api/attempts/" + attemptId + "/answers",
        participant,
        Map.of("answers", Map.of("999999", 1)),
        400);
    send(
        "PUT",
        "/api/attempts/" + attemptId + "/answers",
        participant,
        Map.of("answers", Map.of(String.valueOf(questionId), 9)),
        400);
    send(
        "PUT",
        "/api/attempts/" + attemptId + "/answers",
        participant,
        Map.of("answers", Map.of(String.valueOf(questionId), 1)),
        200);
    var result =
        send(
            "POST",
            "/api/attempts/" + attemptId + "/submit",
            participant,
            Map.of("answers", Map.of()),
            200);
    assertEquals(100, result.path("percent").asInt());
    assertEquals(1, result.path("score").asInt());
    assertTrue(result.path("passed").asBoolean());
    assertEquals(1, result.path("questions").get(0).path("correctIndex").asInt());
    assertEquals(
        100,
        send(
                "POST",
                "/api/attempts/" + attemptId + "/submit",
                participant,
                Map.of("answers", Map.of(String.valueOf(questionId), 0)),
                200)
            .path("percent")
            .asInt());
    send("PUT", "/api/quizzes/" + quizId, creator, quizPayload(false), 409);
    send("DELETE", "/api/quizzes/" + quizId, creator, null, 409);
  }

  @Test
  @Order(5)
  void deadlineIgnoresLateAnswersAndSchedulerSubmitsSavedWork() throws Exception {
    var a = send("POST", "/api/quizzes/" + quizId + "/start", participant, null, 200);
    long id = a.path("id").asLong();
    send(
        "PUT",
        "/api/attempts/" + id + "/answers",
        participant,
        Map.of("answers", Map.of(String.valueOf(questionId), 0)),
        200);
    db.update(
        "UPDATE attempts SET deadline_at=? WHERE id=?", System.currentTimeMillis() - 1000, id);
    var late =
        send(
            "POST",
            "/api/attempts/" + id + "/submit",
            participant,
            Map.of("answers", Map.of(String.valueOf(questionId), 1)),
            200);
    assertEquals(0, late.path("score").asInt());
    assertNotEquals(0, late.path("submittedAt").asLong());
    var third = send("POST", "/api/quizzes/" + quizId + "/start", participant, null, 200);
    long thirdId = third.path("id").asLong();
    db.update(
        "UPDATE attempts SET deadline_at=? WHERE id=?", System.currentTimeMillis() - 1000, thirdId);
    send("GET", "/api/bootstrap", participant, null, 200);
    assertNotNull(
        db.queryForObject("SELECT submitted_at FROM attempts WHERE id=?", Long.class, thirdId));
    send("POST", "/api/quizzes/" + quizId + "/start", participant, null, 409);
  }

  @Test
  @Order(6)
  void gradingRequiresOwnershipAndPreservesAutomaticScore() throws Exception {
    send(
        "POST",
        "/api/attempts/" + attemptId + "/grade",
        participant,
        Map.of("score", 0, "feedback", "No"),
        403);
    send(
        "POST",
        "/api/attempts/" + attemptId + "/grade",
        "rohan@quizcraft.dev",
        Map.of("score", 0, "feedback", "No"),
        403);
    send(
        "POST",
        "/api/attempts/" + attemptId + "/grade",
        creator,
        Map.of("score", 2, "feedback", "Too high"),
        400);
    send(
        "POST",
        "/api/attempts/" + attemptId + "/grade",
        creator,
        Map.of("score", 0, "feedback", "Review adjusted with an explanation."),
        200);
    var a = send("GET", "/api/attempts/" + attemptId, participant, null, 200);
    assertEquals(1, a.path("score").asInt());
    assertEquals(0, a.path("effectiveScore").asInt());
  }

  @Test
  @Order(7)
  void usersRolesAndDeactivationAreEnforced() throws Exception {
    var body =
        Map.of(
            "name",
            "Test Learner",
            "email",
            "test@example.com",
            "role",
            "PARTICIPANT",
            "password",
            "TestPass123!",
            "active",
            true);
    send("POST", "/api/users", creator, body, 403);
    newUserId = send("POST", "/api/users", admin, body, 200).path("id").asLong();
    send("POST", "/api/users", admin, body, 409);
    var updated = new HashMap<String, Object>(body);
    updated.put("name", "Updated Learner");
    updated.put("password", "");
    send("PUT", "/api/users/" + newUserId, admin, updated, 200);
    send("DELETE", "/api/users/" + newUserId, admin, null, 200);
    send("GET", "/api/bootstrap", "test@example.com", null, 401);
    long adminId = db.queryForObject("SELECT id FROM app_users WHERE email=?", Long.class, admin);
    send("DELETE", "/api/users/" + adminId, admin, null, 400);
  }

  @Test
  @Order(8)
  void messagesArePrivateAndOnlyCrossRole() throws Exception {
    long creatorId =
        db.queryForObject("SELECT id FROM app_users WHERE email=?", Long.class, creator);
    long priyaId =
        db.queryForObject(
            "SELECT id FROM app_users WHERE email=?", Long.class, "priya@quizcraft.dev");
    send(
        "POST",
        "/api/messages",
        participant,
        Map.of("recipientId", priyaId, "body", "No participant-to-participant messaging"),
        403);
    send(
        "POST",
        "/api/messages",
        participant,
        Map.of("recipientId", creatorId, "body", "PRIVATE_TEST_MESSAGE"),
        200);
    var other = send("GET", "/api/bootstrap", "priya@quizcraft.dev", null, 200);
    assertFalse(other.path("messages").toString().contains("PRIVATE_TEST_MESSAGE"));
    assertEquals(0, other.path("users").size());
    assertFalse(other.path("contacts").get(0).has("email"));
  }

  @Test
  @Order(9)
  void remindersBelongToTheirOwner() throws Exception {
    var r =
        send(
            "POST",
            "/api/reminders",
            participant,
            Map.of("quizId", quizId, "remindAt", System.currentTimeMillis() + 600000),
            200);
    long id = r.path("id").asLong();
    send("DELETE", "/api/reminders/" + id, "priya@quizcraft.dev", null, 404);
    send("DELETE", "/api/reminders/" + id, participant, null, 200);
    send("POST", "/api/reminders", participant, Map.of("quizId", quizId, "remindAt", 1), 400);
  }

  @Test
  @Order(10)
  void settingsValidateAndMaintenanceBlocksNewWork() throws Exception {
    var settings =
        Map.of(
            "siteName",
            "Quizcraft",
            "passPercent",
            60,
            "defaultDuration",
            15,
            "maxAttempts",
            3,
            "maintenance",
            true);
    send("PUT", "/api/settings", participant, settings, 403);
    send("PUT", "/api/settings", admin, settings, 200);
    send("POST", "/api/quizzes/1/start", "aisha@quizcraft.dev", null, 503);
    send(
        "POST",
        "/api/auth/register",
        null,
        Map.of("name", "New", "email", "new@example.com", "password", "NewPass123!"),
        503);
    var reset = new HashMap<String, Object>(settings);
    reset.put("maintenance", false);
    send("PUT", "/api/settings", admin, reset, 200);
    var invalid = new HashMap<String, Object>(settings);
    invalid.put("passPercent", 101);
    send("PUT", "/api/settings", admin, invalid, 400);
  }

  @Test
  @Order(11)
  void registrationCannotEscalateRoleAndQuizzesRemainScoped() throws Exception {
    send(
        "POST",
        "/api/auth/register",
        null,
        Map.of(
            "name",
            "New Learner",
            "email",
            "new@example.com",
            "password",
            "NewPass123!",
            "role",
            "ADMIN"),
        200);
    var d = send("GET", "/api/bootstrap", "new@example.com", null, 200);
    assertEquals("PARTICIPANT", d.path("user").path("role").asText());
    for (var q : d.path("quizzes")) assertEquals("APPROVED", q.path("status").asText());
    var c = send("GET", "/api/bootstrap", creator, null, 200);
    long cid = c.path("user").path("id").asLong();
    for (var q : c.path("quizzes")) assertEquals(cid, q.path("creatorId").asLong());
    assertFalse(d.toString().contains("passwordHash"));
  }

  @Test
  @Order(12)
  void rejectedDraftCanBeRevisedAndDeletedBeforeAnyAttempts() throws Exception {
    long id = send("POST", "/api/quizzes", creator, quizPayload(true), 200).path("id").asLong();
    send(
        "POST",
        "/api/quizzes/" + id + "/review",
        admin,
        Map.of("status", "REJECTED", "note", ""),
        400);
    send(
        "POST",
        "/api/quizzes/" + id + "/review",
        admin,
        Map.of("status", "REJECTED", "note", "Please improve the explanation."),
        200);
    send("PUT", "/api/quizzes/" + id, creator, quizPayload(false), 200);
    send("DELETE", "/api/quizzes/" + id, "rohan@quizcraft.dev", null, 403);
    send("DELETE", "/api/quizzes/" + id, creator, null, 200);
  }

  // Spring Security's result matcher is kept explicit to verify the real form login.
  private static ResultMatcher authenticated() {
    return org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers
        .authenticated();
  }
}
