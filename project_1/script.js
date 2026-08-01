/* =========================================================
   Alex Rivera — Portfolio
   Interactions & enhancements
   ========================================================= */
"use strict";

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header shadow on scroll ---------- */
  const header = document.getElementById("siteHeader");
  const toTop = document.getElementById("toTop");
  const progressBar = document.getElementById("progressBar");

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    toTop.classList.toggle("is-visible", y > 600);

    // Scroll progress bar
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${docHeight > 0 ? (y / docHeight) * 100 : 0}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Back to top ---------- */
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" }));

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const closeNav = () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

  /* ---------- Active nav link on scroll ---------- */
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinkEls = [...document.querySelectorAll(".nav__link")];

  const setActive = (id) => {
    navLinkEls.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`));
  };

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealEls = [...document.querySelectorAll(".reveal")];

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-in-view"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Animated skill bars ---------- */
  const fillEls = [...document.querySelectorAll(".skill__fill")];

  if (prefersReducedMotion) {
    fillEls.forEach((f) => (f.style.width = `${f.dataset.width}%`));
  } else {
    const barObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.width = `${entry.target.dataset.width}%`;
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    fillEls.forEach((f) => barObserver.observe(f));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = [...document.querySelectorAll(".about__stat-num")];
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion) {
    counters.forEach((c) => (c.textContent = c.dataset.count));
  } else {
    const countObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => countObserver.observe(c));
  }

  /* ---------- Typewriter (hero) ---------- */
  const typedWord = document.getElementById("typedWord");
  const words = ["design", "craft", "engineer", "prototype"];
  let wordIdx = 0;
  let charIdx = 0;
  let deleting = false;

  const type = () => {
    if (!typedWord || prefersReducedMotion) return;

    const word = words[wordIdx];
    charIdx += deleting ? -1 : 1;
    typedWord.textContent = word.slice(0, charIdx);

    let delay = deleting ? 45 : 85;
    if (!deleting && charIdx === word.length) { delay = 1700; deleting = true; }
    else if (deleting && charIdx === 0) { deleting = false; wordIdx = (wordIdx + 1) % words.length; delay = 350; }

    setTimeout(type, delay);
  };
  type();

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById("contactForm");
  if (form) {
    const fields = {
      name: { input: form.name, error: document.getElementById("nameError") },
      email: { input: form.email, error: document.getElementById("emailError") },
      message: { input: form.message, error: document.getElementById("messageError") },
    };
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const success = document.getElementById("formSuccess");

    const validate = (key) => {
      const { input, error } = fields[key];
      let valid = input.value.trim().length > 0;
      if (key === "email") valid = emailRe.test(input.value.trim());

      input.closest(".field").classList.toggle("is-invalid", !valid);
      error.hidden = valid;
      return valid;
    };

    Object.keys(fields).forEach((key) => {
      fields[key].input.addEventListener("blur", () => validate(key));
      fields[key].input.addEventListener("input", () => {
        const { error } = fields[key];
        if (!error.hidden) validate(key);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const results = Object.keys(fields).map(validate);
      if (results.every(Boolean)) {
        success.hidden = false;
        form.reset();
        setTimeout(() => { success.hidden = true; }, 6000);
      } else {
        // Focus the first invalid field
        const firstInvalid = Object.values(fields).find(
          (f) => f.input.closest(".field").classList.contains("is-invalid")
        );
        firstInvalid?.input.focus();
      }
    });
  }

  /* ---------- GitHub details (live from the GitHub API) ---------- */
  const GITHUB_USERNAME = "alexrivera-dev"; // ← replace with your GitHub username

  const ghStatEls = {
    repos: document.getElementById("ghRepos"),
    followers: document.getElementById("ghFollowers"),
    stars: document.getElementById("ghStars"),
  };
  const ghReposList = document.getElementById("ghReposList");
  const ghNote = document.getElementById("ghNote");

  const LANG_COLORS = {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", CSS: "#663399", HTML: "#e34c26",
    Python: "#3572A5", Java: "#b07219", Go: "#00ADD8", Rust: "#dea584",
    "C++": "#f34b7d", "C#": "#178600", Ruby: "#701516", PHP: "#4F5D95",
    Swift: "#F05138", Kotlin: "#A97BFF", Vue: "#41b883", Shell: "#89e051",
    SCSS: "#c6538c",
  };

  const escapeHtml = (str = "") =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const ICON_STAR =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  const ICON_FORK =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/></svg>';

  const formatNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));

  const renderRepos = (repos) => {
    const featured = [...repos]
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 4);

    if (!featured.length) {
      ghNote.hidden = false;
      ghNote.textContent = "No public repositories yet — check back soon!";
      return;
    }

    ghNote.hidden = true;
    ghReposList.innerHTML = featured
      .map((repo) => {
        const lang = repo.language || "Other";
        const color = LANG_COLORS[lang] || "#9ca3af";
        return `
          <li class="gh-repo">
            <div class="gh-repo__top">
              <span class="gh-repo__name"><a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a></span>
              <span class="gh-repo__lang"><span class="dot" style="background:${color}" aria-hidden="true"></span>${escapeHtml(lang)}</span>
            </div>
            ${repo.description ? `<p class="gh-repo__desc">${escapeHtml(repo.description)}</p>` : ""}
            <div class="gh-repo__meta">
              <span>${ICON_STAR}${formatNum(repo.stargazers_count)}</span>
              <span>${ICON_FORK}${formatNum(repo.forks_count)}</span>
              <span>Updated ${new Date(repo.updated_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
            </div>
          </li>`;
      })
      .join("");
  };

  const loadGitHub = async () => {
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`),
      ]);
      const user = userRes.ok ? await userRes.json() : null;
      const repos = reposRes.ok ? await reposRes.json() : null;
      if (!user || !Array.isArray(repos)) throw new Error("GitHub data unavailable");

      ghStatEls.repos.textContent = formatNum(user.public_repos || 0);
      ghStatEls.followers.textContent = formatNum(user.followers || 0);
      ghStatEls.stars.textContent = formatNum(repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0));
      renderRepos(repos);
    } catch {
      ghStatEls.repos.textContent = "–";
      ghStatEls.followers.textContent = "–";
      ghStatEls.stars.textContent = "–";
      ghNote.hidden = false;
      ghNote.textContent = `GitHub data couldn't be loaded right now — visit github.com/${GITHUB_USERNAME} to see my work.`;
    }
  };
  loadGitHub();

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
