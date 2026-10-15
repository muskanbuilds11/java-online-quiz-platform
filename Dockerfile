FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B verify

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN groupadd --system quizcraft && useradd --system --gid quizcraft quizcraft
COPY --from=build --chown=quizcraft:quizcraft /build/target/quizcraft-1.0.0.jar app.jar
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=65 -XX:+ExitOnOutOfMemoryError"
USER quizcraft
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
