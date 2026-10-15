package com.quizcraft;

/** A generic formatter can support additional report formats without changing the servlet. */
@FunctionalInterface
public interface ReportFormatter<T> {
  String format(T report);
}
