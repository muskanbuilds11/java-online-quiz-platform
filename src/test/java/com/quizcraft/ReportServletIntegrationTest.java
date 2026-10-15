package com.quizcraft;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.*;
import java.net.http.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
      "spring.datasource.url=jdbc:h2:mem:servlettest;DB_CLOSE_DELAY=-1",
      "quizcraft.seed-demo=true"
    })
class ReportServletIntegrationTest {
  @LocalServerPort int port;
  @Autowired JdbcTemplate db;
  @Autowired ObjectMapper json;

  URI url(String path) {
    return URI.create("http://127.0.0.1:" + port + path);
  }

  HttpClient login(String email) throws Exception {
    var client =
        HttpClient.newBuilder()
            .cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL))
            .build();
    var csrf =
        client.send(
            HttpRequest.newBuilder(url("/api/auth/csrf")).GET().build(),
            HttpResponse.BodyHandlers.ofString());
    String token = json.readTree(csrf.body()).path("token").asText();
    var response =
        client.send(
            HttpRequest.newBuilder(url("/api/auth/login"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(
                    HttpRequest.BodyPublishers.ofString(
                        "email="
                            + URLEncoder.encode(email, java.nio.charset.StandardCharsets.UTF_8)
                            + "&password=JavaLab%40123&_csrf="
                            + URLEncoder.encode(token, java.nio.charset.StandardCharsets.UTF_8)))
                .build(),
            HttpResponse.BodyHandlers.ofString());
    assertEquals(200, response.statusCode());
    return client;
  }

  @Test
  void nativeServletDownloadsAnAuthenticatedPerformanceReport() throws Exception {
    long id =
        db.queryForObject(
            "SELECT MIN(a.id) FROM attempts a JOIN app_users u ON a.participant_id=u.id WHERE"
                + " u.email='participant@quizcraft.dev'",
            Long.class);
    var response =
        login("participant@quizcraft.dev")
            .send(
                HttpRequest.newBuilder(url("/reports/attempts/" + id)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
    assertEquals(200, response.statusCode());
    assertTrue(response.body().startsWith("QUIZNOVA - PERFORMANCE REPORT"));
    assertTrue(response.body().contains("Explanation:"));
    assertTrue(response.body().contains("Jordan Ellis"));
    assertTrue(
        response.headers().firstValue("Content-Disposition").orElse("").contains("attachment"));
    assertEquals("no-store", response.headers().firstValue("Cache-Control").orElse(""));
  }

  @Test
  void servletUsesTheSameSessionAndOwnershipRulesAsRest() throws Exception {
    long id =
        db.queryForObject(
            "SELECT MIN(a.id) FROM attempts a JOIN app_users u ON a.participant_id=u.id WHERE"
                + " u.email='participant@quizcraft.dev'",
            Long.class);
    var anonymous =
        HttpClient.newHttpClient()
            .send(
                HttpRequest.newBuilder(url("/reports/attempts/" + id)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
    assertEquals(401, anonymous.statusCode());
    var other = login("priya@quizcraft.dev");
    assertEquals(
        403,
        other
            .send(
                HttpRequest.newBuilder(url("/reports/attempts/" + id)).GET().build(),
                HttpResponse.BodyHandlers.ofString())
            .statusCode());
    assertEquals(
        404,
        other
            .send(
                HttpRequest.newBuilder(url("/reports/attempts/invalid")).GET().build(),
                HttpResponse.BodyHandlers.ofString())
            .statusCode());
  }
}
