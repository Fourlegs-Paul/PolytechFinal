const fileData = {
  agents: { path: "/project/AGENTS.md", status: "READ FIRST", content: `# 에이전트 작업 규칙

- 수정 전 현재 프로젝트를 먼저 확인한다.
- 아직 수정하지 말고 계획부터 설명한다.
- 관련 없는 파일은 변경하지 않는다.
- 실행 결과를 확인한 뒤 완료를 보고한다.
- 중요한 변경은 관련 MD 문서에 반영한다.` },
  project: { path: "/project/PROJECT_BRIEF.md", status: "PROJECT NORTH STAR", content: `# 프로젝트 목적

- 해결하려는 문제:
- 주요 사용자:
- 반드시 제공할 핵심 기능:
- 이번 버전에서 하지 않을 것:
- 성공했다고 판단할 기준:

프로젝트의 방향이 흔들릴 때 이 문서를 다시 확인한다.` },
  ui: { path: "/project/UI_REFERENCE.md", status: "DESIGN MEMORY", content: `# 디자인 기준

- references 폴더의 이미지를 먼저 확인한다.
- 모든 화면은 같은 타이포그래피 체계를 사용한다.
- 색상은 제한적으로 사용한다.
- 카드, 버튼, 모달의 모양을 통일한다.
- 움직임은 내용을 설명할 때만 사용한다.
- 모바일 화면과 모션 감소 설정을 확인한다.` },
  api: { path: "/project/API_CONTRACT.md", status: "INTEGRATION RULES", content: `# 외부 API 규칙

- 키를 코드에 직접 작성하지 않는다.
- 로컬과 배포 환경의 비밀값을 분리한다.
- 요청과 응답 데이터 형식을 먼저 정리한다.
- 서버와 브라우저에서 사용할 키를 구분한다.
- 실패, 재시도, 제한 정책을 기록한다.` },
  worklog: { path: "/project/WORKLOG.md", status: "HANDOFF MEMORY", content: `# 작업 기록

## 완료한 기능
- 데이터 흐름 연결
- 사용자별 접근 규칙 검토
- 외부 서비스 연동
- 운영 환경 검증

## 다음 작업
- 실제 사용자 테스트
- 오류와 개선점 기록
- 관련 문서 갱신

작업 기록은 다음 에이전트에게 전달하는 인수인계서다.` }
};

const prompts = {
  before: `현재 프로젝트를 먼저 확인해주세요.

아직 수정하지 말고,
1. 수정할 파일
2. 작업 순서
3. 기존 기능에 생길 수 있는 위험

을 먼저 설명해주세요.`,
  after: `개발 결과를 실제 기준으로 보고해주세요.

1. 수정한 파일
2. 실행 또는 빌드 결과
3. 해결하지 못한 문제
4. 확인이 필요한 부분

추측하지 말고 확인한 사실만 작성해주세요.`,
  docs: `현재 기능 개발이 정상적으로 완료됐습니다.

실제 변경 내용을 기준으로
수정이 필요한 MD 파일만 갱신해주세요.

추측해서 작성하지 말고,
변경한 문서와 핵심 내용을 마지막에 보고해주세요.`
};

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupNavigation() {
  const navLinks = qsa(".nav a");
  const sections = qsa("main section[id]");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  sections.forEach(section => observer.observe(section));
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
}

function createVoiceCard(comment) {
  const article = document.createElement("article");
  article.className = "voice-card";
  const meta = document.createElement("div");
  meta.className = "voice-meta";
  const avatar = document.createElement("span");
  avatar.className = "voice-avatar";
  avatar.textContent = (comment.author || "익명").trim().slice(0, 1).toUpperCase();
  const identity = document.createElement("div");
  const author = document.createElement("strong");
  author.textContent = comment.author || "익명";
  const date = document.createElement("small");
  date.textContent = comment.date || "동기화된 댓글";
  identity.append(author, date);
  meta.append(avatar, identity);
  const quote = document.createElement("blockquote");
  quote.textContent = comment.text || "";
  article.append(meta, quote);
  if (comment.url) {
    const link = document.createElement("a");
    link.href = comment.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "원문 보기 ↗";
    article.append(link);
  }
  return article;
}

async function loadVoices() {
  const grid = qs("#voice-grid");
  const status = qs("#voice-status");
  try {
    const response = await fetch("./comments.json", { cache: "no-store" });
    if (!response.ok) throw new Error("comment feed unavailable");
    const data = await response.json();
    if (!Array.isArray(data.comments) || data.comments.length === 0) return;
    grid.replaceChildren(...data.comments.slice(0, 12).map(createVoiceCard));
    status.textContent = `${data.comments.length} COMMENTS SYNCED`;
  } catch {
    status.textContent = "LOCAL COMMENT FEED";
  }
}

setupNavigation();
setupProgressAndGlow();
setupTabs();
setupCopy();
setupTilt();
setupMotion();
loadVoices();
