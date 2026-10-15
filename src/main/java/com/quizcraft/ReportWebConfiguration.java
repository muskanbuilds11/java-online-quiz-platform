package com.quizcraft;

import java.util.Map;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ReportWebConfiguration {
  @Bean
  ServletRegistrationBean<PerformanceReportServlet> performanceReportServlet(
      PlatformService service, ReportFormatter<Map<String, Object>> formatter) {
    return new ServletRegistrationBean<>(
        new PerformanceReportServlet(service, formatter), "/reports/attempts/*");
  }
}
