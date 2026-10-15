package com.quizcraft;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:bootstraptest;DB_CLOSE_DELAY=-1",
      "quizcraft.seed-demo=false",
      "quizcraft.require-admin=true",
      "quizcraft.admin-name=Studio Owner",
      "quizcraft.admin-email=owner@example.test",
      "quizcraft.admin-password=TestOnlyBootstrap123!"
    })
class AdminBootstrapTest {
  @Autowired JdbcTemplate db;
  @Autowired PasswordEncoder encoder;
  @Autowired AdminBootstrap bootstrap;

  @Test
  void cleanDatabaseGetsOnePrivateAdministratorAndNoDemoData() {
    assertEquals(1, db.queryForObject("SELECT COUNT(*) FROM app_users", Integer.class));
    assertEquals(
        "ADMIN",
        db.queryForObject(
            "SELECT role FROM app_users WHERE email='owner@example.test'", String.class));
    assertTrue(
        encoder.matches(
            "TestOnlyBootstrap123!",
            db.queryForObject(
                "SELECT password_hash FROM app_users WHERE email='owner@example.test'",
                String.class)));
    assertEquals(0, db.queryForObject("SELECT COUNT(*) FROM attempts", Integer.class));
    assertEquals(0, db.queryForObject("SELECT COUNT(*) FROM quizzes", Integer.class));
  }

  @Test
  void restartDoesNotResetExistingAdministratorPassword() throws Exception {
    String before =
        db.queryForObject(
            "SELECT password_hash FROM app_users WHERE email='owner@example.test'", String.class);
    bootstrap.run();
    assertEquals(
        before,
        db.queryForObject(
            "SELECT password_hash FROM app_users WHERE email='owner@example.test'", String.class));
    assertEquals(1, db.queryForObject("SELECT COUNT(*) FROM app_users", Integer.class));
  }
}
