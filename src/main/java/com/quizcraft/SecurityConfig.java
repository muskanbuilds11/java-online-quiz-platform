package com.quizcraft;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.session.HttpSessionEventPublisher;

@Configuration
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  SessionRegistry sessionRegistry() {
    return new SessionRegistryImpl();
  }

  @Bean
  HttpSessionEventPublisher sessionEvents() {
    return new HttpSessionEventPublisher();
  }

  @Bean
  UserDetailsService userDetailsService(JdbcTemplate db) {
    return email ->
        db
            .query(
                "SELECT * FROM app_users WHERE email=?",
                (rs, n) ->
                    User.withUsername(rs.getString("email"))
                        .password(rs.getString("password_hash"))
                        .roles(rs.getString("role"))
                        .disabled(!rs.getBoolean("active"))
                        .build(),
                email.trim().toLowerCase())
            .stream()
            .findFirst()
            .orElseThrow(() -> new UsernameNotFoundException("Account not found"));
  }

  @Bean
  SecurityFilterChain security(HttpSecurity http, SessionRegistry sessions) throws Exception {
    http.authorizeHttpRequests(
            a ->
                a.requestMatchers(
                        "/",
                        "/index.html",
                        "/styles.css",
                        "/app.js",
                        "/scene.js",
                        "/vendor/**",
                        "/favicon.svg",
                        "/api/auth/csrf",
                        "/api/auth/register",
                        "/error")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .formLogin(
            f ->
                f.loginProcessingUrl("/api/auth/login")
                    .usernameParameter("email")
                    .successHandler(
                        (req, res, auth) -> {
                          res.setContentType("application/json");
                          res.getWriter().write("{\"ok\":true}");
                        })
                    .failureHandler(
                        (req, res, ex) -> {
                          res.setStatus(401);
                          res.setContentType("application/json");
                          res.getWriter()
                              .write(
                                  "{\"message\":\"Email or password is incorrect, or your account"
                                      + " is inactive.\"}");
                        }))
        .logout(
            l ->
                l.logoutUrl("/api/auth/logout")
                    .logoutSuccessHandler((req, res, auth) -> res.setStatus(204)))
        .sessionManagement(
            s ->
                s.maximumSessions(-1)
                    .sessionRegistry(sessions)
                    .expiredSessionStrategy(
                        event -> {
                          var res = event.getResponse();
                          res.setStatus(401);
                          res.setContentType("application/json");
                          res.getWriter()
                              .write(
                                  "{\"message\":\"Your account security changed. Please sign in"
                                      + " again.\"}");
                        }))
        .exceptionHandling(
            e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
        .headers(
            h ->
                h.contentSecurityPolicy(
                    c ->
                        c.policyDirectives(
                            "default-src 'self'; script-src 'self'; style-src 'self'"
                                + " 'unsafe-inline'; img-src 'self' data:; connect-src 'self';"
                                + " font-src 'self'; object-src 'none'; base-uri 'self';"
                                + " frame-ancestors 'none'")));
    return http.build();
  }
}
