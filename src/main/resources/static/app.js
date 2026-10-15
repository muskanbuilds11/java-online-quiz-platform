import { mountScene } from "./scene.js";

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  book: '<path d="M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z"/><path d="M12 6v15"/>',
  chart: '<path d="M4 3v17h17M8 15v-4m5 4V7m5 8v-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  trophy:
    '<path d="M8 3h8v6c0 6-8 6-8 0ZM8 5H4v3c0 3 3 4 5 4m7-7h4v3c0 3-3 4-5 4m-3 3v5m-4 0h8"/>',
  message:
    '<path d="M21 11a8 8 0 0 1-8 8H6l-4 3 1-7a8 8 0 1 1 18-4Z"/><path d="M7 10h10M7 14h6"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M9 20h6"/>',
  users:
    '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4c3 0 4 3 4 6"/>',
  settings:
    '<path d="m10 3-1 3-3 1-3 3 2 2-1 3 3 3 3-1 2 2 3-1 1-3 3-1 1-3-2-2 1-3-3-2-3 1Z"/><circle cx="11" cy="11" r="3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  search: '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/>',
  logout: '<path d="M10 4H4v16h6m4-13 5 5-5 5M8 12h12"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/>',
  leaf: '<path d="M20 3C8 2 2 6 4 14c1 6 13 9 16-11ZM4 21 16 8"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/>',
  spark:
    '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
  shield:
    '<path d="m12 2 8 4v6c0 6-8 10-8 10S4 18 4 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  edit: '<path d="m15 4 5 5M4 15 16 3l5 5L9 20l-6 1Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  alert: '<path d="m12 3 10 18H2Zm0 5v6m0 3h.01"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  send: '<path d="m22 2-8 20-4-8-8-4Zm-12 12L22 2"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  coffee:
    '<path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Zm12 0h2a3 3 0 0 1 0 6h-2M7 2v3m4-3v3M2 23h18"/>',
};
const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.code}</svg>`;
const brand = () =>
  `<a class="brand" href="/" data-action="home"><span class="brand-mark">{q}</span><span>quiznova<small>THE JAVA PRACTICE STUDIO</small></span></a>`;
const initials = (n) =>
  String(n)
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
const date = (n, opts = { month: "short", day: "numeric", year: "numeric" }) =>
  new Date(n).toLocaleDateString("en-IN", opts);
const time = (n) =>
  new Date(n).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
const roleName = (r) =>
  ({
    ADMIN: "Administrator",
    CREATOR: "Quiz creator",
    PARTICIPANT: "Participant",
  })[r] || r;
const avg = (xs) =>
  xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
const state = {
  data: null,
  page: "overview",
  filter: "All",
  difficulty: "All",
  search: "",
  contact: null,
  report: null,
  attempt: null,
  qIndex: 0,
  answers: {},
  authMode: "register",
  authEmail: "",
  menu: false,
};
let csrf = null,
  disposeScene = null,
  timerId = null,
  toastId = null,
  saveQueue = Promise.resolve(),
  saveError = false,
  submitting = false,
  previousFocus = null;
const app = $("#app");

async function getCsrf() {
  const r = await fetch("/api/auth/csrf");
  if (!r.ok) throw new Error("Cannot connect to the application.");
  csrf = await r.json();
}
async function api(url, method = "GET", body) {
  const headers = { Accept: "application/json" };
  if (method !== "GET") {
    if (!csrf) await getCsrf();
    headers[csrf.headerName] = csrf.token;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch("/api" + url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 204) return {};
  let result;
  try {
    result = await response.json();
  } catch {
    result = {};
  }
  if (!response.ok) {
    const error = new Error(
      result.message ||
        (response.status === 401
          ? "Please sign in to continue."
          : response.status === 403
            ? "This action was not permitted. Refresh and try again."
            : "Something went wrong. Please try again."),
    );
    error.status = response.status;
    throw error;
  }
  return result;
}
function toast(message, error = false) {
  clearTimeout(toastId);
  $("#toast-root").innerHTML =
    `<div class="toast ${error ? "error" : ""}" role="status">${icon(error ? "alert" : "check")}<span>${esc(message)}</span></div>`;
  toastId = setTimeout(
    () => ($("#toast-root").innerHTML = ""),
    error ? 7000 : 4200,
  );
}
async function load() {
  state.data = await api("/bootstrap");
  return state.data;
}
function cleanup() {
  if (disposeScene) {
    disposeScene();
    disposeScene = null;
  }
  clearInterval(timerId);
  timerId = null;
}
function mountEffects() {
  const scene = $("[data-scene]");
  if (scene) disposeScene = mountScene(scene);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
    $$(".quiz-card").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        const r = el.getBoundingClientRect();
        el.style.transform = `perspective(900px) rotateX(${-(e.clientY - r.top - r.height / 2) / 45}deg) rotateY(${(e.clientX - r.left - r.width / 2) / 40}deg) translateY(-4px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
}
function syncMobileNavigation() {
  const mobile = matchMedia("(max-width:760px)").matches;
  const side = $(".sidebar"),
    main = $(".main-area");
  if (!side) return;
  side.inert = mobile && !state.menu;
  main.inert = mobile && state.menu;
  side.classList.toggle("open", state.menu);
  $(".sidebar-scrim")?.classList.toggle("open", state.menu);
  $(".mobile-menu")?.setAttribute("aria-expanded", String(state.menu));
}
function sceneMarkup(cls) {
  return `<div class="${cls}" data-scene><span class="scene-tag one">while (curious) { learn(); }</span><span class="scene-tag two">Java. One sip at a time.</span></div>`;
}
function renderLanding(error = "", success = "") {
  cleanup();
  state.data = null;
  state.menu = false;
  document.title = "QuizNova — The Java practice studio";
  const register = state.authMode === "register";
  app.innerHTML = `<main class="landing"><header class="landing-nav">${brand()}<span class="nav-note">A LITTLE PRACTICE. A SHARPER MIND.</span></header>
  <div class="landing-main"><section class="landing-copy"><div class="eyebrow"><span class="dot"></span> BUILT FOR YOUR NEXT BREAKTHROUGH</div>
  <h1>Good Java.<br>Great <em>instincts.</em></h1><p>A small daily ritual for a better developer.<br>Thoughtful quizzes. Honest feedback. Real progress.</p>
  ${sceneMarkup("landing-scene")}<div class="landing-proof"><span>${icon("clock")} LEARN AT YOUR PACE</span><span>${icon("leaf")} GROW WITH EVERY TRY</span></div></section>
  <section class="auth-card" aria-label="${register ? "Create account" : "Sign in"}"><div class="eyebrow"><span class="dot"></span> YOUR PRACTICE STARTS HERE</div><h2>${register ? "Make room for growth." : "Welcome to the studio."}</h2><p>${register ? "Create your free participant account." : "A fresh cup. A clear head. A little Java."}</p>
  ${error ? `<div class="error-banner" role="alert">${esc(error)}</div>` : ""}
  ${success ? `<div class="success-banner" role="status">${icon("check")}<span>${esc(success)}</span></div>` : ""}
  <div id="auth-error" class="error-banner" role="alert" hidden></div>
  <form id="auth-form">${register ? '<div class="form-field"><label for="auth-name">Your name</label><input id="auth-name" name="name" autocomplete="name" maxlength="100" required placeholder="What should we call you?"></div>' : ""}
  <div class="form-field"><label for="auth-email">Email address</label><input id="auth-email" name="email" value="${esc(state.authEmail)}" type="email" autocomplete="username" maxlength="180" required placeholder="you@example.com"></div>
  <div class="form-field"><label for="auth-password">Password</label><input id="auth-password" name="password" type="password" minlength="8" maxlength="72" autocomplete="${register ? "new-password" : "current-password"}" required placeholder="${register ? "At least 8 characters" : "Your password"}"></div>
  ${register ? '<div class="form-field"><label for="auth-confirm">Confirm password</label><input id="auth-confirm" name="confirmPassword" type="password" minlength="8" maxlength="72" autocomplete="new-password" required placeholder="Enter your password again"></div>' : ""}
  <label class="check-field password-toggle"><input type="checkbox" data-password-toggle><span>Show password${register ? "s" : ""}</span></label>
  <button class="btn orange" type="submit">${register ? "Create your account" : "Sign in"} ${icon("arrow")}</button></form>
  <p class="auth-help">${register ? "Your own account. Your own progress. Sign up as a participant and start learning." : "Use the email and password you chose when creating your account."}</p>
  <p class="auth-switch">${register ? "Already have an account?" : "New around here?"} <button data-action="auth-switch">${register ? "Sign in" : "Create an account"}</button></p></section></div>
  <footer class="landing-footer"><span>CRAFTED FOR CURIOUS MINDS.</span><span>JAVA 17 &nbsp; / &nbsp; SPRING BOOT &nbsp; / &nbsp; QUIZNOVA</span></footer></main>`;
  mountEffects();
}
function navItems() {
  return [...roleNavItems(), ["account", "shield", "My account"]];
}
function roleNavItems() {
  const r = state.data.user.role;
  if (r === "ADMIN")
    return [
      ["overview", "grid", "Overview"],
      ["users", "users", "User management"],
      ["manage", "book", "Quiz approvals"],
      ["performance", "chart", "Performance"],
      ["settings", "settings", "System settings"],
      ["alerts", "bell", "System alerts"],
    ];
  if (r === "CREATOR")
    return [
      ["overview", "grid", "Overview"],
      ["manage", "edit", "My quizzes"],
      ["results", "chart", "Review results"],
      ["messages", "message", "Participants"],
      ["history", "clock", "Quiz history"],
      ["performance", "target", "Performance"],
    ];
  return [
    ["overview", "grid", "Overview"],
    ["explore", "book", "Explore quizzes"],
    ["performance", "chart", "My performance"],
    ["history", "clock", "Quiz history"],
    ["leaderboard", "trophy", "Leaderboard"],
    ["messages", "message", "Messages"],
    ["reminders", "bell", "Reminders"],
  ];
}
function pageTitle() {
  return (
    navItems().find((x) => x[0] === state.page)?.[2] ||
    (state.page === "account"
      ? "My account"
      : state.page === "report"
        ? "Performance report"
        : "Workspace")
  );
}
function sidebar() {
  const { user, quizzes, messages } = state.data;
  return `<div class="sidebar-scrim ${state.menu ? "open" : ""}" data-action="menu-close"></div><aside class="sidebar ${state.menu ? "open" : ""}">${brand()}<div class="workspace-label">YOUR WORKSPACE</div><nav class="side-nav" aria-label="Workspace navigation">${navItems()
    .map(([id, ic, label]) => {
      const count =
        id === "manage" && user.role === "ADMIN"
          ? quizzes.filter((q) => q.status === "PENDING").length
          : 0;
      return `<button class="nav-item ${state.page === id ? "active" : ""}" data-action="navigate" data-page="${id}" ${state.page === id ? 'aria-current="page"' : ""}>${icon(ic)}${label}${count ? `<span class="nav-count">${count}</span>` : ""}</button>`;
    })
    .join(
      "",
    )}</nav><div class="sidebar-bottom"><div class="practice-note"><span class="note-illustration">${user.role === "PARTICIPANT" ? "{ ☕ }" : "{ ✦ }"}</span><h4>${user.role === "PARTICIPANT" ? "Small steps. Strong roots." : "Make knowledge happen."}</h4><p>${user.role === "PARTICIPANT" ? "Ten focused minutes today. A little more confidence tomorrow." : "A thoughtful question can unlock a whole new way of thinking."}</p></div><div class="profile"><span class="avatar">${esc(initials(user.name))}</span><div><div class="profile-name">${esc(user.name)}</div><div class="profile-role">${roleName(user.role)}</div></div><button class="icon-btn" data-action="logout" title="Sign out" aria-label="Sign out">${icon("logout")}</button></div></div></aside>`;
}
function heading(kicker, title, description, action = "") {
  return `<div class="page-heading"><div><div class="eyebrow">${esc(kicker)}</div><h1>${title}</h1><p>${esc(description)}</p></div>${action || `<div class="date-label">${icon("calendar")}${date(Date.now(), { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>`}</div>`;
}
function stat(label, value, note, ic, suffix = "") {
  return `<div class="stat"><div class="stat-label">${icon(ic)}${esc(label)}</div><div class="stat-value">${esc(value)}${suffix ? `<small>${esc(suffix)}</small>` : ""}</div><div class="stat-note">${esc(note)}</div></div>`;
}
function section(title, subtitle = "", action = "") {
  return `<div class="section-head"><div><h2>${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ""}</div>${action}</div>`;
}
const navBtn = (page, label) =>
  `<button class="text-btn" data-action="navigate" data-page="${page}">${esc(label)} ${icon("arrow")}</button>`;
function empty(title, text, action = "") {
  return `<div class="empty">${icon("leaf")}<h3>${esc(title)}</h3><p>${esc(text)}</p>${action}</div>`;
}
function completed() {
  return state.data.attempts.filter((a) => a.submittedAt);
}
function topicScores() {
  const topics = {};
  for (const a of completed()) {
    (topics[a.topic] ??= []).push(a.percent);
  }
  return Object.entries(topics).map(([topic, values]) => ({
    topic,
    score: avg(values),
  }));
}
function skillPanel() {
  const topics = topicScores();
  return topics.length
    ? topics
        .map(
          (t) =>
            `<div class="skill-row"><span>${esc(t.topic)}</span><div class="progress-line"><span style="width:${t.score}%"></span></div><span class="score">${t.score}%</span></div>`,
        )
        .join("")
    : empty(
        "Your skills, mapped.",
        "Complete a quiz to see your strengths take shape.",
      );
}
function art(q) {
  const index = [
    "Core Java",
    "Object-oriented programming",
    "Collections",
    "Exception handling",
    "Streams & lambdas",
    "Concurrency",
  ].indexOf(q.topic);
  const idx = index < 0 ? 0 : index;
  const symbol = ["{ }", "◈", "[ ]", "try;", "λ", "↗"][idx];
  return `<div class="quiz-art art-${idx}"><span class="art-index">JAVA / ${String(idx + 1).padStart(2, "0")}</span><span class="art-object" aria-hidden="true">${symbol}</span><span class="art-label">${["FOUNDATIONS", "OBJECTS", "COLLECTIONS", "EXCEPTIONS", "STREAMS", "THREADS"][idx]}</span></div>`;
}
function quizCard(q) {
  const p = state.data.user.role === "PARTICIPANT";
  const active = state.data.attempts.find(
    (a) => a.quizId === q.id && !a.submittedAt,
  );
  const best = state.data.attempts
    .filter((a) => a.quizId === q.id && a.submittedAt)
    .reduce((best, a) => Math.max(best, a.percent), -1);
  return `<article class="quiz-card">${art(q)}<div class="quiz-body"><div class="quiz-tags"><span class="badge ${q.difficulty.toLowerCase()}">${esc(q.difficulty)}</span><span class="topic-label">${esc(q.topic)}</span>${!p ? `<span class="badge ${q.status.toLowerCase()}">${esc(q.status)}</span>` : ""}</div><h3>${esc(q.title)}</h3><p>${esc(q.description)}</p><div class="quiz-meta"><span>${icon("clock")}${q.durationMinutes} min</span><span>${icon("book")}${q.questionCount} questions</span></div><div class="quiz-foot"><span>${p ? (best >= 0 ? `${icon("check")} Best: ${best}%` : `By ${esc(q.creatorName.split(" ")[0])}`) : `${q.attemptCount} submissions`}</span><button class="text-btn" data-action="${p ? "quiz-intro" : "quiz-preview"}" data-id="${q.id}">${p ? (active ? "Resume quiz" : "Start quiz") : "View quiz"} ${icon("arrow")}</button></div></div></article>`;
}
function overview() {
  const d = state.data,
    r = d.user.role,
    done = completed(),
    name = esc(d.user.name.split(" ")[0]);
  let stats, heroTitle, heroText, cta, ctaPage, kicker, description;
  if (r === "PARTICIPANT") {
    const rank = d.leaderboard.find((x) => x.id === d.user.id)?.rank;
    stats =
      stat(
        "Quizzes completed",
        new Set(done.map((a) => a.quizId)).size,
        "One step further, every time",
        "book",
      ) +
      stat(
        "Average score",
        done.length ? avg(done.map((a) => a.percent)) : "—",
        "Across your completed attempts",
        "target",
        done.length ? "%" : "",
      ) +
      stat(
        "Practice time",
        done.reduce(
          (n, a) => n + Math.ceil((a.submittedAt - a.startedAt) / 60000),
          0,
        ),
        "Time well invested",
        "clock",
        "min",
      ) +
      stat(
        "Your standing",
        rank ? `#${rank}` : "—",
        rank
          ? `Among ${d.leaderboard.length} active learners`
          : "Your first quiz starts the story",
        "trophy",
      );
    heroTitle = "A little practice.<br>A lot of <em>possibility.</em>";
    heroText =
      "Good developers aren’t born knowing everything. They stay curious. Ready for your next small win?";
    cta = "Find your next challenge";
    ctaPage = "explore";
    kicker = "YOUR LEARNING, IN FOCUS";
    description = "A good day to learn something new. Let’s make it count.";
  } else if (r === "CREATOR") {
    stats =
      stat(
        "Your quizzes",
        d.quizzes.length,
        "Ideas turned into challenges",
        "book",
      ) +
      stat(
        "Published",
        d.quizzes.filter((q) => q.status === "APPROVED").length,
        "Ready for curious minds",
        "check",
      ) +
      stat("Submissions", done.length, "Learning, in action", "users") +
      stat(
        "Average score",
        done.length ? avg(done.map((a) => a.percent)) : "—",
        "Across your quiz submissions",
        "target",
        done.length ? "%" : "",
      );
    heroTitle = "Great questions.<br>Greater <em>understanding.</em>";
    heroText =
      "Build a challenge that makes someone think. Your next quiz could be someone’s next breakthrough.";
    cta = "Create a new quiz";
    ctaPage = "new";
    kicker = "THE CREATOR’S WORKBENCH";
    description = "Shape the questions. Help the next generation grow.";
  } else {
    stats =
      stat(
        "Active users",
        d.users.filter((u) => u.active).length,
        `${d.users.length} accounts in the studio`,
        "users",
      ) +
      stat(
        "Published quizzes",
        d.quizzes.filter((q) => q.status === "APPROVED").length,
        "Knowledge ready to share",
        "book",
      ) +
      stat(
        "Pending approval",
        d.quizzes.filter((q) => q.status === "PENDING").length,
        "Waiting for your review",
        "clock",
      ) +
      stat(
        "Quiz submissions",
        done.length,
        "Every attempt is progress",
        "chart",
      );
    heroTitle = "A thriving studio.<br>In <em>good hands.</em>";
    heroText =
      "Keep the learning flowing. Review new content, support your people, and give good ideas room to grow.";
    cta = "Review quiz content";
    ctaPage = "manage";
    kicker = "THE BIG PICTURE";
    description = "Everything you need to keep the studio running well.";
  }
  const active = d.attempts.find((a) => !a.submittedAt);
  return (
    heading(
      kicker,
      `Hello, ${name}<span style="color:var(--orange)">.</span>`,
      description,
    ) +
    `<div class="hero-row"><section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="dot"></span> ${r === "PARTICIPANT" ? "MAKE CURIOSITY A HABIT" : "A SPACE FOR BETTER LEARNING"}</div><h2>${heroTitle}</h2><p>${heroText}</p><button class="btn" data-action="${ctaPage === "new" ? "quiz-new" : "navigate"}" data-page="${ctaPage}">${cta} ${icon("arrow")}</button></div>${sceneMarkup("hero-scene")}</section>
    <aside class="daily-card"><div class="eyebrow">${r === "PARTICIPANT" ? "A NOTE FOR TODAY" : "STUDIO NOTES"} ${icon("spark")}</div><div class="tiny-rule"></div><h3>${r === "PARTICIPANT" ? "Progress over perfection." : "Good learning starts here."}</h3><p>${r === "PARTICIPANT" ? "Every wrong answer is a useful clue. Take your time, read the feedback, and try again." : "Clarity matters. Thoughtful explanations turn a score into a learning moment."}</p>${navBtn(r === "PARTICIPANT" ? "performance" : "manage", r === "PARTICIPANT" ? "See your progress" : "Visit your workbench")}<span class="card-emblem">✳</span></aside></div>
    ${active && r === "PARTICIPANT" ? `<div class="notice" style="margin-top:18px;margin-bottom:0">${icon("clock")}<p>You have an active attempt: <strong>${esc(active.title)}</strong>. The timer is still running.</p><button class="text-btn" style="margin-left:auto;white-space:nowrap" data-action="resume" data-id="${active.id}">Resume ${icon("arrow")}</button></div>` : ""}
    ${d.settings.maintenance ? '<div class="notice" style="margin-top:18px;margin-bottom:0">' + icon("alert") + "<p>Maintenance mode is enabled. New quiz attempts and registration are paused.</p></div>" : ""}
    <div class="stat-grid">${stats}</div>
    ${section(r === "PARTICIPANT" ? "Your next chapter" : "On the workbench", r === "PARTICIPANT" ? "Handpicked challenges. A fresh perspective." : "Your latest quiz content, at a glance.", navBtn(r === "PARTICIPANT" ? "explore" : "manage", "View all quizzes"))}
    <div class="quiz-grid">${
      (r === "PARTICIPANT"
        ? [...d.quizzes].sort((a, b) => {
            const doneIds = new Set(done.map((a) => a.quizId));
            return (
              Number(doneIds.has(a.id)) - Number(doneIds.has(b.id)) ||
              a.id - b.id
            );
          })
        : d.quizzes
      )
        .slice(0, 3)
        .map(quizCard)
        .join("") ||
      empty(
        "Start with an idea.",
        "Create your first quiz to get the studio moving.",
      )
    }</div>
    <div class="lower-grid"><section>${section("Recent activity", "", navBtn(r === "PARTICIPANT" ? "history" : "results", "View history"))}<div class="panel">${
      done
        .slice(0, 3)
        .map(
          (a) =>
            `<div class="activity"><span class="activity-icon">${icon(a.passed ? "check" : "book")}</span><div><div class="activity-name">${esc(a.title)}</div><div class="activity-sub">${r === "PARTICIPANT" ? date(a.submittedAt) : esc(a.participantName) + " · " + date(a.submittedAt)}</div></div><button class="activity-score" data-action="report" data-id="${a.id}">${a.percent}%<small>View report →</small></button></div>`,
        )
        .join("") ||
      empty("A fresh start.", "Completed quizzes will appear here.")
    }</div></section>
    <section>${section(r === "PARTICIPANT" ? "Your skill landscape" : "Topic performance")}<div class="panel">${skillPanel()}</div></section></div>`
  );
}
function explore() {
  const d = state.data;
  const topics = ["All", ...new Set(d.quizzes.map((q) => q.topic))];
  const filtered = d.quizzes.filter(
    (q) =>
      (state.filter === "All" || q.topic === state.filter) &&
      (state.difficulty === "All" || q.difficulty === state.difficulty) &&
      `${q.title} ${q.description} ${q.topic}`
        .toLowerCase()
        .includes(state.search.toLowerCase()),
  );
  return (
    heading(
      "FIND YOUR NEXT CHALLENGE",
      "Curiosity looks good on you.",
      "Pick a topic. Find your rhythm. Make a little progress.",
    ) +
    `<div class="toolbar"><div class="filter-tabs">${["All", "Beginner", "Intermediate", "Advanced"].map((t) => `<button class="filter-tab ${state.difficulty === t ? "active" : ""}" data-action="difficulty" data-value="${t}">${t === "All" ? "All levels" : t}</button>`).join("")}</div><select id="topic-filter" class="input" aria-label="Filter by topic">${topics.map((t) => `<option value="${esc(t)}" ${state.filter === t ? "selected" : ""}>${t === "All" ? "All topics" : esc(t)}</option>`).join("")}</select></div>${state.search ? `<div class="flex between" style="margin-bottom:20px;font-size:12px"><span>Search results for “${esc(state.search)}”</span><button class="text-btn" data-action="clear-search">Clear search ${icon("close")}</button></div>` : ""}<div class="quiz-grid">${filtered.map(quizCard).join("")}</div>${!filtered.length ? empty("Nothing here just yet.", "Try a different topic, level, or search term.", '<button class="btn outline" data-action="reset-filters">Reset filters</button>') : ""}`
  );
}
function attemptsTable(attempts, creator = false) {
  return attempts.length
    ? `<div class="table-wrap"><table><thead><tr><th>Quiz ${creator ? "& participant" : ""}</th><th>Date</th><th>Score</th><th>Status</th><th>Report</th></tr></thead><tbody>${attempts.map((a) => `<tr><td><strong>${esc(a.title)}</strong><div class="sub">${creator ? esc(a.participantName) : esc(a.topic)}</div></td><td>${date(a.startedAt)}<div class="sub">${time(a.startedAt)}</div></td><td>${a.submittedAt ? `<strong>${a.percent}%</strong><div class="sub">${a.effectiveScore} / ${a.total} correct${a.manualScore !== null ? " · Reviewed" : ""}</div>` : "—"}</td><td><span class="badge ${!a.submittedAt ? "pending" : a.passed ? "approved" : "rejected"}">${!a.submittedAt ? "In progress" : a.passed ? "Passed" : "Keep practising"}</span></td><td><button class="btn outline small" data-action="${a.submittedAt ? "report" : state.data.user.role === "PARTICIPANT" ? "resume" : "active-report"}" data-id="${a.id}">${icon(a.submittedAt ? "chart" : "clock")}${a.submittedAt ? "View report" : "In progress"}</button></td></tr>`).join("")}</tbody></table></div>`
    : empty(
        "Your story is still unfolding.",
        "Completed quiz attempts and detailed reports will appear here.",
        state.data.user.role === "PARTICIPANT"
          ? navBtn("explore", "Find a quiz")
          : "",
      );
}
function history() {
  const creator = state.data.user.role !== "PARTICIPANT";
  return (
    heading(
      "EVERY ATTEMPT COUNTS",
      creator ? "The quiz journal." : "Look how far you’ve come.",
      creator
        ? "A complete record of your quiz content and publication status."
        : "Your attempts, results, and the things you learned along the way.",
    ) + (creator ? manageTable() : attemptsTable(state.data.attempts))
  );
}
function performance() {
  const d = state.data,
    done = completed(),
    average = avg(done.map((a) => a.percent)),
    passed = done.filter((a) => a.passed).length;
  const chartItems = done.slice(0, 10).reverse();
  return (
    heading(
      "TURN INSIGHT INTO PROGRESS",
      d.user.role === "PARTICIPANT"
        ? "A clearer picture of you."
        : "The learning landscape.",
      "Scores tell part of the story. Understanding tells the rest.",
    ) +
    `<div class="stat-grid">${stat("Completed attempts", done.length, "Every attempt included", "book")}${stat("Average score", done.length ? average : "—", "Across completed attempts", "target", done.length ? "%" : "")}${stat("Pass rate", done.length ? Math.round((passed * 100) / done.length) : "—", `${passed} passing submissions`, "check", done.length ? "%" : "")}${stat("Topics practised", topicScores().length, "Building a broader foundation", "leaf")}</div><div class="report-grid"><section class="panel"><h3>Progress over time</h3><p class="muted" style="font-size:11px">Your most recent ${chartItems.length} completed attempts.</p>${chartItems.length ? `<div class="chart" role="img" aria-label="Scores: ${chartItems.map((a) => esc(a.title) + ": " + a.percent + "%").join(", ")}">${chartItems.map((a, i) => `<div class="chart-col"><div class="chart-bar" style="height:${a.percent}%;animation-delay:${i * 0.06}s"><span class="chart-value">${a.percent}%</span></div><span class="chart-label">${date(a.submittedAt, { day: "numeric", month: "short" })}</span></div>`).join("")}</div>` : empty("First, a little practice.", "Complete a quiz to start your progress chart.")}</section><section class="panel"><h3>Average performance</h3><div class="donut" style="--percent:${average}" role="img" aria-label="Average score ${average} percent"><div class="donut-inner"><strong>${done.length ? average + "%" : "—"}</strong><small>${done.length ? "EVERY TRY, COUNTED" : "A FRESH START"}</small></div></div><p style="text-align:center;font-size:11px;color:var(--muted)">Passing threshold for new attempts: ${d.settings.passPercent}%</p></section></div>${section("Your skill landscape", "Average score by topic")}<div class="panel">${skillPanel()}</div>${section("Dig a little deeper", "Open a report for answer-by-answer feedback.")}${attemptsTable(done, d.user.role !== "PARTICIPANT")}`
  );
}
function leaderboard() {
  const leaders = state.data.leaderboard;
  const podium = [leaders[1], leaders[0], leaders[2]].filter(Boolean);
  return (
    heading(
      "A LITTLE FRIENDLY MOMENTUM",
      "Growing, together.",
      "Rankings use your best percentage per quiz. Explore more topics to earn more points.",
    ) +
    `${leaders.length ? `<div class="leader-podium">${podium.map((l) => `<div class="podium-card ${l.rank === 1 ? "first" : ""}"><div class="rank">${l.rank === 1 ? "✦" : "#" + l.rank}</div><span class="avatar">${esc(initials(l.name))}</span><h3>${esc(l.name)}${l.id === state.data.user.id ? " (you)" : ""}</h3><p>${l.quizzes} quizzes completed</p><div class="podium-score">${Math.round(l.points)}</div><p>practice points · ${l.averageScore}% average</p></div>`).join("")}</div><div class="table-wrap"><table><thead><tr><th>Rank</th><th>Learner</th><th>Quizzes</th><th>Best-score average</th><th>Points</th></tr></thead><tbody>${leaders.map((l) => `<tr class="${l.id === state.data.user.id ? "self-row" : ""}"><td>#${l.rank}</td><td><div class="table-avatar"><span class="avatar green">${esc(initials(l.name))}</span><strong>${esc(l.name)}${l.id === state.data.user.id ? " · You" : ""}</strong></div></td><td>${l.quizzes}</td><td>${l.averageScore}%</td><td><strong>${Math.round(l.points)}</strong></td></tr>`).join("")}</tbody></table></div>` : empty("The board is yours to begin.", "Complete a quiz and leave the first mark.", navBtn("explore", "Take a quiz"))}`
  );
}
function users() {
  const users = state.data.users.filter((u) =>
    `${u.name} ${u.email} ${u.role}`
      .toLowerCase()
      .includes(state.search.toLowerCase()),
  );
  return (
    heading(
      "THE PEOPLE BEHIND THE PROGRESS",
      "A studio full of possibility.",
      "Manage accounts, assign roles, and support your learning community.",
      '<button class="btn orange" data-action="user-new">' +
        icon("plus") +
        " Add user</button>",
    ) +
    `<div class="table-wrap"><table><thead><tr><th>Person</th><th>Role</th><th>Joined</th><th>Status</th><th>Manage</th></tr></thead><tbody>${users.map((u) => `<tr><td><div class="table-avatar"><span class="avatar">${esc(initials(u.name))}</span><div><strong>${esc(u.name)}</strong><div class="sub">${esc(u.email)}</div></div></div></td><td>${roleName(u.role)}</td><td>${date(u.createdAt)}</td><td><span class="badge ${u.active ? "approved" : "draft"}">${u.active ? "Active" : "Inactive"}</span></td><td><div class="table-actions"><button class="btn outline small" data-action="user-edit" data-id="${u.id}">${icon("edit")}Edit</button>${u.id !== state.data.user.id && u.active ? `<button class="btn danger small" data-action="user-deactivate" data-id="${u.id}">Deactivate</button>` : ""}</div></td></tr>`).join("")}</tbody></table></div>${!users.length ? empty("No matching accounts.", "Try another name, email, or role.") : ""}`
  );
}
function manageTable() {
  const quizzes = state.data.quizzes.filter(
    (q) =>
      (state.filter === "All" || q.status === state.filter) &&
      `${q.title} ${q.topic}`
        .toLowerCase()
        .includes(state.search.toLowerCase()),
  );
  return quizzes.length
    ? `<div class="table-wrap"><table><thead><tr><th>Quiz content</th><th>Creator</th><th>Details</th><th>Approval</th><th>Actions</th></tr></thead><tbody>${quizzes.map((q) => `<tr><td><strong>${esc(q.title)}</strong><div class="sub">${esc(q.topic)}</div></td><td>${esc(q.creatorName)}<div class="sub">${date(q.createdAt)}</div></td><td>${q.questionCount} questions<div class="sub">${q.durationMinutes} minutes · ${q.attemptCount} submissions</div></td><td><span class="badge ${q.status.toLowerCase()}">${esc(q.status)}</span>${q.reviewNote ? `<div class="sub" style="max-width:180px">${esc(q.reviewNote)}</div>` : ""}</td><td><div class="table-actions"><button class="btn outline small" data-action="quiz-preview" data-id="${q.id}">${icon("eye")}View</button>${!q.attemptCount ? `<button class="btn outline small" data-action="quiz-edit" data-id="${q.id}">${icon("edit")}Edit</button><button class="btn danger small" data-action="quiz-delete" data-id="${q.id}" aria-label="Delete ${esc(q.title)}">${icon("trash")}</button>` : ""}</div></td></tr>`).join("")}</tbody></table></div>`
    : empty(
        "Room for your next idea.",
        "No quizzes match this view. Create a new one or change the filter.",
      );
}
function manage() {
  return (
    heading(
      "THOUGHTFUL CONTENT. REAL LEARNING.",
      state.data.user.role === "ADMIN"
        ? "Keep the quality high."
        : "Your ideas, put into practice.",
      "Draft, refine, submit. Every published quiz begins with a good question.",
      '<button class="btn orange" data-action="quiz-new">' +
        icon("plus") +
        " Create quiz</button>",
    ) +
    `<div class="toolbar"><div class="filter-tabs">${["All", "DRAFT", "PENDING", "APPROVED", "REJECTED"].map((s) => `<button class="filter-tab ${state.filter === s ? "active" : ""}" data-action="status-filter" data-value="${s}">${s === "All" ? "All quizzes" : s[0] + s.slice(1).toLowerCase()}</button>`).join("")}</div></div>` +
    manageTable()
  );
}
function results() {
  return (
    heading(
      "FEEDBACK MAKES THE DIFFERENCE",
      "Help the next step happen.",
      "Review participant results, add context, and share useful feedback.",
    ) + attemptsTable(state.data.attempts, true)
  );
}
function messages() {
  const d = state.data;
  const contact =
    d.contacts.find((c) => c.id === state.contact) || d.contacts[0];
  if (contact) state.contact = contact.id;
  const conversation = d.messages.filter(
    (m) => m.senderId === contact?.id || m.recipientId === contact?.id,
  );
  return (
    heading(
      "A CONVERSATION CAN CHANGE THINGS",
      "Keep the learning human.",
      "Ask a question. Share a thought. Help a little understanding grow.",
    ) +
    (d.contacts.length
      ? `<div class="messages-layout"><aside class="contact-list"><h3>${d.user.role === "CREATOR" ? "Participants" : "Quiz creators"}</h3>${d.contacts.map((c) => `<button class="contact ${c.id === contact?.id ? "active" : ""}" data-action="contact" data-id="${c.id}"><span class="avatar green">${esc(initials(c.name))}</span><span><strong>${esc(c.name)}</strong><small>${roleName(c.role)}</small></span></button>`).join("")}</aside><section class="thread"><div class="thread-head"><strong>${esc(contact.name)}</strong><span class="muted" style="font-size:10px;margin-left:10px">${roleName(contact.role)}</span></div><div class="thread-body">${conversation.map((m) => `<div class="bubble ${m.senderId === d.user.id ? "mine" : ""}"><p>${esc(m.body)}</p><time>${date(m.createdAt, { day: "numeric", month: "short" })} · ${time(m.createdAt)}</time></div>`).join("") || empty("Say a little hello.", "This is the beginning of your conversation.")}</div><form id="message-form" class="message-form"><label class="hidden" for="message-body">Your message</label><textarea id="message-body" name="body" class="input" placeholder="A question, a thought, a little feedback…" rows="1" required maxlength="3000"></textarea><button class="btn" type="submit" aria-label="Send message">${icon("send")}<span class="desktop-only">Send</span></button></form></section></div>`
      : empty(
          "A quiet corner, for now.",
          "Active quiz creators and participants will appear here.",
        ))
  );
}
function reminders() {
  const d = state.data;
  return (
    heading(
      "A SMALL PROMISE TO YOURSELF",
      "Make time for curiosity.",
      "Your practice reminders live here. Due reminders appear in your studio alerts.",
      '<button class="btn orange" data-action="reminder-new">' +
        icon("plus") +
        " Add reminder</button>",
    ) +
    `<div class="notice">${icon("bell")}<p>Reminders are shown inside the app while you’re signed in. Keep the studio open for an on-screen nudge.</p></div><div class="reminder-grid">${d.reminders.map((r) => `<article class="panel reminder-card"><div class="reminder-date"><small>${date(r.remindAt, { month: "short" })}</small><strong>${new Date(r.remindAt).getDate()}</strong></div><div><h3>${esc(r.title)}</h3><p>${date(r.remindAt, { weekday: "long" })} · ${time(r.remindAt)}</p><span class="badge ${r.remindAt < Date.now() ? "pending" : "approved"}" style="margin-top:9px">${r.remindAt < Date.now() ? "Ready when you are" : "Coming up"}</span></div><button class="icon-btn" data-action="reminder-delete" data-id="${r.id}" title="Remove reminder" aria-label="Remove reminder">${icon("trash")}</button></article>`).join("")}</div>${!d.reminders.length ? empty("A little space in your calendar.", "Choose a quiz and set aside a moment to practise.") : ""}`
  );
}
function settings() {
  const s = state.data.settings;
  return (
    heading(
      "MAKE THE STUDIO YOURS",
      "The small details matter.",
      "Set the defaults that keep learning clear, fair, and consistent.",
    ) +
    `<div class="settings-layout"><form id="settings-form" class="panel"><h3>Studio configuration</h3><div class="form-field"><label for="siteName">Studio name</label><input id="siteName" name="siteName" value="${esc(s.siteName)}" maxlength="100" required></div><div class="form-grid"><div class="form-field"><label for="passPercent">Passing score (%)</label><input id="passPercent" name="passPercent" type="number" min="1" max="100" value="${s.passPercent}" required><span class="help">Applies to new attempts only.</span></div><div class="form-field"><label for="defaultDuration">Default duration (minutes)</label><input id="defaultDuration" name="defaultDuration" type="number" min="1" max="180" value="${s.defaultDuration}" required><span class="help">Suggested for newly created quizzes.</span></div><div class="form-field"><label for="maxAttempts">Attempts allowed per quiz</label><input id="maxAttempts" name="maxAttempts" type="number" min="1" max="20" value="${s.maxAttempts}" required></div></div><label class="check-field"><input type="checkbox" name="maintenance" ${s.maintenance ? "checked" : ""}><span>Enable maintenance mode</span></label><p class="muted" style="font-size:11px">Maintenance pauses new quiz attempts and registration. Active attempts can still be submitted.</p><button class="btn" type="submit">${icon("check")}Save settings</button></form><aside class="setting-note">${icon("leaf")}<h3>Consistency builds trust.</h3><p>A clear passing score and enough room to try again help people focus on learning.</p><p>Existing attempts keep their original passing threshold so past reports stay consistent.</p></aside></div>`
  );
}
function alerts() {
  const d = state.data,
    pending = d.quizzes.filter((q) => q.status === "PENDING");
  return (
    heading(
      "A LITTLE ATTENTION GOES A LONG WAY",
      "Your studio, in the loop.",
      "Content reviews and system status in one quiet corner.",
    ) +
    `<div class="stack"><div class="notice">${icon("shield")}<p><strong>${d.settings.maintenance ? "Maintenance mode is on." : "The studio is open for learning."}</strong><br>${d.settings.maintenance ? "New attempts and registration are paused." : "Quiz participation and registration are available."}</p></div>${pending.map((q) => `<article class="panel flex between"><div><h3 style="margin-bottom:7px">A new quiz needs your eye.</h3><p class="muted" style="font-size:12px;margin:0">${esc(q.title)} · submitted by ${esc(q.creatorName)}</p></div><button class="btn outline small" data-action="quiz-preview" data-id="${q.id}">Review ${icon("arrow")}</button></article>`).join("") || empty("All caught up.", "There are no quiz submissions waiting for approval.")}</div>`
  );
}
function report() {
  const a = state.report;
  if (!a)
    return empty(
      "Open a report.",
      "Choose a completed attempt from your history.",
    );
  const answers = Object.fromEntries(
    a.answers.map((x) => [x.questionId, x.selectedIndex]),
  );
  const reviewed = a.manualScore !== null;
  return (
    heading(
      "ONE ATTEMPT. PLENTY TO LEARN.",
      esc(a.title),
      `${a.participantName} · ${date(a.submittedAt)} · ${Math.max(0, Math.ceil((a.submittedAt - a.startedAt) / 60000))} minutes`,
      '<div class="flex wrap"><button class="btn outline small" data-action="export-report">' +
        icon("download") +
        " Export report</button>" +
        (state.data.user.role !== "PARTICIPANT"
          ? `<button class="btn small" data-action="grade" data-id="${a.id}">${icon("edit")}Review & grade</button>`
          : "") +
        "</div>",
    ) +
    `<section class="report-hero"><div class="donut" style="--percent:${a.percent};--color:${a.passed ? "#789369" : "#ba7551"}"><div class="donut-inner"><strong>${a.percent}%</strong><small>${a.effectiveScore} OF ${a.total} POINTS</small></div></div><div><span class="badge ${a.passed ? "approved" : "pending"}">${a.passed ? "PASSED" : "KEEP GROWING"}</span><h2>${a.passed ? "A little more confidence." : "Every attempt teaches you something."}</h2><p>${a.passed ? "You’ve turned practice into progress. Read through the explanations to make the knowledge stick." : "Take a breath, explore the explanations below, and come back when you’re ready. Understanding takes practice."}</p><div class="flex wrap"><span class="pill">Passing score: ${a.passPercent}%</span><span class="pill">${reviewed ? "Reviewed score: " + a.manualScore + " / " + a.total : "Automatically scored"}</span>${reviewed ? `<span class="pill">Original score: ${a.score} / ${a.total}</span>` : ""}</div></div></section>${a.gradeFeedback ? `<div class="notice">${icon("message")}<p><strong>A note from your reviewer</strong><br>${esc(a.gradeFeedback)}</p></div>` : ""}${section("The thinking behind the answers", "A closer look at what went right, and what to try next.")}<div>${a.questions
      .map((q, i) => {
        const selected = answers[q.id],
          correct = selected === q.correctIndex;
        return `<article class="answer-review ${correct ? "" : "incorrect"}"><div class="flex between"><span class="eyebrow" style="font-size:9px">QUESTION ${String(i + 1).padStart(2, "0")}</span><span class="badge ${correct ? "approved" : "rejected"}">${correct ? "Correct" : selected === undefined ? "Unanswered" : "Worth another look"}</span></div><h3 style="margin-top:15px">${esc(q.prompt)}</h3><div class="review-choices">${q.options.map((o, j) => `<div class="review-choice ${j === q.correctIndex ? "correct" : j === selected ? "wrong" : ""}"><strong>${String.fromCharCode(65 + j)}</strong><span>${esc(o)}</span>${j === q.correctIndex ? icon("check") : j === selected ? icon("close") : ""}</div>`).join("")}</div><div class="explanation"><strong>Why this works:</strong> ${esc(q.explanation)}</div></article>`;
      })
      .join("")}</div>`
  );
}
function account() {
  const u = state.data.user;
  return (
    heading(
      "YOUR SPACE IN THE STUDIO",
      "An account that’s yours.",
      "Manage your profile and keep your password up to date.",
    ) +
    `<div class="account-grid"><section class="panel"><h3>Profile details</h3><p class="muted">Your name appears on reports and the leaderboard.</p><form id="profile-form"><div class="form-field"><label for="profile-name">Your name</label><input id="profile-name" name="name" value="${esc(u.name)}" maxlength="100" autocomplete="name" required></div><div class="form-field"><label for="profile-email">Email address</label><input id="profile-email" value="${esc(u.email)}" type="email" readonly><span class="help">Your sign-in ID. Contact an administrator to change it.</span></div><p><span class="badge approved">${roleName(u.role)}</span></p><button class="btn" type="submit">Save profile ${icon("check")}</button></form></section><section class="panel"><h3>Change password</h3><p class="muted">Changing your password signs you out on all devices. Sign in again with your new password.</p><form id="password-form"><div class="form-field"><label for="current-password">Current password</label><input id="current-password" name="currentPassword" type="password" autocomplete="current-password" maxlength="72" required></div><div class="form-field"><label for="new-password">New password</label><input id="new-password" name="newPassword" type="password" autocomplete="new-password" minlength="8" maxlength="72" placeholder="At least 8 characters" required></div><div class="form-field"><label for="new-password-confirm">Confirm new password</label><input id="new-password-confirm" name="confirmPassword" type="password" autocomplete="new-password" minlength="8" maxlength="72" required></div><button class="btn orange" type="submit">Update password ${icon("shield")}</button></form></section></div>`
  );
}
function render() {
  if (!state.data) return renderLanding();
  if (state.attempt && !state.attempt.submittedAt) return renderAttempt();
  cleanup();
  const title = pageTitle();
  const view = (
    {
      overview,
      explore,
      history,
      performance,
      leaderboard,
      users,
      manage,
      results,
      messages,
      reminders,
      settings,
      alerts,
      report,
      account,
    }[state.page] || overview
  )();
  const d = state.data;
  const due = d.reminders.some((r) => r.remindAt <= Date.now());
  const pending = d.quizzes.some((q) => q.status === "PENDING");
  app.innerHTML = `<div class="shell">${sidebar()}<div class="main-area"><header class="topbar"><button class="icon-btn mobile-menu" data-action="menu" aria-label="Open navigation">${icon("menu")}</button><div class="breadcrumb"><span>${esc(d.settings.siteName)}</span><span>/</span><strong>${esc(title)}</strong></div><div class="top-tools"><form id="search-form" class="searchbox">${icon("search")}<input name="search" value="${esc(state.search)}" placeholder="Search the studio…" aria-label="Search quizzes or users"><span class="key-hint">↵</span></form><span class="demo-indicator"><span class="dot"></span> JAVA EDITION</span><button class="icon-btn" data-action="notifications" aria-label="View notifications">${icon("bell")}${due || (pending && d.user.role === "ADMIN") ? '<span class="notify-dot"></span>' : ""}</button><span class="avatar green">${esc(initials(d.user.name))}</span></div></header><main class="content" id="main-content">${view}<footer class="page-footer"><span>Little by little. Line by line.</span><span>QUIZNOVA / JAVA PRACTICE STUDIO</span></footer></main></div></div>`;
  document.title = `${title} · QuizNova`;
  syncMobileNavigation();
  $$("table").forEach((table) => {
    const labels = $$("thead th", table).map((th) => th.textContent);
    $$("tbody tr", table).forEach((row) =>
      $$("td", row).forEach((td, i) => {
        td.dataset.label = labels[i] || "";
        td.innerHTML = `<div class="cell-value">${td.innerHTML}</div>`;
      }),
    );
  });
  mountEffects();
  if (state.page === "messages") {
    const thread = $(".thread-body");
    if (thread) thread.scrollTop = thread.scrollHeight;
  }
}

function modal(title, body, wide = false) {
  previousFocus = document.activeElement;
  $("#modal-root").innerHTML =
    `<div class="modal-backdrop"><section class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header class="modal-head"><h2 id="dialog-title">${esc(title)}</h2><button class="icon-btn" data-action="modal-close" aria-label="Close dialog">${icon("close")}</button></header>${body}</section></div>`;
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    const first =
      $(".modal input:not([type=hidden]),.modal select,.modal textarea") ||
      $(".modal button");
    first?.focus();
  });
}
function closeModal() {
  if (submitting) return;
  $("#modal-root").innerHTML = "";
  document.body.style.overflow = "";
  if (previousFocus?.isConnected) previousFocus.focus();
}
async function refresh(message) {
  await load();
  render();
  if (message) toast(message);
}
function navigate(page) {
  state.page = page;
  state.filter = "All";
  state.difficulty = "All";
  state.search = "";
  state.menu = false;
  state.attempt = null;
  sessionStorage.removeItem("quizcraft-active");
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}
function introQuiz(id) {
  const q = state.data.quizzes.find((q) => q.id === id);
  const active = state.data.attempts.find(
    (a) => a.quizId === id && !a.submittedAt,
  );
  const count = state.data.attempts.filter((a) => a.quizId === id).length;
  modal(
    active ? "Pick up where you left off." : "A moment to get ready.",
    `<p class="modal-intro">${esc(q.title)}<br>${esc(q.description)}</p><div class="flex wrap" style="margin:22px 0"><span class="pill">${q.questionCount} questions</span><span class="pill">${q.durationMinutes} minutes</span><span class="pill">Pass at ${state.data.settings.passPercent}%</span></div><div class="notice">${icon("clock")}<p>${active ? "Your original timer is still running. Your saved answers are waiting for you." : `The timer starts when you begin. Answers save as you go, and your saved work is automatically submitted when time runs out. Attempt ${count + 1} of ${state.data.settings.maxAttempts}.`}</p></div><div class="modal-actions"><button class="btn outline" data-action="modal-close">A little later</button><button class="btn orange" data-action="quiz-start" data-id="${id}" ${!active && count >= state.data.settings.maxAttempts ? "disabled" : ""}>${active ? "Resume quiz" : count >= state.data.settings.maxAttempts ? "Attempt limit reached" : "Let’s begin"} ${icon("arrow")}</button></div>`,
  );
}
function setAttempt(a) {
  state.attempt = a;
  state.answers = Object.fromEntries(
    a.answers.map((x) => [x.questionId, x.selectedIndex]),
  );
  state.qIndex = 0;
  state.serverOffset = a.serverNow - Date.now();
  saveError = false;
  saveQueue = Promise.resolve();
  sessionStorage.setItem(
    "quizcraft-active",
    JSON.stringify({ id: a.id, userId: state.data.user.id }),
  );
  if (a.submittedAt) return showReport(a);
  render();
  window.scrollTo(0, 0);
}
function renderAttempt() {
  cleanup();
  const a = state.attempt,
    q = a.questions[state.qIndex],
    answered = Object.keys(state.answers).length;
  app.innerHTML = `<main class="attempt-shell"><header class="attempt-top">${brand()}<div class="flex"><button class="text-btn desktop-only" data-action="attempt-exit">Back to studio</button><div class="timer" id="quiz-timer" role="timer" aria-label="Time remaining">${icon("clock")}<span>--:--</span></div></div></header><div class="attempt-heading"><div><div class="eyebrow">A LITTLE FOCUS GOES A LONG WAY</div><h1>${esc(a.title)}</h1><p>Take a breath. Read carefully. You’ve got this.</p></div><span class="badge">${answered} / ${a.total} answered</span></div><div class="attempt-layout"><section class="question-card"><div class="question-kicker">QUESTION ${String(state.qIndex + 1).padStart(2, "0")} OF ${String(a.total).padStart(2, "0")}</div><h2 class="question-prompt">${esc(q.prompt)}</h2><div role="group" aria-label="Answer options">${q.options.map((o, i) => `<button class="answer-option ${state.answers[q.id] === i ? "selected" : ""}" data-action="answer" data-index="${i}" aria-pressed="${state.answers[q.id] === i}"><span class="answer-letter">${String.fromCharCode(65 + i)}</span><span>${esc(o)}</span></button>`).join("")}</div><div class="question-bottom"><button class="btn outline" data-action="question-prev" ${state.qIndex === 0 ? "disabled" : ""}>${icon("back")}Previous</button>${state.qIndex < a.total - 1 ? '<button class="btn" data-action="question-next">Next question ' + icon("arrow") + "</button>" : '<button class="btn orange" data-action="submit-confirm">Finish quiz ' + icon("check") + "</button>"}</div></section><aside class="quiz-aside"><h3>Your question map</h3><p>A little green means an answer is saved.</p><div class="question-nav">${a.questions.map((x, i) => `<button class="${i === state.qIndex ? "current" : ""} ${state.answers[x.id] !== undefined ? "answered" : ""}" data-action="question-jump" data-index="${i}" aria-label="Question ${i + 1}${state.answers[x.id] !== undefined ? ", answered" : ""}">${i + 1}</button>`).join("")}</div><button class="btn orange" style="width:100%" data-action="submit-confirm">Submit quiz ${icon("check")}</button><div class="save-status" id="save-status" aria-live="polite">${icon(saveError ? "alert" : "shield")}${saveError ? "Connection issue. Your choices are kept in this tab." : "Your answers save automatically."}</div></aside></div><button class="text-btn" data-action="attempt-exit" style="margin-top:20px">${icon("back")}Back to studio · timer keeps running</button></main>`;
  document.title = `Quiz in progress · ${a.title}`;
  tick();
  timerId = setInterval(tick, 500);
}
function tick() {
  if (!state.attempt || state.attempt.submittedAt) return;
  const remaining = Math.max(
    0,
    Math.ceil(
      (state.attempt.deadlineAt - (Date.now() + (state.serverOffset || 0))) /
        1000,
    ),
  );
  const timer = $("#quiz-timer");
  if (timer) {
    $("span", timer).textContent =
      `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
    timer.classList.toggle("urgent", remaining <= 60);
  }
  if (remaining === 0 && !submitting) submitAttempt(true);
}
function chooseAnswer(index) {
  if (submitting) return;
  const a = state.attempt,
    q = a.questions[state.qIndex];
  state.answers[q.id] = index;
  $$(".answer-option").forEach((b, i) => {
    b.classList.toggle("selected", i === index);
    b.setAttribute("aria-pressed", i === index);
  });
  const navButton = $$(".question-nav button")[state.qIndex];
  navButton?.classList.add("answered");
  navButton?.setAttribute(
    "aria-label",
    `Question ${state.qIndex + 1}, answered`,
  );
  $(".attempt-heading .badge").textContent =
    `${Object.keys(state.answers).length} / ${a.total} answered`;
  const snapshot = { ...state.answers },
    id = a.id;
  const status = $("#save-status");
  if (status) status.innerHTML = icon("clock") + "Saving your choice…";
  saveQueue = saveQueue
    .catch(() => {})
    .then(async () => {
      try {
        const result = await api(`/attempts/${id}/answers`, "PUT", {
          answers: snapshot,
        });
        saveError = false;
        if (result.submittedAt) {
          if (state.attempt?.id === id) await showReport(result);
          return;
        }
        if ($("#save-status"))
          $("#save-status").innerHTML = icon("check") + "All choices saved.";
      } catch (e) {
        saveError = true;
        if ($("#save-status"))
          $("#save-status").innerHTML =
            icon("alert") + "Not saved yet. Keep this tab open and retry.";
        toast(e.message, true);
      }
    });
}
async function submitAttempt(expired = false) {
  if (submitting || !state.attempt) return;
  submitting = true;
  const a = state.attempt;
  const snapshot = { ...state.answers };
  try {
    $$(".modal button,.answer-option").forEach((b) => (b.disabled = true));
    await saveQueue;
    const result = await api(`/attempts/${a.id}/submit`, "POST", {
      answers: snapshot,
    });
    submitting = false;
    closeModal();
    await showReport(result);
    if (expired) toast("Time is up. Your saved answers have been submitted.");
  } catch (e) {
    submitting = false;
    toast(e.message, true);
    $$(".modal button,.answer-option").forEach((b) => (b.disabled = false));
    if (expired) {
      clearInterval(timerId);
      modal(
        "Let’s reconnect.",
        `<p class="modal-intro">The timer has ended. Your saved answers will be scored on the server. Reconnect and open your report.</p><div class="modal-actions"><button class="btn" data-action="retry-submit">Try again ${icon("arrow")}</button></div>`,
      );
    }
  }
}
async function showReport(a) {
  state.attempt = null;
  state.report = a;
  state.page = "report";
  sessionStorage.removeItem("quizcraft-active");
  await load();
  render();
  window.scrollTo(0, 0);
}
async function openReport(id) {
  const a = await api(`/attempts/${id}`);
  if (!a.submittedAt) {
    toast("This participant is still taking the quiz.");
    return;
  }
  state.report = a;
  state.page = "report";
  render();
  window.scrollTo(0, 0);
}

function userEditor(id) {
  const u = state.data.users.find((u) => u.id === id) || {
    name: "",
    email: "",
    role: "PARTICIPANT",
    active: true,
  };
  modal(
    id ? "A little account care." : "Welcome someone new.",
    `<form id="user-form" data-id="${id || ""}"><div class="form-field"><label for="user-name">Full name</label><input id="user-name" name="name" value="${esc(u.name)}" maxlength="100" required></div><div class="form-field"><label for="user-email">Email address</label><input id="user-email" name="email" type="email" value="${esc(u.email)}" maxlength="180" required></div><div class="form-grid"><div class="form-field"><label for="user-role">Workspace role</label><select id="user-role" name="role">${["PARTICIPANT", "CREATOR", "ADMIN"].map((r) => `<option value="${r}" ${u.role === r ? "selected" : ""}>${roleName(r)}</option>`).join("")}</select></div><div class="form-field"><label for="user-password">${id ? "New password (optional)" : "Password"}</label><input id="user-password" name="password" type="password" minlength="8" maxlength="72" ${id ? "" : "required"} autocomplete="new-password" placeholder="At least 8 characters"></div></div><label class="check-field"><input name="active" type="checkbox" ${u.active ? "checked" : ""}>Account is active</label><div class="modal-actions"><button type="button" class="btn outline" data-action="modal-close">Cancel</button><button class="btn" type="submit">Save account ${icon("check")}</button></div></form>`,
  );
}
let editorQuestions = [];
function blankQuestion() {
  return {
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
  };
}
function questionEditor(q, i) {
  return `<section class="question-editor" data-question="${i}"><div class="flex between"><span class="question-number">QUESTION ${String(i + 1).padStart(2, "0")}</span><button type="button" class="text-btn" data-action="question-remove" data-index="${i}" aria-label="Remove question ${i + 1}">${icon("trash")}Remove</button></div><div class="form-field"><label for="prompt-${i}">The question</label><textarea id="prompt-${i}" name="prompt-${i}" maxlength="4000" required placeholder="What should your learner think about?">${esc(q.prompt)}</textarea></div><p class="editor-label">SELECT THE CORRECT ANSWER, THEN WRITE FOUR OPTIONS.</p>${q.options.map((o, j) => `<div class="option-editor"><input type="radio" name="correct-${i}" value="${j}" ${q.correctIndex === j ? "checked" : ""} aria-label="Option ${String.fromCharCode(65 + j)} is correct" required><input class="input" name="option-${i}-${j}" value="${esc(o)}" placeholder="Option ${String.fromCharCode(65 + j)}" aria-label="Option ${String.fromCharCode(65 + j)} text" maxlength="1000" required></div>`).join("")}<div class="form-field"><label for="explanation-${i}">The thinking behind the answer</label><textarea id="explanation-${i}" name="explanation-${i}" maxlength="3000" required placeholder="Explain why the right answer works. It’s where the learning happens.">${esc(q.explanation)}</textarea></div></section>`;
}
function readEditorQuestions() {
  return $$(".question-editor").map((el, i) => ({
    prompt: $(`[name="prompt-${i}"]`, el).value,
    options: [0, 1, 2, 3].map((j) => $(`[name="option-${i}-${j}"]`, el).value),
    correctIndex: Number($(`[name="correct-${i}"]:checked`, el)?.value || 0),
    explanation: $(`[name="explanation-${i}"]`, el).value,
  }));
}
function quizEditor(q = {}) {
  editorQuestions = q.questions || [blankQuestion()];
  const d = state.data;
  modal(
    q.id
      ? "Give your quiz a little polish."
      : "Put a good question into the world.",
    `<form id="quiz-form" data-id="${q.id || ""}"><div class="form-field"><label for="quiz-title">Quiz title</label><input id="quiz-title" name="title" value="${esc(q.title || "")}" placeholder="A clear, memorable title" maxlength="160" required></div><div class="form-field"><label for="quiz-description">A short introduction</label><textarea id="quiz-description" name="description" maxlength="2000" required>${esc(q.description || "")}</textarea></div><div class="form-grid"><div class="form-field"><label for="quiz-topic">Topic</label><input id="quiz-topic" name="topic" value="${esc(q.topic || "Core Java")}" maxlength="80" list="topics" required><datalist id="topics">${["Core Java", "Object-oriented programming", "Collections", "Exception handling", "Streams & lambdas", "Concurrency", "Generics", "JVM internals"].map((t) => `<option value="${esc(t)}">`).join("")}</datalist></div><div class="form-field"><label for="quiz-difficulty">Difficulty</label><select id="quiz-difficulty" name="difficulty">${["Beginner", "Intermediate", "Advanced"].map((l) => `<option ${q.difficulty === l ? "selected" : ""}>${l}</option>`).join("")}</select></div><div class="form-field"><label for="quiz-duration">Duration (minutes)</label><input id="quiz-duration" name="durationMinutes" type="number" min="1" max="180" value="${q.durationMinutes || d.settings.defaultDuration}" required></div></div><div class="notice">${icon("leaf")}<p>Give every question four options and a useful explanation. Published quizzes with attempts stay unchanged to preserve reports.</p></div><div id="editor-questions">${editorQuestions.map(questionEditor).join("")}</div><button type="button" class="btn outline small" data-action="question-add">${icon("plus")}Add a question</button><div class="modal-actions"><button class="btn outline" type="submit" name="intent" value="draft">Save draft</button><button class="btn orange" type="submit" name="intent" value="review">Submit for approval ${icon("arrow")}</button></div></form>`,
    true,
  );
}
async function previewQuiz(id) {
  const q = await api(`/quizzes/${id}/edit`);
  modal(
    q.title,
    `<div class="flex wrap" style="margin-bottom:20px"><span class="badge ${q.status.toLowerCase()}">${q.status}</span><span class="pill">${q.durationMinutes} min</span><span class="pill">${q.questions.length} questions</span></div><p class="modal-intro">${esc(q.description)}</p>${q.questions.map((x, i) => `<article class="answer-review"><h3>${i + 1}. ${esc(x.prompt)}</h3><div class="review-choices">${x.options.map((o, j) => `<div class="review-choice ${j === x.correctIndex ? "correct" : ""}">${String.fromCharCode(65 + j)}. ${esc(o)}${j === x.correctIndex ? icon("check") : ""}</div>`).join("")}</div><div class="explanation">${esc(x.explanation)}</div></article>`).join("")}${state.data.user.role === "ADMIN" && q.status === "PENDING" ? `<form id="review-form" data-id="${q.id}"><div class="form-field"><label for="review-note">Review note (required when returning a quiz)</label><textarea id="review-note" name="note" maxlength="1000" placeholder="Give the creator a little direction…"></textarea></div><div class="modal-actions"><button class="btn danger" name="decision" value="REJECTED" type="submit">Return to creator</button><button class="btn" name="decision" value="APPROVED" type="submit">Approve & publish ${icon("check")}</button></div></form>` : '<div class="modal-actions"><button class="btn outline" data-action="modal-close">Close preview</button></div>'}`,
    true,
  );
}
function reminderEditor() {
  const quizzes = state.data.quizzes;
  if (!quizzes.length) {
    toast("There are no published quizzes to remind you about.");
    return;
  }
  const tomorrow = new Date(Date.now() + 86400000);
  tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
  modal(
    "Save a little time for yourself.",
    `<form id="reminder-form"><div class="form-field"><label for="reminder-quiz">Your next quiz</label><select id="reminder-quiz" name="quizId">${quizzes.map((q) => `<option value="${q.id}">${esc(q.title)}</option>`).join("")}</select></div><div class="form-field"><label for="reminder-time">When would you like to practise?</label><input id="reminder-time" name="remindAt" type="datetime-local" value="${tomorrow.toISOString().slice(0, 16)}" required><span class="help">Shown in your device’s local time. Reminders appear inside QuizNova.</span></div><div class="modal-actions"><button class="btn outline" type="button" data-action="modal-close">Cancel</button><button class="btn" type="submit">Save reminder ${icon("bell")}</button></div></form>`,
  );
}
function gradeEditor() {
  const a = state.report;
  modal(
    "Feedback that moves learning forward.",
    `<p class="modal-intro">${esc(a.participantName)} · ${esc(a.title)}<br>Automatic score: ${a.score} / ${a.total}. Any review adjustment is shown alongside the original score.</p><form id="grade-form" data-id="${a.id}"><div class="form-field"><label for="grade-score">Reviewed score (out of ${a.total})</label><input id="grade-score" type="number" name="score" min="0" max="${a.total}" value="${a.effectiveScore}" required></div><div class="form-field"><label for="grade-feedback">Your feedback</label><textarea id="grade-feedback" name="feedback" maxlength="3000" required placeholder="What went well? What should they explore next?">${esc(a.gradeFeedback)}</textarea></div><div class="modal-actions"><button class="btn outline" type="button" data-action="modal-close">Cancel</button><button class="btn" type="submit">Save review ${icon("check")}</button></div></form>`,
  );
}
function confirmDialog(title, text, action, id, button = "Confirm") {
  modal(
    title,
    `<p class="modal-intro">${esc(text)}</p><div class="modal-actions"><button class="btn outline" data-action="modal-close">Cancel</button><button class="btn orange" data-action="${action}" data-id="${id}">${esc(button)}</button></div>`,
  );
}
function exportReport() {
  const link = document.createElement("a");
  link.href = "/reports/attempts/" + state.report.id;
  link.download = "quiznova-report-" + state.report.id + ".txt";
  link.click();
  toast("Your report download has started.");
}

async function signIn(email, password) {
  await getCsrf();
  const body = new URLSearchParams({ email, password });
  body.set("_csrf", csrf.token);
  const r = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const result = await r.json();
  if (!r.ok) throw new Error(result.message || "Unable to sign in.");
  await getCsrf();
  await load();
  state.page = "overview";
  state.search = "";
  state.filter = "All";
  state.attempt = null;
  state.report = null;
  render();
  window.scrollTo(0, 0);
}
async function busy(element, operation) {
  if (element?.disabled) return;
  const old = element?.innerHTML;
  if (element) {
    element.disabled = true;
    element.innerHTML = "One moment…";
  }
  try {
    return await operation();
  } finally {
    if (element?.isConnected) {
      element.disabled = false;
      element.innerHTML = old;
    }
  }
}
document.addEventListener("click", async (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  event.preventDefault();
  const action = el.dataset.action,
    id = Number(el.dataset.id),
    index = Number(el.dataset.index);
  try {
    switch (action) {
      case "home":
        if (state.attempt) navigate("overview");
        else if (state.data) navigate("overview");
        else renderLanding();
        break;
      case "navigate":
        navigate(el.dataset.page);
        break;
      case "menu":
        state.menu = true;
        syncMobileNavigation();
        $(".sidebar .brand")?.focus();
        break;
      case "menu-close":
        state.menu = false;
        syncMobileNavigation();
        $(".mobile-menu")?.focus();
        break;
      case "auth-switch":
        state.authMode = state.authMode === "login" ? "register" : "login";
        renderLanding();
        break;
      case "logout":
        await api("/auth/logout", "POST");
        csrf = null;
        sessionStorage.removeItem("quizcraft-active");
        state.attempt = null;
        state.authMode = "login";
        renderLanding();
        break;
      case "notifications":
        if (state.data.user.role === "ADMIN") navigate("alerts");
        else if (state.data.user.role === "PARTICIPANT") navigate("reminders");
        else navigate("manage");
        break;
      case "difficulty":
        state.difficulty = el.dataset.value;
        render();
        break;
      case "status-filter":
        state.filter = el.dataset.value;
        render();
        break;
      case "clear-search":
        state.search = "";
        render();
        break;
      case "reset-filters":
        state.search = "";
        state.filter = "All";
        state.difficulty = "All";
        render();
        break;
      case "modal-close":
        closeModal();
        break;
      case "quiz-intro":
        introQuiz(id);
        break;
      case "quiz-start":
        await busy(el, async () => {
          const a = await api(`/quizzes/${id}/start`, "POST");
          closeModal();
          setAttempt(a);
        });
        break;
      case "resume":
        await busy(el, async () => setAttempt(await api(`/attempts/${id}`)));
        break;
      case "answer":
        chooseAnswer(index);
        break;
      case "question-next":
        state.qIndex = Math.min(state.qIndex + 1, state.attempt.total - 1);
        renderAttempt();
        break;
      case "question-prev":
        state.qIndex = Math.max(0, state.qIndex - 1);
        renderAttempt();
        break;
      case "question-jump":
        state.qIndex = index;
        renderAttempt();
        break;
      case "attempt-exit":
        await saveQueue;
        if (saveError) {
          toast(
            "Some answers could not be saved. Please reconnect before leaving.",
            true,
          );
          break;
        }
        navigate("overview");
        await refresh();
        break;
      case "submit-confirm": {
        const unanswered =
          state.attempt.total - Object.keys(state.answers).length;
        modal(
          "Ready to call it a wrap?",
          `<p class="modal-intro">${unanswered ? `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. You can go back and take another look, or submit what you have.` : "Every question has an answer. Submit to see your score and the thinking behind each solution."} Once submitted, your choices are final.</p><div class="modal-actions"><button class="btn outline" data-action="modal-close">Keep thinking</button><button class="btn orange" data-action="submit-final">Submit my quiz ${icon("check")}</button></div>`,
        );
        break;
      }
      case "submit-final":
      case "retry-submit":
        await submitAttempt();
        break;
      case "report":
        await busy(el, () => openReport(id));
        break;
      case "active-report":
        toast("This participant is still taking the quiz.");
        break;
      case "export-report":
        exportReport();
        break;
      case "user-new":
        userEditor();
        break;
      case "user-edit":
        userEditor(id);
        break;
      case "user-deactivate":
        confirmDialog(
          "Give this account a pause.",
          "The user will no longer be able to sign in. Their quiz history stays available. You can reactivate them from Edit.",
          "user-deactivate-confirm",
          id,
          "Deactivate account",
        );
        break;
      case "user-deactivate-confirm":
        await busy(el, async () => {
          const r = await api(`/users/${id}`, "DELETE");
          closeModal();
          await refresh(r.message);
        });
        break;
      case "quiz-new":
        quizEditor();
        break;
      case "quiz-edit":
        await busy(el, async () =>
          quizEditor(await api(`/quizzes/${id}/edit`)),
        );
        break;
      case "quiz-preview":
        await busy(el, () => previewQuiz(id));
        break;
      case "question-add":
        editorQuestions = readEditorQuestions();
        if (editorQuestions.length >= 100) {
          toast("A quiz can have up to 100 questions.", true);
          break;
        }
        editorQuestions.push(blankQuestion());
        $("#editor-questions").innerHTML = editorQuestions
          .map(questionEditor)
          .join("");
        $$(".question-editor")
          .at(-1)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      case "question-remove":
        editorQuestions = readEditorQuestions();
        if (editorQuestions.length === 1) {
          toast("Keep at least one question in your quiz.");
          break;
        }
        editorQuestions.splice(index, 1);
        $("#editor-questions").innerHTML = editorQuestions
          .map(questionEditor)
          .join("");
        break;
      case "quiz-delete":
        confirmDialog(
          "Make a little room.",
          "Delete this quiz and its questions? Only quizzes without attempts can be deleted.",
          "quiz-delete-confirm",
          id,
          "Delete quiz",
        );
        break;
      case "quiz-delete-confirm":
        await busy(el, async () => {
          const r = await api(`/quizzes/${id}`, "DELETE");
          closeModal();
          await refresh(r.message);
        });
        break;
      case "grade":
        gradeEditor();
        break;
      case "contact":
        state.contact = id;
        render();
        break;
      case "reminder-new":
        reminderEditor();
        break;
      case "reminder-delete":
        await busy(el, async () => {
          const r = await api(`/reminders/${id}`, "DELETE");
          await refresh(r.message);
        });
        break;
    }
  } catch (e) {
    toast(e.message, true);
    if (e.status === 401 && state.data) {
      state.attempt = null;
      renderLanding(e.message);
    }
  }
});
document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (
    ![
      "auth-form",
      "search-form",
      "user-form",
      "quiz-form",
      "review-form",
      "grade-form",
      "message-form",
      "reminder-form",
      "settings-form",
      "profile-form",
      "password-form",
    ].includes(form.id)
  )
    return;
  event.preventDefault();
  const data = new FormData(form),
    values = Object.fromEntries(data),
    submitter = event.submitter;
  try {
    await busy(submitter, async () => {
      switch (form.id) {
        case "auth-form": {
          const error = $("#auth-error");
          error.hidden = true;
          state.authEmail = values.email.trim();
          if (state.authMode === "register") {
            if (values.password !== values.confirmPassword)
              throw new Error(
                "The passwords do not match. Please enter them again.",
              );
            await api("/auth/register", "POST", {
              name: values.name,
              email: state.authEmail,
              password: values.password,
            });
            state.authMode = "login";
            renderLanding(
              "",
              "Your account is ready! Sign in with your email and password.",
            );
            $("#auth-password")?.focus();
          } else await signIn(state.authEmail, values.password);
          break;
        }
        case "profile-form": {
          const r = await api("/account/profile", "PUT", { name: values.name });
          await refresh(r.message);
          break;
        }
        case "password-form": {
          if (values.newPassword !== values.confirmPassword)
            throw new Error("The new passwords do not match.");
          const r = await api("/account/password", "PUT", {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          });
          state.authEmail = state.data.user.email;
          await api("/auth/logout", "POST").catch(() => {});
          csrf = null;
          sessionStorage.removeItem("quizcraft-active");
          state.attempt = null;
          state.authMode = "login";
          renderLanding("", r.message);
          break;
        }
        case "search-form":
          state.search = values.search.trim();
          if (state.data.user.role === "PARTICIPANT") state.page = "explore";
          else if (state.page !== "users") state.page = "manage";
          state.filter = "All";
          state.difficulty = "All";
          render();
          break;
        case "user-form": {
          const id = form.dataset.id;
          const r = await api(
            "/users" + (id ? "/" + id : ""),
            id ? "PUT" : "POST",
            { ...values, active: data.has("active") },
          );
          closeModal();
          await refresh(r.message);
          break;
        }
        case "quiz-form": {
          const id = form.dataset.id;
          const r = await api(
            "/quizzes" + (id ? "/" + id : ""),
            id ? "PUT" : "POST",
            {
              title: values.title,
              description: values.description,
              topic: values.topic,
              difficulty: values.difficulty,
              durationMinutes: Number(values.durationMinutes),
              questions: readEditorQuestions(),
              submitForReview: submitter?.value === "review",
            },
          );
          closeModal();
          state.page = "manage";
          state.filter = "All";
          await refresh(r.message);
          break;
        }
        case "review-form": {
          const status = submitter.value;
          if (status === "REJECTED" && !values.note.trim())
            throw new Error(
              "Add a review note so the creator knows what to improve.",
            );
          const r = await api(`/quizzes/${form.dataset.id}/review`, "POST", {
            status,
            note: values.note,
          });
          closeModal();
          await refresh(r.message);
          break;
        }
        case "grade-form": {
          const id = form.dataset.id;
          const r = await api(`/attempts/${id}/grade`, "POST", {
            score: Number(values.score),
            feedback: values.feedback,
          });
          closeModal();
          await load();
          state.report = await api(`/attempts/${id}`);
          render();
          toast(r.message);
          break;
        }
        case "message-form": {
          const r = await api("/messages", "POST", {
            recipientId: state.contact,
            body: values.body,
          });
          await refresh(r.message);
          $("#message-body")?.focus();
          break;
        }
        case "reminder-form": {
          const r = await api("/reminders", "POST", {
            quizId: Number(values.quizId),
            remindAt: new Date(values.remindAt).getTime(),
          });
          closeModal();
          await refresh(r.message);
          break;
        }
        case "settings-form": {
          const r = await api("/settings", "PUT", {
            siteName: values.siteName,
            passPercent: Number(values.passPercent),
            defaultDuration: Number(values.defaultDuration),
            maxAttempts: Number(values.maxAttempts),
            maintenance: data.has("maintenance"),
          });
          await refresh(r.message);
          break;
        }
      }
    });
  } catch (e) {
    if (form.id === "auth-form" && $("#auth-error")) {
      const banner = $("#auth-error");
      banner.textContent = e.message;
      banner.hidden = false;
      banner.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      toast(e.message, true);
      if (e.status === 401 && state.data) {
        state.attempt = null;
        state.authMode = "login";
        renderLanding(e.message);
      }
    }
  }
});
document.addEventListener("change", (event) => {
  if (event.target.id === "topic-filter") {
    state.filter = event.target.value;
    render();
  }
  if (event.target.hasAttribute("data-password-toggle")) {
    $$(
      'input[name="password"],input[name="confirmPassword"]',
      event.target.form,
    ).forEach(
      (input) => (input.type = event.target.checked ? "text" : "password"),
    );
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.menu) {
    state.menu = false;
    syncMobileNavigation();
    $(".mobile-menu")?.focus();
  }
  const dialog = $(".modal");
  if (!dialog) return;
  if (e.key === "Escape") {
    closeModal();
    return;
  }
  if (e.key === "Tab") {
    const controls = $$(
      "button:not(:disabled),input:not(:disabled),select,textarea,a[href]",
      dialog,
    );
    const first = controls[0],
      last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
});
window.addEventListener("resize", syncMobileNavigation);
window.addEventListener("beforeunload", (e) => {
  if (saveError && state.attempt) {
    e.preventDefault();
    e.returnValue = "";
  }
});
// Poll only while visible: messages, approvals, and in-app reminders stay current.
const reminded = new Set();
setInterval(async () => {
  if (
    !state.data ||
    state.attempt ||
    document.hidden ||
    $(".modal") ||
    document.activeElement?.matches("input,textarea,select")
  )
    return;
  try {
    await load();
    for (const r of state.data.reminders) {
      if (r.remindAt <= Date.now() && !reminded.has(r.id)) {
        reminded.add(r.id);
        toast(
          `A little time for Java? Your reminder for “${r.title}” is ready.`,
        );
      }
    }
    if (["messages", "alerts", "reminders", "manage"].includes(state.page))
      render();
  } catch (e) {
    if (e.status === 401) {
      state.attempt = null;
      state.authMode = "login";
      renderLanding(e.message);
    }
  }
}, 20000);
async function init() {
  try {
    await load();
    const active = JSON.parse(
      sessionStorage.getItem("quizcraft-active") || "null",
    );
    if (active?.userId === state.data.user.id) {
      try {
        return setAttempt(await api(`/attempts/${active.id}`));
      } catch {
        sessionStorage.removeItem("quizcraft-active");
      }
    }
    render();
  } catch (e) {
    if (e.status === 401) renderLanding();
    else
      renderLanding(
        "The studio is having trouble connecting. Please try again.",
      );
  }
}
init();
