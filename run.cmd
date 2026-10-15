@echo off
setlocal
cd /d "%~dp0"
where java >nul 2>nul
if errorlevel 1 (
  echo Java was not found. Install JDK 17 or newer and add it to PATH.
  pause
  exit /b 1
)
if not exist "target\quizcraft-1.0.0.jar" (
  call mvn clean verify
  if errorlevel 1 (
    echo The build failed. See the error above.
    pause
    exit /b 1
  )
)
echo.
echo Quizcraft will be available at http://localhost:8080
echo Keep this window open. Press Ctrl+C to stop.
echo.
java -jar target\quizcraft-1.0.0.jar
if errorlevel 1 pause
