package com.quizcraft;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * A native Jakarta servlet demonstrates request/response integration using the same access rules as
 * REST.
 */
public final class PerformanceReportServlet extends HttpServlet {
  private final PlatformService service;
  private final ReportFormatter<Map<String, Object>> formatter;

  public PerformanceReportServlet(
      PlatformService service, ReportFormatter<Map<String, Object>> formatter) {
    this.service = service;
    this.formatter = formatter;
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    try {
      if (request.getUserPrincipal() == null) {
        response.sendError(401);
        return;
      }
      String path = Objects.requireNonNullElse(request.getPathInfo(), "");
      if (!path.matches("/[1-9][0-9]*")) {
        response.sendError(404);
        return;
      }
      long id = Long.parseLong(path.substring(1));
      var attempt = service.attempt(request.getUserPrincipal().getName(), id);
      if (attempt.get("submittedAt") == null)
        throw new ResponseStatusException(
            HttpStatus.CONFLICT, "Submit the quiz before downloading its report.");
      response.setContentType("text/plain");
      response.setCharacterEncoding("UTF-8");
      response.setHeader("Cache-Control", "no-store");
      response.setHeader(
          "Content-Disposition", "attachment; filename=\"quiznova-report-" + id + ".txt\"");
      response.getWriter().write(formatter.format(attempt));
    } catch (NumberFormatException e) {
      response.sendError(404);
    } catch (ResponseStatusException e) {
      response.sendError(e.getStatusCode().value(), e.getReason());
    }
  }
}
