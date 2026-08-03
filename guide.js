const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const progressBar = qs('.scroll-progress span');
const glow = qs('.cursor-glow');

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

if (window.gsap && window.ScrollTrigger && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.guide-kicker', { y: 20, opacity: 0, duration: .55 })
    .from('.guide-hero h1', { y: 54, opacity: 0, duration: .9 }, '-=.3')
    .from('.guide-hero>p, .hero-route, .guide-alert', { y: 28, opacity: 0, duration: .65, stagger: .12 }, '-=.5');

  qsa('.guide-heading, .step-card, .instruction-list li, .source-grid a, .map-node').forEach(element => {
    gsap.from(element, { y: 38, opacity: 0, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
  });

  gsap.to('.hero-route i', { backgroundPosition: '200% 0', duration: 2, repeat: -1, ease: 'none' });
}

const sections = qsa('.guide-section[id]');
const navLinks = qsa('.guide-nav a');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-30% 0px -60%' });
sections.forEach(section => observer.observe(section));
