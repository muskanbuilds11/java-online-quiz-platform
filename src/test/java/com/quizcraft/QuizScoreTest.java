package com.quizcraft;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class QuizScoreTest {
  private final ScoringPolicy policy = new MultipleChoiceScoringPolicy();

  @Test
  void passDecisionUsesTheExactPercentageBeforeDisplayRounding() {
    var score = policy.evaluate(2, 3, 67);
    assertEquals(67, score.percentage());
    assertFalse(score.passed());
    assertTrue(policy.evaluate(3, 5, 60).passed());
  }

  @Test
  void invalidScoresCannotEnterTheDomainModel() {
    assertThrows(IllegalArgumentException.class, () -> policy.evaluate(2, 1, 60));
    assertThrows(IllegalArgumentException.class, () -> policy.evaluate(0, 0, 60));
    assertThrows(IllegalArgumentException.class, () -> policy.evaluate(-1, 3, 60));
  }
}
