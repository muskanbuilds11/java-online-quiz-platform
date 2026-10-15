package com.quizcraft;

import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

/** Shared JDBC access with bound parameters and portable generated identity retrieval. */
@Repository
public class JdbcStore {
  private final JdbcTemplate jdbc;

  public JdbcStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public <T> T queryForObject(String sql, Class<T> type, Object... args) {
    return jdbc.queryForObject(sql, type, args);
  }

  public int update(String sql, Object... args) {
    return jdbc.update(sql, args);
  }

  public List<Map<String, Object>> rows(String sql, Object... args) {
    return jdbc.query(
        sql,
        (rs, n) -> {
          Map<String, Object> row = new LinkedHashMap<>();
          for (int i = 1; i <= rs.getMetaData().getColumnCount(); i++) {
            String label = rs.getMetaData().getColumnLabel(i).toLowerCase(Locale.ROOT);
            StringBuilder camel = new StringBuilder();
            boolean upper = false;
            for (char c : label.toCharArray()) {
              if (c == '_') upper = true;
              else {
                camel.append(upper ? Character.toUpperCase(c) : c);
                upper = false;
              }
            }
            row.put(camel.toString(), rs.getObject(i));
          }
          return row;
        },
        args);
  }

  public Map<String, Object> one(String sql, Object... args) {
    return rows(sql, args).stream()
        .findFirst()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found."));
  }

  public long insert(String sql, Object... args) {
    var key = new GeneratedKeyHolder();
    jdbc.update(
        connection -> {
          var statement = connection.prepareStatement(sql, new String[] {"id"});
          for (int i = 0; i < args.length; i++) statement.setObject(i + 1, args[i]);
          return statement;
        },
        key);
    return Objects.requireNonNull(key.getKey()).longValue();
  }
}
