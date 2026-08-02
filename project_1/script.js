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
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeNav();
    closeLightbox();
  });

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
        addRecord({
          id: `r${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: "message",
          name: fields.name.input.value.trim(),
          detail: fields.message.input.value.trim(),
          meta: fields.email.input.value.trim(),
          date: new Date().toISOString(),
        });
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

  /* ---------- Cursor accent (dot + trailing ring + soft glow) ---------- */
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (finePointer && !prefersReducedMotion) {
    const glow = document.getElementById("cursorGlow");
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let dx = mx, dy = my, rx = mx, ry = my, gx = mx, gy = my;
    let visible = false;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        [glow, dot, ring].forEach((el) => (el.style.opacity = "1"));
      }
    }, { passive: true });

    document.documentElement.addEventListener("mouseleave", () => {
      visible = false;
      [glow, dot, ring].forEach((el) => (el.style.opacity = "0"));
    });

    const follow = () => {
      dx += (mx - dx) * 0.85; dy += (my - dy) * 0.85;   // dot — quick
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;   // ring — trailing
      gx += (mx - gx) * 0.07; gy += (my - gy) * 0.07;   // glow — slowest
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);

    // Ring expands over interactive elements
    const interactiveSel = "a, button, input, textarea, select, .project, .gh-repo, .skill__track";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(interactiveSel)) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(interactiveSel)) ring.classList.remove("is-hover");
    });
  }

  /* ---------- Magnetic hover for buttons & links ---------- */
  if (finePointer && !prefersReducedMotion) {
    document.querySelectorAll(".btn, .project__link, .site-footer__social, .to-top").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.translate = `${x * 0.28}px ${y * 0.28}px`;
      });
      el.addEventListener("mouseleave", () => { el.style.translate = ""; });
    });
  }

  /* ---------- 3D tilt on project thumbs & portrait ---------- */
  if (finePointer && !prefersReducedMotion) {
    document.querySelectorAll(".tilt").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-py * 7}deg) rotateY(${px * 7}deg) translateZ(12px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- 3D hero depth scene (stage tilts toward the mouse) ---------- */
  if (finePointer && !prefersReducedMotion) {
    const stage = document.getElementById("heroStage");
    const hero = document.querySelector(".hero");
    if (stage && hero) {
      let targetX = 0, targetY = 0, curX = 0, curY = 0;

      hero.addEventListener("mousemove", (e) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        targetY = nx * 8;   // yaw
        targetX = ny * -6;  // pitch
      }, { passive: true });

      hero.addEventListener("mouseleave", () => { targetX = 0; targetY = 0; });

      // Level the stage again once the hero scrolls out of view
      const heroReset = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) { targetX = 0; targetY = 0; }
      }, { threshold: 0 });
      heroReset.observe(hero);

      const heroSpin = () => {
        curX += (targetX - curX) * 0.06;
        curY += (targetY - curY) * 0.06;
        stage.style.transform = `rotateX(${curX.toFixed(3)}deg) rotateY(${curY.toFixed(3)}deg)`;
        requestAnimationFrame(heroSpin);
      };
      requestAnimationFrame(heroSpin);
    }
  }

  /* ---------- Gentle scroll parallax ---------- */
  if (!prefersReducedMotion) {
    const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
    let parallaxTick = false;

    const updateParallax = () => {
      const y = window.scrollY;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -240 || rect.top > window.innerHeight + 240) return;
        const start = rect.top + y - window.innerHeight / 2;
        const offset = (y - start) * speed;
        el.style.translate = `0 ${Math.max(-70, Math.min(70, offset))}px`;
      });
      parallaxTick = false;
    };

    const onParallaxScroll = () => {
      if (!parallaxTick) {
        requestAnimationFrame(updateParallax);
        parallaxTick = true;
      }
    };
    window.addEventListener("scroll", onParallaxScroll, { passive: true });
    updateParallax();
  }

  /* ---------- Drag & drop media gallery ---------- */
  const dropZone = document.getElementById("dropZone");
  const galleryInput = document.getElementById("galleryInput");
  const galleryGrid = document.getElementById("galleryGrid");
  const galleryBar = document.getElementById("galleryBar");
  const galleryCount = document.getElementById("galleryCount");
  const galleryError = document.getElementById("galleryError");
  const lightbox = document.getElementById("lightbox");
  const lightboxBody = document.getElementById("lightboxBody");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  const MAX_MB = 25;
  const MAX_BYTES = MAX_MB * 1024 * 1024;
  let galleryItems = [];
  let dragDepth = 0;
  let freshIds = new Set();
  let galleryErrorTimer = null;
  let lightboxOpener = null;

  const isMediaFile = (f) => f.type.startsWith("image/") || f.type.startsWith("video/");
  const formatBytes = (b) =>
    b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

  const showGalleryError = (msg) => {
    galleryError.textContent = msg;
    galleryError.hidden = false;
    clearTimeout(galleryErrorTimer);
    galleryErrorTimer = setTimeout(() => { galleryError.hidden = true; }, 4000);
  };

  const openLightbox = (id) => {
    const item = galleryItems.find((it) => it.id === id);
    if (!item) return;
    lightboxOpener = document.activeElement && document.activeElement.closest
      ? document.activeElement.closest(".gallery__thumb")
      : null;
    const isVideo = item.file.type.startsWith("video/");
    lightboxBody.innerHTML = isVideo
      ? `<video class="lightbox__media" src="${item.url}" controls autoplay playsinline></video>`
      : `<img class="lightbox__media" src="${item.url}" alt="${escapeHtml(item.file.name)}">`;
    lightboxCaption.textContent = item.file.name;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    lightbox.setAttribute("tabindex", "-1");
    lightbox.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxBody.innerHTML = "";
    document.body.style.overflow = "";
    if (lightboxOpener) { lightboxOpener.focus({ preventScroll: true }); lightboxOpener = null; }
  };
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

  const renderGallery = () => {
    galleryGrid.innerHTML = galleryItems
      .map((item) => {
        const isVideo = item.file.type.startsWith("video/");
        const isFresh = freshIds.has(item.id);
        return `
        <li class="gallery__item${isFresh ? " is-new" : ""}" data-id="${item.id}">
          <button class="gallery__thumb" type="button" aria-label="Preview ${escapeHtml(item.file.name)}">
            ${isVideo
              ? `<video class="gallery__media" src="${item.url}" muted playsinline preload="metadata"></video>
               <span class="gallery__badge">▶ Video</span>`
              : `<img class="gallery__media" src="${item.url}" alt="" loading="lazy">`}
          </button>
          <span class="gallery__meta">
            <span class="gallery__name" title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</span>
            <span class="gallery__size">${formatBytes(item.file.size)}</span>
          </span>
          <button class="gallery__remove" type="button" data-remove="${item.id}" aria-label="Remove ${escapeHtml(item.file.name)}">&times;</button>
        </li>`;
      })
      .join("");

    freshIds.clear();
    galleryBar.hidden = galleryItems.length === 0;
    galleryCount.textContent = `${galleryItems.length} ${galleryItems.length === 1 ? "item" : "items"}`;

    galleryGrid.querySelectorAll(".gallery__thumb").forEach((btn) =>
      btn.addEventListener("click", () => openLightbox(btn.closest(".gallery__item").dataset.id))
    );
    galleryGrid.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", () => removeGalleryItem(btn.dataset.remove))
    );
  };

  const removeGalleryItem = (id) => {
    const idx = galleryItems.findIndex((it) => it.id === id);
    if (idx === -1) return;
    URL.revokeObjectURL(galleryItems[idx].url);
    galleryItems.splice(idx, 1);
    renderGallery();
  };

  const addGalleryFiles = (fileList) => {
    const skipped = [];
    const accepted = [];
    [...fileList].forEach((file) => {
      if (!isMediaFile(file)) { skipped.push(file.name); return; }
      if (file.size > MAX_BYTES) { skipped.push(`${file.name} (over ${MAX_MB} MB)`); return; }
      accepted.push(file);
    });
    if (skipped.length) showGalleryError(`Skipped: ${skipped.join(", ")}`);

    const newRecords = [];
    accepted.forEach((file, i) => {
      const id = `g${Date.now()}-${i}`;
      galleryItems.push({ file, url: URL.createObjectURL(file), id });
      freshIds.add(id);
      newRecords.push({
        id: `r${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        type: "media",
        name: file.name,
        detail: file.type.startsWith("video/") ? "Video added to the gallery" : "Image added to the gallery",
        meta: formatBytes(file.size),
        date: new Date().toISOString(),
      });
    });
    if (accepted.length) renderGallery();
    addRecords(newRecords);
  };

  // Drop zone events (dragDepth counter avoids flicker over children)
  dropZone.addEventListener("dragenter", (e) => { e.preventDefault(); dragDepth++; dropZone.classList.add("is-dragging"); });
  dropZone.addEventListener("dragover", (e) => e.preventDefault());
  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) dropZone.classList.remove("is-dragging");
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dragDepth = 0;
    dropZone.classList.remove("is-dragging");
    if (e.dataTransfer.files.length) addGalleryFiles(e.dataTransfer.files);
  });

  // Click / keyboard browse
  dropZone.addEventListener("click", (e) => { if (!e.target.closest("input")) galleryInput.click(); });
  dropZone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); galleryInput.click(); }
  });
  galleryInput.addEventListener("change", () => {
    if (galleryInput.files.length) addGalleryFiles(galleryInput.files);
    galleryInput.value = "";
  });

  // Whole-page drop anywhere
  window.addEventListener("dragenter", (e) => {
    if (e.dataTransfer && [...e.dataTransfer.types].includes("Files")) {
      document.body.classList.add("is-dragging-files");
    }
  });
  window.addEventListener("dragleave", (e) => {
    if (e.target === document.documentElement) document.body.classList.remove("is-dragging-files");
  });
  window.addEventListener("drop", (e) => {
    e.preventDefault();
    document.body.classList.remove("is-dragging-files");
    if (e.target.closest && e.target.closest("#dropZone")) return; // drop zone handles its own drops
    if (e.dataTransfer.files.length) addGalleryFiles(e.dataTransfer.files);
  });

  // Clear all
  document.getElementById("galleryClear").addEventListener("click", () => {
    galleryItems.forEach((it) => URL.revokeObjectURL(it.url));
    galleryItems = [];
    renderGallery();
  });

  /* ---------- Records — contact messages + gallery activity (stored locally) ---------- */
  const RECORDS_KEY = "portfolio_records";
  let records = [];
  try { records = JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]"); } catch { records = []; }
  if (!Array.isArray(records)) records = [];

  const recordsList = document.getElementById("recordsList");
  const recordsCountEl = document.getElementById("recordsCount");
  const recordsEmpty = document.getElementById("recordsEmpty");
  const recordsClear = document.getElementById("recordsClear");
  let recordsFilter = "all";
  let freshRecordIds = new Set();

  const ICON_MAIL =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const ICON_IMAGE =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';

  const saveRecords = () => localStorage.setItem(RECORDS_KEY, JSON.stringify(records));

  const addRecords = (recs) => {
    if (!recs.length) return;
    records = [...recs, ...records];
    recs.forEach((r) => freshRecordIds.add(r.id));
    saveRecords();
    renderRecords();
  };

  const addRecord = (rec) => addRecords([rec]);

  const formatRecordTime = (iso) =>
    new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const renderRecords = () => {
    const filtered = recordsFilter === "all" ? records : records.filter((r) => r.type === recordsFilter);

    recordsList.innerHTML = filtered
      .map((r) => {
        const isMsg = r.type === "message";
        const isFresh = freshRecordIds.has(r.id);
        return `
        <li class="record${isFresh ? " is-new" : ""}">
          <span class="record__icon" aria-hidden="true">${isMsg ? ICON_MAIL : ICON_IMAGE}</span>
          <div class="record__body">
            <p class="record__title">${escapeHtml(r.name)} <span class="record__tag ${isMsg ? "record__tag--msg" : "record__tag--media"}">${isMsg ? "Message" : "Media"}</span></p>
            <p class="record__detail">${escapeHtml(r.detail)}</p>
            <p class="record__meta">${escapeHtml(r.meta)} · ${formatRecordTime(r.date)}</p>
          </div>
          <button class="record__remove" type="button" data-id="${r.id}" aria-label="Delete record">&times;</button>
        </li>`;
      })
      .join("");

    freshRecordIds.clear();
    recordsCountEl.textContent = `${filtered.length} ${filtered.length === 1 ? "record" : "records"}`;
    recordsEmpty.hidden = filtered.length !== 0;

    recordsList.querySelectorAll(".record__remove").forEach((btn) =>
      btn.addEventListener("click", () => {
        records = records.filter((r) => r.id !== btn.dataset.id);
        saveRecords();
        renderRecords();
      })
    );
  };

  document.querySelectorAll(".records__filter").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".records__filter").forEach((b) => b.classList.toggle("is-active", b === btn));
      recordsFilter = btn.dataset.filter;
      renderRecords();
    })
  );

  recordsClear.addEventListener("click", () => {
    records = [];
    saveRecords();
    renderRecords();
  });

  renderRecords();

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
