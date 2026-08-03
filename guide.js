const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const progressBar = qs('.scroll-progress span');
const glow = qs('.cursor-glow');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
};

addEventListener('scroll', updateProgress, { passive: true });
addEventListener('pointermove', event => {
  if (glow) glow.style.transform = `translate(${event.clientX - 180}px, ${event.clientY - 180}px)`;
}, { passive: true });
updateProgress();

const copyText = async (text, button) => {
  try {
    await navigator.clipboard.writeText(text);
    const original = button.textContent;
    button.textContent = '복사됨';
    setTimeout(() => { button.textContent = original; }, 1300);
  } catch { button.textContent = '복사 실패'; }
};

qsa('[data-copy]').forEach(button => button.addEventListener('click', () => copyText(button.dataset.copy, button)));
qsa('[data-copy-target]').forEach(button => button.addEventListener('click', () => {
  const target = qs(button.dataset.copyTarget);
  copyText(target?.innerText || '', button);
}));

const envExample = qs('#env-example');
qsa('[data-framework]').forEach(button => button.addEventListener('click', () => {
  qsa('[data-framework]').forEach(item => item.classList.toggle('active', item === button));
  const value = envExample.dataset[button.dataset.framework];
  qs('code', envExample).textContent = value;
}));

const checks = qsa('[data-checklist] input');
const checkBar = qs('.check-progress span');
const checkCount = qs('.check-progress b');
checks.forEach((input, index) => {
  input.checked = localStorage.getItem(`guide-check-${index}`) === '1';
  input.addEventListener('change', () => {
    localStorage.setItem(`guide-check-${index}`, input.checked ? '1' : '0');
    renderChecks();
  });
});
function renderChecks() {
  const count = checks.filter(input => input.checked).length;
  checkCount.textContent = count;
  checkBar.style.setProperty('--done', `${(count / checks.length) * 100}%`);
}
renderChecks();

if (window.gsap && window.ScrollTrigger && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);
  const boot = qs('.boot-screen');
  const bootNumber = qs('.boot-screen>b');
  const bootState = { value: 0 };
  if (boot) {
    gsap.timeline({ onComplete: () => boot.remove() })
      .to(bootState, { value: 100, duration: 1, ease: 'power2.inOut', onUpdate: () => { bootNumber.textContent = String(Math.round(bootState.value)).padStart(2, '0'); } })
      .to('.boot-track span', { width: '100%', duration: 1, ease: 'power2.inOut' }, 0)
      .to('.boot-mark', { rotation: -180, scale: .82, duration: .42 }, .78)
      .to(boot, { clipPath: 'inset(100% 0 0 0)', duration: .75, ease: 'power4.inOut' }, 1.05);
  }
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.guide-kicker', { y: 20, opacity: 0, duration: .55 })
    .from('.guide-hero h1', { y: 54, opacity: 0, duration: .9 }, '-=.3')
    .from('.guide-hero>p, .hero-route, .guide-alert', { y: 28, opacity: 0, duration: .65, stagger: .12 }, '-=.5');

  qsa('.guide-heading, .step-card, .instruction-list li, .source-grid a, .map-node, .provider-grid article, .github-path article, .api-glossary article').forEach(element => {
    gsap.from(element, { y: 38, opacity: 0, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
  });

  gsap.to('.hero-route i', { backgroundPosition: '200% 0', duration: 2, repeat: -1, ease: 'none' });
  gsap.to('.guide-hero h1', { xPercent: 4, ease: 'none', scrollTrigger: { trigger: '.guide-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.from('.guide-dashboard article', { y: 55, opacity: 0, rotateX: -8, stagger: .1, duration: .8, delay: 1.5, ease: 'power3.out' });
} else {
  qs('.boot-screen')?.remove();
}

const sections = qsa('.guide-section[id]');
const navLinks = qsa('.guide-nav a');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
      const hud = qs('[data-guide-hud]');
      if (hud) hud.textContent = `${entry.target.querySelector('.guide-heading>span')?.textContent || '00'} / ${entry.target.id.toUpperCase()}`;
    }
  });
}, { rootMargin: '-30% 0px -60%' });
sections.forEach(section => observer.observe(section));
