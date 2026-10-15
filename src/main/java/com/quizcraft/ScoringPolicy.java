package com.quizcraft;

/** A scoring contract keeps report rules independent from transport and persistence. */
public interface ScoringPolicy {
  QuizScore evaluate(int earned, int total, int passPercent);
}
