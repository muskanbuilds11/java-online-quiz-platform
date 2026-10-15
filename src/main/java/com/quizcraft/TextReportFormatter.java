package com.quizcraft;

import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Component;

@Component
public final class TextReportFormatter implements ReportFormatter<Map<String, Object>> {
  @Override
  @SuppressWarnings("unchecked")
  public String format(Map<String, Object> a) {
    Map<Long, Integer> answers = new HashMap<>();
    for (var answer : (List<Map<String, Object>>) a.get("answers"))
      answers.put(
          ((Number) answer.get("questionId")).longValue(),
          ((Number) answer.get("selectedIndex")).intValue());
    var report = new StringBuilder("QUIZNOVA - PERFORMANCE REPORT\n");
    report
        .append("Quiz: ")
        .append(a.get("title"))
        .append("\nParticipant: ")
        .append(a.get("participantName"))
        .append("\nSubmitted (UTC): ")
        .append(Instant.ofEpochMilli(((Number) a.get("submittedAt")).longValue()))
        .append("\nScore: ")
        .append(a.get("effectiveScore"))
        .append('/')
        .append(a.get("total"))
        .append(" (" + a.get("percent") + "%)\nPassing threshold: ")
        .append(a.get("passPercent"))
        .append("%")
        .append("\nResult: ")
        .append(Boolean.TRUE.equals(a.get("passed")) ? "Passed" : "Keep practising")
        .append("\nOriginal automatic score: ")
        .append(a.get("score"))
        .append("\nReviewer feedback: ")
        .append(a.get("gradeFeedback"))
        .append("\n\n");
    int index = 1;
    for (var question : (List<Map<String, Object>>) a.get("questions")) {
      List<String> options = (List<String>) question.get("options");
      Integer selected = answers.get(((Number) question.get("id")).longValue());
      report
          .append(index++)
          .append(". ")
          .append(question.get("prompt"))
          .append("\nYour answer: ")
          .append(selected == null ? "Unanswered" : options.get(selected))
          .append("\nCorrect answer: ")
          .append(options.get(((Number) question.get("correctIndex")).intValue()))
          .append("\nExplanation: ")
          .append(question.get("explanation"))
          .append("\n\n");
    }
    return report.toString();
  }
}
