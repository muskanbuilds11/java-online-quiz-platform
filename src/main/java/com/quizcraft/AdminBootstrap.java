package com.quizcraft;

import jakarta.validation.Validator;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
public class AdminBootstrap implements CommandLineRunner {
  private final JdbcTemplate db;
  private final PasswordEncoder encoder;
  private final Validator validator;

  @Value("${quizcraft.admin-name}")
  String name;

  @Value("${quizcraft.admin-email}")
  String email;

  @Value("${quizcraft.admin-password}")
  String password;

  @Value("${quizcraft.require-admin:false}")
  boolean required;

  public AdminBootstrap(JdbcTemplate db, PasswordEncoder encoder, Validator validator) {
    this.db = db;
    this.encoder = encoder;
    this.validator = validator;
  }

  @Override
  @Transactional
  public void run(String... args) {
    db.queryForObject("SELECT id FROM system_settings WHERE id=1 FOR UPDATE", Integer.class);
    if (db.queryForObject(
            "SELECT COUNT(*) FROM app_users WHERE role='ADMIN' AND active=TRUE", Integer.class)
        > 0) return;
    if (email.isBlank() && password.isBlank() && !required) return;
    var input = new ApiController.Register(name, email, password);
    if (!validator.validate(input).isEmpty() || password.length() < 12)
      throw new IllegalStateException(
          "Set ADMIN_NAME, ADMIN_EMAIL and a unique ADMIN_PASSWORD of 12 to 72 characters before"
              + " first deployment.");
    db.update(
        "INSERT INTO app_users(name,email,password_hash,role,active,created_at)"
            + " VALUES(?,?,?,'ADMIN',TRUE,?)",
        name.trim(),
        email.trim().toLowerCase(Locale.ROOT),
        encoder.encode(password),
        System.currentTimeMillis());
  }
}
