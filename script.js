const fileData = {
  agents: { path: "/project/AGENTS.md", status: "READ FIRST", content: `# 에이전트 작업 규칙

- 목표: Google 로그인 사용자가 맛집을 검색하고 저장한다.
- 검색 Secret은 서버 Route에서만 사용한다.
- favorites는 auth.uid()와 user_id가 같은 행만 다룬다.
- 수정 전 관련 Route·테이블·환경변수를 먼저 확인한다.
- 검색 → 저장 → 새로고침을 실제로 시험한 뒤 보고한다.` },
  project: { path: "/project/PROJECT_BRIEF.md", status: "PROJECT NORTH STAR", content: `# 프로젝트 목적

- 이름: 오늘뭐먹지
- 사용자: 점심 장소를 빠르게 고르고 싶은 학생
- 문제: 검색 결과를 매번 다시 찾아야 한다.
- 핵심 기능: Google 로그인, 지역 검색, 내 즐겨찾기
- 이번 버전 제외: 리뷰 작성, 결제, 실시간 예약
- 성공 기준: 성수동 파스타 3건 조회 후 1건 저장

프로젝트의 방향이 흔들릴 때 이 문서를 다시 확인한다.` },
  ui: { path: "/project/UI_REFERENCE.md", status: "DESIGN MEMORY", content: `# 디자인 기준

- 검색창 placeholder: "지역과 메뉴를 입력하세요"
- 첫 검색 예시: "성수동 파스타"
- 결과 카드는 식당명·분류·주소·저장 버튼 순서
- 저장된 카드는 별 아이콘과 "저장됨" 상태 표시
- 401은 "API 연결을 확인해주세요"로 안내
- 모바일 1열과 키보드 포커스를 반드시 확인한다.` },
  api: { path: "/project/API_CONTRACT.md", status: "INTEGRATION RULES", content: `# 네이버 지역 검색 계약

- GET /v1/search/local.json
- query: 성수동 파스타
- display: 3
- headers: X-Naver-Client-Id / Client-Secret
- success: 200 + items[].title/category/roadAddress
- errors: 401 키 확인, 429 호출 한도 확인
- Secret은 /api/search 서버 Route에서만 읽는다.` },
  worklog: { path: "/project/WORKLOG.md", status: "HANDOFF MEMORY", content: `# 작업 기록

## 완료한 기능
- Google 로그인 후 /search로 복귀
- "성수동 파스타" 검색 결과 3건 표시
- favorites 저장·삭제와 사용자별 RLS 검증
- main push 후 Vercel 운영 배포 확인

## 다음 작업
- 모바일에서 식당 카드 간격 확인
- 네이버 401·429 오류 문구 개선
- 지도 마커 확장 기능 검토

작업 기록은 다음 에이전트에게 전달하는 인수인계서다.` }
};

const prompts = {
  before: `오늘뭐먹지 프로젝트에서 "검색 결과를 즐겨찾기에 저장" 기능을 만들려고 합니다.

아직 수정하지 말고,
1. 현재 검색 API Route와 favorites 테이블 구조
2. 수정할 파일과 작업 순서
3. user_id 누락·RLS 충돌·Secret 노출 위험

을 먼저 확인해 보고해주세요.`,
  after: `오늘뭐먹지의 즐겨찾기 기능을 실제 사용자 흐름으로 검증해주세요.

1. Google 로그인
2. "성수동 파스타" 검색 3건
3. 1건 저장 후 새로고침
4. 다른 계정에서는 해당 저장 항목이 보이지 않는지

확인한 화면·상태 코드·DB 결과만 보고해주세요.`,
  docs: `즐겨찾기 기능의 실제 변경 내용을 기준으로 문서를 갱신해주세요.

API_CONTRACT.md에는 요청·응답과 401/429를,
DATA_MODEL.md에는 favorites 열과 RLS를,
WORKLOG.md에는 테스트 결과를 기록해주세요.

수정하지 않아도 되는 문서는 건드리지 말고
변경한 문서와 근거를 마지막에 보고해주세요.`
};

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupNavigation() {
  const navLinks = qsa(".nav a");
  const sections = qsa("main section[id]");
  const hud = qs("[data-hud-section]");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
      if (hud) {
        const name = entry.target.querySelector(".eyebrow")?.textContent?.split("·").pop()?.trim() || entry.target.id;
        hud.textContent = `${entry.target.dataset.section || "00"} / ${name}`;
      }
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  sections.forEach(section => observer.observe(section));
}

function setupReferenceTabs() {
  qsa("[data-ref-tab]").forEach(button => button.addEventListener("click", () => {
    qsa("[data-ref-tab]").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    qsa("[data-ref-panel]").forEach(panel => {
      const active = panel.dataset.refPanel === button.dataset.refTab;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    window.ScrollTrigger?.refresh();
  }));
}

function setupDebugFilters() {
  const buttons = qsa("[data-debug-filter]");
  const cases = qsa("[data-debug-category]");
  buttons.forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.debugFilter;
    buttons.forEach(item => item.classList.toggle("active", item === button));
    cases.forEach(item => {
      const visible = filter === "all" || item.dataset.debugCategory === filter;
      item.hidden = !visible;
      if (!visible) item.open = false;
    });
    window.ScrollTrigger?.refresh();
  }));
}

function setupCinematic() {
  const boot = qs(".boot-screen");
  if (!boot) return;
  if (reduceMotion || !window.gsap) {
    boot.remove();
    qsa("[data-count]").forEach(item => { item.textContent = item.dataset.count; });
    return;
  }

  const bootValue = qs(".boot-screen>b");
  const counter = { value: 0 };
  gsap.timeline({ onComplete: () => boot.remove() })
    .to(counter, { value: 100, duration: 1.1, ease: "power2.inOut", onUpdate: () => { bootValue.textContent = String(Math.round(counter.value)).padStart(2, "0"); } })
    .to(".boot-track span", { width: "100%", duration: 1.1, ease: "power2.inOut" }, 0)
    .to(".boot-mark", { rotation: 180, scale: .82, duration: .45, ease: "back.in(2)" }, .85)
    .to(boot, { clipPath: "inset(0 0 100% 0)", duration: .8, ease: "power4.inOut" }, 1.15);

  qsa("[data-count]").forEach(item => {
    const target = Number(item.dataset.count);
    const state = { value: 0 };
    gsap.to(state, { value: target, duration: 1.4, delay: 1.6, ease: "power3.out", onUpdate: () => { item.textContent = `${Math.round(state.value)}${item.dataset.count === "20" ? "+" : ""}`; } });
  });

  qsa(".magnetic").forEach(button => {
    button.addEventListener("pointermove", event => {
      if (matchMedia("(pointer: coarse)").matches) return;
      const rect = button.getBoundingClientRect();
      gsap.to(button, { x: (event.clientX - rect.left - rect.width / 2) * .12, y: (event.clientY - rect.top - rect.height / 2) * .16, duration: .25 });
    });
    button.addEventListener("pointerleave", () => gsap.to(button, { x: 0, y: 0, duration: .5, ease: "elastic.out(1,.45)" }));
  });
}

function setupProgressAndGlow() {
  const progress = qs(".scroll-progress span");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const glow = qs(".cursor-glow");
  addEventListener("pointermove", event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

function setupTabs() {
  qsa(".file-card").forEach(button => button.addEventListener("click", () => {
    qsa(".file-card").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const data = fileData[button.dataset.file];
    qs("#file-path").textContent = data.path;
    qs(".detail-status").textContent = data.status;
    qs("#file-content code").textContent = data.content;
  }));

  qsa(".prompt-tab").forEach(button => button.addEventListener("click", () => {
    qsa(".prompt-tab").forEach(item => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    qs("#prompt-code code").textContent = prompts[button.dataset.prompt];
  }));
}

function setupCopy() {
  const toast = qs(".toast");
  async function copyTarget(selector) {
    const element = qs(selector);
    if (!element) return;
    const text = element.innerText.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1400);
  }
  qsa("[data-copy]").forEach(button => button.addEventListener("click", () => copyTarget(button.dataset.copy)));
}

function setupTilt() {
  qsa(".tilt-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      if (matchMedia("(pointer: coarse)").matches || reduceMotion) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

function setupMotion() {
  const steps = qsa(".workflow-step");
  const track = qs(".workflow-track span");
  const setStep = index => {
    steps.forEach((step, stepIndex) => step.classList.toggle("active", stepIndex === index));
    if (track) track.style.width = `${Math.max(17, ((index + 1) / steps.length) * 100)}%`;
  };

  if (!window.gsap || !window.ScrollTrigger || reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
    }, { threshold: 0.13 });
    qsa(".reveal").forEach(element => revealObserver.observe(element));
    let stepIndex = 0;
    setInterval(() => { stepIndex = (stepIndex + 1) % steps.length; setStep(stepIndex); }, 2300);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("gsap-ready");

  const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTimeline
    .from(".hero-copy > *", { y: 34, opacity: 0, duration: 0.85, stagger: 0.09 })
    .from(".agent-orbit", { scale: 0.82, opacity: 0, duration: 1 }, "-=0.65")
    .from(".orbit-node", { scale: 0.6, opacity: 0, duration: 0.65, stagger: 0.08 }, "-=0.55");

  qsa(".reveal:not(.hero-copy):not(.agent-orbit)").forEach(element => {
    gsap.from(element, {
      y: 42,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: element, start: "top 86%", once: true }
    });
  });

  gsap.to(".orbit-one", { rotation: 360, duration: 28, repeat: -1, ease: "none" });
  gsap.to(".orbit-two", { rotation: -360, duration: 21, repeat: -1, ease: "none" });
  gsap.to(".agent-orbit", {
    yPercent: -9,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
  });

  ScrollTrigger.create({
    trigger: ".workflow-board",
    start: "top 78%",
    end: "bottom 30%",
    scrub: true,
    onUpdate: self => setStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length)))
  });

  qsa(".future-principles article").forEach((card, index) => {
    gsap.from(card, {
      y: 55 + index * 8,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.05,
      scrollTrigger: { trigger: ".future-principles", start: "top 82%", once: true }
    });
  });

  gsap.from(".command-card", {
    y: 90,
    rotationX: -12,
    opacity: 0,
    stagger: .08,
    duration: 1,
    ease: "power4.out",
    scrollTrigger: { trigger: ".command-grid", start: "top 82%", once: true }
  });

  gsap.to(".agent-orbit", {
    rotation: 2.5,
    scale: 1.04,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  qsa(".reference-head h2, .future-copy h2").forEach(element => {
    gsap.from(element, { clipPath: "inset(0 0 100% 0)", y: 50, duration: 1.15, ease: "power4.out", scrollTrigger: { trigger: element, start: "top 82%", once: true } });
  });

  qsa(".debug-casebook details, .link-atlas a").forEach((element, index) => {
    gsap.from(element, { y: 45, opacity: 0, rotateY: index % 2 ? 5 : -5, duration: .7, scrollTrigger: { trigger: element, start: "top 90%", once: true } });
  });
}

function projectPreviewUrl(url, nonce = Date.now()) {
  const secureUrl = url.replace(/^http:\/\//, "https://");
  const separator = secureUrl.includes("?") ? "&" : "?";
  const refreshableUrl = `${secureUrl}${separator}gallery_refresh=${nonce}`;
  return `https://image.thum.io/get/width/900/crop/560/noanimate/${refreshableUrl}`;
}

function isVercelProject(project) {
  try {
    const hostname = new URL(project.url).hostname.toLowerCase();
    return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function createProjectCard(project, nonce) {
  const article = document.createElement("article");
  article.className = "project-card";
  const previewLink = document.createElement("a");
  previewLink.className = "project-preview";
  previewLink.href = project.url;
  previewLink.target = "_blank";
  previewLink.rel = "noopener noreferrer";
  const image = document.createElement("img");
  image.src = projectPreviewUrl(project.url, nonce);
  image.alt = `${project.author || "학생"} 프로젝트 대표 화면`;
  image.loading = "lazy";
  image.referrerPolicy = "no-referrer";
  image.addEventListener("error", () => article.classList.add("preview-error"), { once: true });
  const previewLabel = document.createElement("span");
  previewLabel.textContent = "LIVE PREVIEW";
  previewLink.append(image, previewLabel);
  const meta = document.createElement("div");
  meta.className = "project-meta";
  const avatar = document.createElement("span");
  avatar.className = "project-avatar";
  avatar.textContent = (project.author || "학생").trim().slice(0, 1).toUpperCase();
  const identity = document.createElement("div");
  const author = document.createElement("strong");
  author.textContent = project.author || "학생";
  const address = document.createElement("small");
  address.textContent = project.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  identity.append(author, address);
  meta.append(avatar, identity);
  const detail = document.createElement("div");
  detail.className = "project-detail";
  const title = document.createElement("h3");
  title.textContent = project.title || "학생 프로젝트";
  const summary = document.createElement("p");
  summary.textContent = project.summary || "게시글에 등록된 Vercel 프로젝트입니다.";
  const signals = document.createElement("div");
  signals.className = "project-signals";
  const published = project.publishedAt ? new Date(project.publishedAt).toLocaleDateString("ko-KR") : "날짜 확인 중";
  [
    `게시 ${published}`,
    `조회 ${Number(project.views || 0)}`,
    `♥ ${Number(project.likes || 0)}`,
    `댓글 ${Number(project.commentCount || 0)}`
  ].forEach(text => {
    const badge = document.createElement("span");
    badge.textContent = text;
    signals.append(badge);
  });
  detail.append(title, summary, signals);

  const comments = Array.isArray(project.comments) ? project.comments.slice(0, 2) : [];
  if (comments.length) {
    const commentBox = document.createElement("div");
    commentBox.className = "project-comments";
    const label = document.createElement("small");
    label.textContent = "LATEST COMMENTS";
    commentBox.append(label);
    comments.forEach(comment => {
      const line = document.createElement("p");
      const name = document.createElement("b");
      name.textContent = comment.author || "카페 멤버";
      line.append(name, document.createTextNode(` ${comment.text || ""}`));
      commentBox.append(line);
    });
    detail.append(commentBox);
  }

  const actions = document.createElement("div");
  actions.className = "project-actions";
  const link = document.createElement("a");
  link.className = "project-open";
  link.href = project.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "작품 열기 ↗";
  actions.append(link);
  if (project.articleUrl) {
    const articleLink = document.createElement("a");
    articleLink.className = "project-article";
    articleLink.href = project.articleUrl;
    articleLink.target = "_blank";
    articleLink.rel = "noopener noreferrer";
    articleLink.textContent = "게시글 보기 ↗";
    actions.append(articleLink);
  }
  article.append(previewLink, meta, detail, actions);
  return article;
}

function createEmptyProjectState(data) {
  const empty = document.createElement("article");
  empty.className = "voice-empty project-feed-empty";
  const label = document.createElement("span");
  label.textContent = "WAITING FOR TODAY'S POSTS";
  const title = document.createElement("h3");
  title.textContent = "오늘 이후 등록된 Vercel 작품이 아직 없습니다.";
  const note = document.createElement("p");
  const start = data.fromDate ? new Date(`${data.fromDate}T00:00:00+09:00`).toLocaleDateString("ko-KR") : "오늘";
  note.textContent = `${start}부터 ‘결과물 자랑하기’ 게시판의 새 글을 확인합니다. 학생이 글 본문에 *.vercel.app 주소를 올리면 다음 동기화 때 이곳에 표시됩니다.`;
  empty.append(label, title, note);
  return empty;
}

async function loadProjects({ refresh = false } = {}) {
  const grid = qs("#project-grid");
  const status = qs("#project-status");
  const updated = qs("#project-updated");
  const button = qs("#project-refresh");
  if (!grid || !status) return;
  if (button) button.disabled = true;
  status.textContent = refresh ? "REFRESHING PROJECT FEED" : "LOADING PROJECT FEED";
  try {
    let response = await fetch(`/api/projects?t=${Date.now()}`, { cache: "no-store" });
    let data;
    if (response.ok) {
      data = await response.json();
    } else {
      response = await fetch(`./student-projects.json?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("project feed unavailable");
      data = await response.json();
      data.source = "local-fallback";
    }
    if (!Array.isArray(data.projects)) throw new Error("project feed invalid");
    const projects = data.projects.filter(isVercelProject);
    const nonce = Date.now();
    grid.replaceChildren(...(projects.length ? projects.map(project => createProjectCard(project, nonce)) : [createEmptyProjectState(data)]));
    const articleCount = Number(data.scan?.articles || 0);
    status.textContent = projects.length
      ? `${projects.length} VERCEL PROJECTS · ${articleCount} POSTS SCANNED`
      : `0 PROJECTS · ${articleCount} POSTS SINCE ${data.fromDate || "TODAY"}`;
    if (updated) {
      const date = data.updatedAt ? new Date(data.updatedAt) : new Date();
      const sourceLabel = data.source === "supabase" ? "Supabase 갱신" : "로컬 백업";
      updated.textContent = `${sourceLabel} ${date.toLocaleString("ko-KR")}`;
    }
  } catch {
    status.textContent = "PROJECT FEED UNAVAILABLE";
    if (updated) updated.textContent = "Supabase 연결과 로컬 백업을 확인하세요";
  } finally {
    if (button) button.disabled = false;
  }
}

setupNavigation();
setupProgressAndGlow();
setupTabs();
setupCopy();
setupTilt();
setupReferenceTabs();
setupDebugFilters();
setupMotion();
setupCinematic();
qs("#project-refresh")?.addEventListener("click", () => loadProjects({ refresh: true }));
loadProjects();
