package com.quizcraft;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ApiController {
  private final PlatformService service;

  public ApiController(PlatformService service) {
    this.service = service;
  }

  public record Register(
      @NotBlank @Size(max = 100) String name,
      @NotBlank @Email @Size(max = 180) String email,
      @NotBlank @Size(min = 8, max = 72) String password) {}

  public record ProfileInput(@NotBlank @Size(max = 100) String name) {}

  public record PasswordInput(
      @NotBlank @Size(max = 72) String currentPassword,
      @NotBlank @Size(min = 8, max = 72) String newPassword) {}

  public record UserInput(
      @NotBlank @Size(max = 100) String name,
      @NotBlank @Email @Size(max = 180) String email,
      @NotBlank String role,
      @Size(max = 72) String password,
      boolean active) {}

  public record QuestionInput(
      @NotBlank @Size(max = 4000) String prompt,
      @NotNull @Size(min = 4, max = 4) List<@NotBlank @Size(max = 1000) String> options,
      @NotNull @Min(0) @Max(3) Integer correctIndex,
      @NotBlank @Size(max = 3000) String explanation) {}

  public record QuizInput(
      @NotBlank @Size(max = 160) String title,
      @NotBlank @Size(max = 2000) String description,
      @NotBlank @Size(max = 80) String topic,
      @NotBlank String difficulty,
      @Min(1) @Max(180) int durationMinutes,
      @NotNull @Size(min = 1, max = 100) List<@Valid QuestionInput> questions,
      boolean submitForReview) {}

  public record ReviewInput(@NotBlank String status, @Size(max = 1000) String note) {}

  public record AnswerInput(@NotNull Map<Long, @Min(0) @Max(3) Integer> answers) {}

  public record GradeInput(
      @NotNull @Min(0) Integer score, @NotBlank @Size(max = 3000) String feedback) {}

  public record MessageInput(@Positive long recipientId, @NotBlank @Size(max = 3000) String body) {}

  public record ReminderInput(@Positive long quizId, @Positive long remindAt) {}

  public record SettingsInput(
      @NotBlank @Size(max = 100) String siteName,
      @Min(1) @Max(100) int passPercent,
      @Min(1) @Max(180) int defaultDuration,
      @Min(1) @Max(20) int maxAttempts,
      boolean maintenance) {}

  @GetMapping("/auth/csrf")
  Map<String, String> csrf(CsrfToken token) {
    return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
  }

  @PostMapping("/auth/register")
  Map<String, Object> register(@RequestBody @Valid Register input) {
    return service.register(input);
  }

  @GetMapping("/bootstrap")
  Map<String, Object> bootstrap(Authentication auth) {
    return service.bootstrap(auth.getName());
  }

  @PutMapping("/account/profile")
  Map<String, Object> profile(Authentication a, @RequestBody @Valid ProfileInput input) {
    return service.saveProfile(a.getName(), input);
  }

  @PutMapping("/account/password")
  Map<String, Object> password(Authentication a, @RequestBody @Valid PasswordInput input) {
    return service.changePassword(a.getName(), input);
  }

  @PostMapping("/users")
  Map<String, Object> createUser(Authentication a, @RequestBody @Valid UserInput input) {
    return service.saveUser(a.getName(), null, input);
  }

  @PutMapping("/users/{id}")
  Map<String, Object> updateUser(
      Authentication a, @PathVariable long id, @RequestBody @Valid UserInput input) {
    return service.saveUser(a.getName(), id, input);
  }

  @DeleteMapping("/users/{id}")
  Map<String, Object> deleteUser(Authentication a, @PathVariable long id) {
    return service.deactivateUser(a.getName(), id);
  }

  @GetMapping("/quizzes/{id}/edit")
  Map<String, Object> editQuiz(Authentication a, @PathVariable long id) {
    return service.editQuiz(a.getName(), id);
  }

  @PostMapping("/quizzes")
  Map<String, Object> createQuiz(Authentication a, @RequestBody @Valid QuizInput input) {
    return service.saveQuiz(a.getName(), null, input);
  }

  @PutMapping("/quizzes/{id}")
  Map<String, Object> updateQuiz(
      Authentication a, @PathVariable long id, @RequestBody @Valid QuizInput input) {
    return service.saveQuiz(a.getName(), id, input);
  }

  @DeleteMapping("/quizzes/{id}")
  Map<String, Object> deleteQuiz(Authentication a, @PathVariable long id) {
    return service.deleteQuiz(a.getName(), id);
  }

  @PostMapping("/quizzes/{id}/review")
  Map<String, Object> review(
      Authentication a, @PathVariable long id, @RequestBody @Valid ReviewInput input) {
    return service.review(a.getName(), id, input);
  }

  @PostMapping("/quizzes/{id}/start")
  Map<String, Object> start(Authentication a, @PathVariable long id) {
    return service.start(a.getName(), id);
  }

  @GetMapping("/attempts/{id}")
  Map<String, Object> attempt(Authentication a, @PathVariable long id) {
    return service.attempt(a.getName(), id);
  }

  @PutMapping("/attempts/{id}/answers")
  Map<String, Object> saveAnswers(
      Authentication a, @PathVariable long id, @RequestBody @Valid AnswerInput input) {
    return service.saveAnswers(a.getName(), id, input, false);
  }

  @PostMapping("/attempts/{id}/submit")
  Map<String, Object> submit(
      Authentication a, @PathVariable long id, @RequestBody @Valid AnswerInput input) {
    return service.saveAnswers(a.getName(), id, input, true);
  }

  @PostMapping("/attempts/{id}/grade")
  Map<String, Object> grade(
      Authentication a, @PathVariable long id, @RequestBody @Valid GradeInput input) {
    return service.grade(a.getName(), id, input);
  }

  @PostMapping("/messages")
  Map<String, Object> message(Authentication a, @RequestBody @Valid MessageInput input) {
    return service.sendMessage(a.getName(), input);
  }

  @PostMapping("/reminders")
  Map<String, Object> reminder(Authentication a, @RequestBody @Valid ReminderInput input) {
    return service.addReminder(a.getName(), input);
  }

  @DeleteMapping("/reminders/{id}")
  Map<String, Object> deleteReminder(Authentication a, @PathVariable long id) {
    return service.deleteReminder(a.getName(), id);
  }

  @PutMapping("/settings")
  Map<String, Object> settings(Authentication a, @RequestBody @Valid SettingsInput input) {
    return service.saveSettings(a.getName(), input);
  }

  @RestControllerAdvice
  static class Errors {
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<?> status(ResponseStatusException e) {
      return ResponseEntity.status(e.getStatusCode())
          .body(Map.of("message", Objects.requireNonNullElse(e.getReason(), "Request failed")));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> invalid(MethodArgumentNotValidException e) {
      var error = e.getBindingResult().getFieldErrors().stream().findFirst();
      return ResponseEntity.badRequest()
          .body(
              Map.of(
                  "message",
                  error
                      .map(f -> f.getField() + ": " + f.getDefaultMessage())
                      .orElse("Check your input.")));
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    ResponseEntity<?> conflict() {
      return ResponseEntity.status(409)
          .body(
              Map.of(
                  "message",
                  "This record conflicts with existing data. Check the email or linked records."));
    }
  }
}
