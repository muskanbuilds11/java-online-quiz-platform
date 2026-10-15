package com.quizcraft;

import org.springframework.stereotype.Component;

@Component
public final class MultipleChoiceScoringPolicy implements ScoringPolicy {
  @Override
  public QuizScore evaluate(int earned, int total, int passPercent) {
    return new QuizScore(earned, total, passPercent);
  }
}
