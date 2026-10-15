package com.quizcraft;

/** Immutable score value. The threshold belongs to the attempt, not today's settings. */
public record QuizScore(int earned, int total, int passPercent) {
  public QuizScore {
    if (total < 1 || earned < 0 || earned > total || passPercent < 1 || passPercent > 100)
      throw new IllegalArgumentException("Invalid score or passing threshold.");
  }

  public long percentage() {
    return Math.round(earned * 100.0 / total);
  }

  public boolean passed() {
    return earned * 100.0 / total >= passPercent;
  }
}
