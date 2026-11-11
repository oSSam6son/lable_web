/* =========================================================
   FLOW STATE MUSIC — main script
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initSmoothAnchors();
  initSmoothWheel();
  initScrollDown();
  initSeamlessMarquee();
  initArtistCards();
  initHeader();
  initArtistsCarousel();
  initAboutFlipCard();
  initVinylRotation();
  initVinylLogoAnimation();
  initHeroEqualizer();
});

function initSmoothAnchors() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    let target;
    try {
      target = document.querySelector(hash);
    } catch (_) {
      return;
    }
    if (!target) return;

    event.preventDefault();
    const header = document.getElementById("header");
    const headerOffset = header
      ? Math.min(header.getBoundingClientRect().height, 96)
      : 0;
    const targetTop =
      hash === "#top"
        ? 0
        : window.scrollY +
          target.getBoundingClientRect().top -
          headerOffset -
          12;

    const destination = Math.max(0, targetTop);
    if (window.flowStateLenis && !reduceMotion.matches) {
      window.flowStateLenis.scrollTo(destination, { duration: 1.05 });
    } else {
      window.scrollTo({
        top: destination,
        behavior: reduceMotion.matches ? "auto" : "smooth",
      });
    }

    if (window.location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
  });
}

function initSmoothWheel() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (reduceMotion.matches || isTouch || typeof window.Lenis === "undefined")
    return;

  window.flowStateLenis = new window.Lenis({
    autoRaf: true,
    duration: 1.05,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.1,
    anchors: false,
    lerp: 0.085,
  });
}

function initScrollDown() {
  const scrollBtn = document.getElementById("scrollDown");
  const aboutSection = document.getElementById("about");

  if (!scrollBtn || !aboutSection) return;

  scrollBtn.addEventListener("click", () => {
    const rect = aboutSection.getBoundingClientRect();
    const sectionHeight = aboutSection.offsetHeight;
    const windowHeight = window.innerHeight;

    const sectionCenter = window.scrollY + rect.top + sectionHeight / 2;
    let targetScroll = sectionCenter - windowHeight / 2;

    const maxScroll = document.documentElement.scrollHeight - windowHeight;
    targetScroll = Math.min(targetScroll, maxScroll);

    if (window.flowStateLenis) {
      window.flowStateLenis.scrollTo(targetScroll, { duration: 1.05 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  });
}

function initSeamlessMarquee() {
  const track = document.querySelector(".marquee__track");
  const firstCopy = track && track.querySelector(".marquee__content");
  if (!track || !firstCopy) return;

  const measure = () => {
    const distance = firstCopy.getBoundingClientRect().width;
    if (distance > 0)
      track.style.setProperty("--marquee-distance", `${distance}px`);
  };

  measure();
  if ("ResizeObserver" in window)
    new ResizeObserver(measure).observe(firstCopy);
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(measure);
  window.addEventListener("resize", measure, { passive: true });
}

function initArtistCards() {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!finePointer.matches || reduceMotion.matches) return;
  const cards = document.querySelectorAll(".carousel__slide .artist-card");

  cards.forEach((card) => {
    let rafId = null;
    let pointerX = 0;
    let pointerY = 0;

    const reset = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.classList.remove("is-tilting");
    };

    card.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const rect = card.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width;
      pointerY = (event.clientY - rect.top) / rect.height;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rotateY = (pointerX - 0.5) * 8;
        const rotateX = (0.5 - pointerY) * 7;
        card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
        card.classList.add("is-tilting");
      });
    });
    card.addEventListener("pointerleave", reset);
    card.addEventListener("blur", reset);
  });
}

function initHeader() {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  if (!header || !nav || !burger) return;

  const lens = nav.querySelector(".nav__lens");

  const items = [...nav.querySelectorAll(".nav__link")]
    .map((link) => ({
      link,
      section: document.querySelector(link.getAttribute("href")),
    }))
    .filter((item) => item.section);

  const mobileQuery = window.matchMedia("(max-width: 768px)");

  let lastY = window.scrollY;
  let ticking = false;
  let currentLink = null;

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    if (open) header.classList.remove("header--hidden");
  }

  function moveLens(link) {
    if (!lens) return;

    if (!link || mobileQuery.matches) {
      lens.classList.remove("is-visible");
      return;
    }

    const firstShow = !lens.classList.contains("is-visible");
    if (firstShow) lens.style.transition = "none";

    lens.style.setProperty("--lens-x", link.offsetLeft + "px");
    lens.style.setProperty("--lens-w", link.offsetWidth + "px");

    if (firstShow) {
      void lens.offsetWidth;
      lens.style.transition = "";
    }
    lens.classList.add("is-visible");
  }

  function updateActive() {
    const probe = window.innerHeight * 0.35;
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;

    let current = -1;
    items.forEach(({ section }, i) => {
      if (section.getBoundingClientRect().top <= probe) current = i;
    });
    if (atBottom) current = items.length - 1;

    items.forEach(({ link }, i) => {
      const isActive = i === current;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    const link = current >= 0 ? items[current].link : null;
    if (link !== currentLink) {
      currentLink = link;
      moveLens(link);
    }
  }

  function onScroll() {
    ticking = false;
    const y = window.scrollY;

    if (!nav.classList.contains("is-open") && Math.abs(y - lastY) > 4) {
      if (y > lastY && y > 200) header.classList.add("header--hidden");
      else header.classList.remove("header--hidden");
      lastY = y;
    }

    updateActive();
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );

  burger.addEventListener("click", () => {
    setMenu(burger.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (e) => {
    if (e.target.closest(".nav__link")) setMenu(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  mobileQuery.addEventListener("change", (e) => {
    if (!e.matches) setMenu(false);
    moveLens(currentLink);
  });

  window.addEventListener("resize", () => moveLens(currentLink));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => moveLens(currentLink));
  }

  onScroll();
}

function initArtistsCarousel() {
  const root = document.getElementById("artistsCarousel");
  if (!root) return;

  const viewport = root.querySelector(".carousel__viewport");
  const track = root.querySelector(".carousel__track");
  const slides = [...root.querySelectorAll(".carousel__slide")];
  const prevBtn = root.querySelector(".carousel__arrow--prev");
  const nextBtn = root.querySelector(".carousel__arrow--next");
  const dotsBox = root.querySelector(".carousel__dots");
  if (!viewport || !track || !slides.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobilePerformance = window.matchMedia(
    "(max-width: 768px), (pointer: coarse)",
  );
  const last = slides.length - 1;

  const STIFFNESS = 140;
  const DAMPING = 2 * Math.sqrt(STIFFNESS);
  const PROJECTION = 0.2;
  const COMMIT = 0.15;
  const EDGE_RESIST = 0.35;
  const DRAG_START = 6;
  const MAX_VEL = 8;

  let step = 1;
  let pos = 0;
  let vel = 0;
  let target = 0;
  let active = -1;
  let rafId = null;
  let lastTime = 0;

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel__dot";
    dot.setAttribute("aria-label", `Артист ${i + 1} из ${slides.length}`);
    dot.addEventListener("click", () => goTo(i));
    dotsBox.appendChild(dot);
    return dot;
  });

  const clampIndex = (i) => Math.max(0, Math.min(last, i));

  function measure() {
    step =
      slides.length > 1
        ? slides[1].offsetLeft - slides[0].offsetLeft
        : slides[0].offsetWidth;
  }

  function syncState() {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === active));
    dots.forEach((d, i) => {
      if (i === active) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
    if (prevBtn) prevBtn.disabled = active <= 0;
    if (nextBtn) nextBtn.disabled = active >= last;
  }

  function render() {
    track.style.transform = `translate3d(${(-pos * step).toFixed(2)}px, 0, 0)`;
    if (!mobilePerformance.matches) {
      slides.forEach((s, i) => {
        s.style.setProperty("--d", Math.min(Math.abs(i - pos), 1).toFixed(3));
      });
    }

    const idx = clampIndex(Math.round(pos));
    if (idx !== active) {
      active = idx;
      syncState();
    }
  }

  function stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function tick(time) {
    const dt = Math.min((time - lastTime) / 1000, 1 / 30);
    lastTime = time;

    const force = -STIFFNESS * (pos - target) - DAMPING * vel;
    vel += force * dt;
    pos += vel * dt;

    if (Math.abs(pos - target) < 0.0005 && Math.abs(vel) < 0.005) {
      pos = target;
      vel = 0;
      rafId = null;
      render();
      return;
    }

    render();
    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (rafId) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function goTo(i, instant = false) {
    target = clampIndex(i);

    if (mobilePerformance.matches) {
      stopLoop();
      pos = target;
      vel = 0;
      if (instant || reduceMotion.matches)
        track.classList.remove("is-settling");
      else track.classList.add("is-settling");
      render();
      return;
    }

    track.classList.remove("is-settling");
    if (instant || reduceMotion.matches) {
      stopLoop();
      pos = target;
      vel = 0;
      render();
      return;
    }
    startLoop();
  }

  let dragging = false;
  let moved = false;
  let pointerId = null;
  let startX = 0;
  let startPos = 0;
  let startIndex = 0;
  let lastX = 0;
  let lastT = 0;
  let dragVel = 0;

  function resist(p) {
    if (p < 0) return p * EDGE_RESIST;
    if (p > last) return last + (p - last) * EDGE_RESIST;
    return p;
  }

  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    dragging = true;
    moved = false;
    track.classList.remove("is-settling");
    pointerId = e.pointerId;
    startX = lastX = e.clientX;
    lastT = e.timeStamp;
    startPos = pos;
    startIndex = target;
    dragVel = 0;

    stopLoop();
    vel = 0;
  });

  window.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pointerId) return;

    const dx = e.clientX - startX;

    if (!moved) {
      if (Math.abs(dx) < DRAG_START) return;
      moved = true;
      viewport.classList.add("is-dragging");
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch (_) {}
    }

    pos = resist(startPos - dx / step);

    const dt = (e.timeStamp - lastT) / 1000;
    if (dt > 0) {
      const inst = -(e.clientX - lastX) / step / dt;
      dragVel = dragVel * 0.6 + inst * 0.4;
    }
    lastX = e.clientX;
    lastT = e.timeStamp;

    render();
  });

  function endDrag(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    viewport.classList.remove("is-dragging");

    if (!moved) {
      goTo(target);
      return;
    }

    let next = Math.round(pos + dragVel * PROJECTION);

    const delta = pos - startIndex;
    if (next === startIndex && Math.abs(delta) > COMMIT) {
      next = startIndex + Math.sign(delta);
    }

    const stale = e.timeStamp - lastT > 80;
    vel = stale ? 0 : Math.max(-MAX_VEL, Math.min(MAX_VEL, dragVel));

    goTo(next);

    setTimeout(() => {
      moved = false;
    }, 0);
  }

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  viewport.addEventListener("dragstart", (e) => e.preventDefault());

  let wheelTimer = null;

  viewport.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

      e.preventDefault();
      stopLoop();
      vel = 0;

      pos = Math.max(-0.3, Math.min(last + 0.3, pos + (e.deltaX / step) * 0.8));
      render();

      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => goTo(Math.round(pos)), 90);
    },
    { passive: false },
  );

  viewport.addEventListener("click", (e) => {
    if (moved) {
      e.preventDefault();
      return;
    }

    const slide = e.target.closest(".carousel__slide");
    if (!slide) return;

    const i = slides.indexOf(slide);
    if (i !== active) {
      e.preventDefault();
      goTo(i);
    }
  });

  if (prevBtn) prevBtn.addEventListener("click", () => goTo(target - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goTo(target + 1));

  viewport.addEventListener("keydown", (e) => {
    const keys = {
      ArrowLeft: () => goTo(target - 1),
      ArrowRight: () => goTo(target + 1),
      Home: () => goTo(0),
      End: () => goTo(last),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  });

  window.addEventListener("resize", () => {
    measure();
    render();
  });

  track.addEventListener("transitionend", (event) => {
    if (event.propertyName === "transform")
      track.classList.remove("is-settling");
  });

  measure();
  target = pos = Math.floor(last / 2);
  render();
}

function initAboutFlipCard() {
  const card = document.getElementById("aboutFlipCard");
  if (!card) return;

  const frontFace = card.querySelector(".about__face--front");
  const backFace = card.querySelector(".about__face--back");
  const frontButton = frontFace?.querySelector(".about__flip-button");
  const backButton = backFace?.querySelector(".about__flip-button");
  if (!frontFace || !backFace || !frontButton || !backButton) return;

  const setFlipped = (flipped) => {
    card.classList.toggle("is-flipped", flipped);
    frontFace.setAttribute("aria-hidden", String(flipped));
    backFace.setAttribute("aria-hidden", String(!flipped));
    frontButton.setAttribute("aria-pressed", String(flipped));
    backButton.setAttribute("aria-pressed", String(!flipped));
  };

  card.addEventListener("click", (event) => {
    const button = event.target.closest(".about__flip-button");
    if (!button || !card.contains(button)) return;
    setFlipped(!card.classList.contains("is-flipped"));
  });

  setFlipped(false);

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!finePointer.matches || reduceMotion.matches) return;

  let glintTimer = null;

  card.addEventListener("mouseenter", () => {
    if (card.classList.contains("is-flipped")) return;
    card.classList.remove("glint-active");
    void card.offsetWidth;
    card.classList.add("glint-active");
    clearTimeout(glintTimer);
    glintTimer = setTimeout(() => card.classList.remove("glint-active"), 650);
  });

  card.addEventListener("mouseleave", () => {
    clearTimeout(glintTimer);
    card.classList.remove("glint-active");
  });
}

/* =========================================================
   VINYL — ROTATION ONLY (без смены лого)
   ========================================================= */
function initVinylRotation() {
  const discs = document.querySelectorAll(".vinyl-disc");

  if (!discs.length) return;

  const duration = 20000;
  const initialAngle = 30;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  discs.forEach((disc) => {
    if (disc.dataset.vinylInitialized === "true") return;

    disc.dataset.vinylInitialized = "true";

    const wrapper = disc.closest(".vinyl-wrapper") || disc;
    const topRotator = disc.querySelector("#vinyl-top-rotator");
    const bottomRotator = disc.querySelector("#vinyl-bottom-rotator");

    let angle = initialAngle;
    let direction = 1;
    let previousTime = null;

    disc.style.setProperty("--split-angle", `${angle}deg`);

    if (reducedMotion) return;

    /* При наведении — только смена направления */
    wrapper.addEventListener("pointerenter", () => {
      direction = -1;
    });

    wrapper.addEventListener("pointerleave", () => {
      direction = 1;
    });

    function animate(currentTime) {
      if (document.hidden) {
        previousTime = null;
        requestAnimationFrame(animate);
        return;
      }

      if (previousTime !== null) {
        const delta = Math.min(currentTime - previousTime, 50);
        angle += direction * delta * (360 / duration);
        angle = ((angle % 360) + 360) % 360;
      }
      previousTime = currentTime;

      // Всегда обновляем CSS-переменную (дешево, используется на мобилке)
      disc.style.setProperty("--split-angle", `${angle}deg`);

      // SVG-атрибуты обновляем только на десктопе (на мобилке они не нужны)
      const isMobile = window.innerWidth <= 768;
      if (!isMobile && Math.abs(angle - lastAppliedAngle) > 1) {
        const rotation = `rotate(${angle} .5 .5)`;
        if (topRotator) topRotator.setAttribute("transform", rotation);
        if (bottomRotator) bottomRotator.setAttribute("transform", rotation);
        lastAppliedAngle = angle;
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  });
}

/* =========================================================
   VINYL — СМЕНА ЛОГОТИПА БЛИКОМ И ТОНКОЙ ЛИНИЕЙ
   ========================================================= */
function initVinylLogoAnimation() {
  const labels = document.querySelectorAll(".vinyl-label");
  if (!labels.length) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reducedMotion) return;

  labels.forEach((label) => {
    if (label.dataset.logoAnimationInitialized === "true") return;

    const logos = Array.from(label.querySelectorAll(".vinyl-label__logo"));
    if (logos.length < 2) return;

    const initialActiveIndex = logos.findIndex((logo) =>
      logo.classList.contains("is-active"),
    );
    let activeIndex = initialActiveIndex >= 0 ? initialActiveIndex : 0;
    let cycleTimer = null;
    let animationFrame = null;
    let isAnimating = false;

    const nextLogoIsReady = () => {
      const nextLogo = logos[1 - activeIndex];
      return nextLogo.complete && nextLogo.naturalWidth > 0;
    };

    const startCycleTimer = () => {
      if (cycleTimer !== null || !nextLogoIsReady()) return;
      label.dataset.logoAnimationInitialized = "true";
      cycleTimer = window.setInterval(startTransition, 6000);
    };

    function startTransition() {
      if (document.hidden || isAnimating || !nextLogoIsReady()) return;

      isAnimating = true;
      const currentLogo = logos[activeIndex];
      const nextIndex = 1 - activeIndex;
      const nextLogo = logos[nextIndex];
      const startTime = performance.now();
      let wipeStarted = false;

      currentLogo.style.clipPath = "inset(0)";
      nextLogo.style.clipPath = "polygon(0 0, 0 0, 0 100%, 0 100%)";
      label.style.setProperty("--wipe-edge", "0%");
      label.classList.remove("is-wiping");
      // Маска блика повторяет альфа-контур активного PNG, поэтому не выходит
      // квадратом за пределы самого логотипа.
      const activeLogoSrc = currentLogo.getAttribute("src") || "flow.png";
      label.style.setProperty("--logo-mask", `url("${activeLogoSrc}")`);
      label.classList.add("is-glinting");

      const glintDuration = 520;
      const pauseAfterGlint = 80;
      const wipeDuration = 760;
      const totalDuration = glintDuration + pauseAfterGlint + wipeDuration;
      const diagonalOffset = 24;

      const finishTransition = () => {
        currentLogo.classList.remove("is-active");
        currentLogo.style.clipPath = "";
        nextLogo.style.clipPath = "";
        nextLogo.classList.add("is-active");
        label.classList.remove("is-glinting", "is-wiping");
        label.style.removeProperty("--wipe-edge");
        label.style.setProperty(
          "--logo-mask",
          `url("${nextLogo.getAttribute("src") || "flow2.png"}")`,
        );
        activeIndex = nextIndex;
        isAnimating = false;
        animationFrame = null;
      };

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;

        if (elapsed < glintDuration) {
          // CSS анимирует только блик; логотип остаётся полностью видимым.
        } else if (elapsed < glintDuration + pauseAfterGlint) {
          label.classList.remove("is-glinting");
        } else {
          if (!wipeStarted) {
            wipeStarted = true;
            label.classList.remove("is-glinting");
            label.classList.add("is-wiping");
          }

          const wipeElapsed = elapsed - glintDuration - pauseAfterGlint;
          const linearProgress = Math.min(1, wipeElapsed / wipeDuration);
          const progress =
            linearProgress * linearProgress * (3 - 2 * linearProgress);
          const wipeEdge = progress * (100 + diagonalOffset);

          // Логотипы занимают строго противоположные стороны одной границы:
          // слева уже новый, справа ещё старый — без наложения изображений.
          const bottomEdge = wipeEdge - diagonalOffset;

          nextLogo.style.clipPath = `polygon(
            0 0,
            ${wipeEdge}% 0,
            ${bottomEdge}% 100%,
            0 100%
          )`;

          currentLogo.style.clipPath = `polygon(
            ${wipeEdge}% 0,
            100% 0,
            100% 100%,
            ${bottomEdge}% 100%
          )`;

          label.style.setProperty("--wipe-edge", `${wipeEdge}%`);
        }

        if (elapsed >= totalDuration) {
          finishTransition();
          return;
        }

        animationFrame = window.requestAnimationFrame(animate);
      };

      animationFrame = window.requestAnimationFrame(animate);
    }

    // Ждём загрузки второго файла, чтобы смена не открывала пустую область.
    if (logos[1 - activeIndex].complete) {
      startCycleTimer();
    } else {
      logos[1 - activeIndex].addEventListener("load", startCycleTimer, {
        once: true,
      });
    }

    // Если второй файл не найден, исходный логотип остаётся без анимации.
    logos[1 - activeIndex].addEventListener(
      "error",
      () => {
        if (cycleTimer !== null) {
          window.clearInterval(cycleTimer);
          cycleTimer = null;
        }
        if (animationFrame !== null) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        label.classList.remove("is-glinting", "is-wiping");
        label.style.removeProperty("--wipe-edge");
        label.style.removeProperty("--logo-mask");
        currentLogo.style.clipPath = "";
        nextLogo.style.clipPath = "";
        isAnimating = false;
      },
      { once: true },
    );
  });
}

/* =========================================================
   HERO — SEGMENTED EQUALIZER
   ========================================================= */

function initHeroEqualizer() {
  const equalizer = document.getElementById("heroEqualizer");
  if (!equalizer) return;

  const BAR_COUNT = 25;

  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement("span");

    bar.className = "hero__equalizer-bar";

    const peak = 0.35 + Math.random() * 0.65;
    const fall = 0.12 + Math.random() * 0.35;
    const duration = 1000 + Math.random() * 800;
    const delay = -Math.random() * duration;
    const hue = 275 + (i / (BAR_COUNT - 1)) * 55;

    bar.style.setProperty("--bar-peak", peak.toFixed(2));
    bar.style.setProperty("--bar-fall", fall.toFixed(2));
    bar.style.setProperty("--bar-duration", `${duration.toFixed(0)}ms`);
    bar.style.setProperty("--bar-delay", `${delay.toFixed(0)}ms`);
    bar.style.setProperty("--bar-hue", hue.toFixed(0));

    equalizer.appendChild(bar);
  }
}
