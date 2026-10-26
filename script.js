/* =========================================================
   FLOW STATE MUSIC — main script
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initScrollDown();
  initHeroShadow();
  initEqualizer();
  initRails();
  initArtistCards();
  initFooterYear();
  initHeader();
  initArtistsCarousel();
});

/* =========================================================
   1. Стрелка "скролл вниз" в Hero
   Скроллит к центру секции About
   ========================================================= */
function initScrollDown() {
  const scrollBtn = document.getElementById("scrollDown");
  const aboutSection = document.getElementById("about");

  if (!scrollBtn || !aboutSection) return;

  scrollBtn.addEventListener("click", () => {
    const rect = aboutSection.getBoundingClientRect();
    const sectionHeight = aboutSection.offsetHeight;
    const windowHeight = window.innerHeight;

    // Центр секции относительно документа
    const sectionCenter = window.scrollY + rect.top + sectionHeight / 2;

    // Целевая позиция скролла — центр секции в центре экрана
    let targetScroll = sectionCenter - windowHeight / 2;

    // Не уходим ниже конца страницы
    const maxScroll = document.documentElement.scrollHeight - windowHeight;
    targetScroll = Math.min(targetScroll, maxScroll);

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  });
}

/* =========================================================
   2. Тень от курсора для hero-man
   Курсор = источник света.
   Тень уходит в противоположную сторону от курсора.
   Яркость и смещение зависят от расстояния до центра картинки.
   ========================================================= */
function initHeroShadow() {
  const heroImg = document.getElementById("heroMan");
  if (!heroImg) return;

  // ---------- Настройки эффекта ----------
  const MAX_OFFSET = 50; // макс. смещение тени в px
  const MAX_DISTANCE = 350; // радиус, на котором достигается макс.
  const CORE_BLUR = 10; // blur ядра
  const HALO_BLUR = 40; // blur ореола
  const HALO_MULT = 1.5; // ореол смещается сильнее ядра

  const COLOR = "255, 255, 255"; // белый
  const CORE_ALPHA_MIN = 0.12;
  const CORE_ALPHA_MAX = 0.22;
  const HALO_ALPHA_MIN = 0.06;
  const HALO_ALPHA_MAX = 0.12;

  // ---------- Состояние ----------
  let rafId = null;
  let pendingX = 0;
  let pendingY = 0;

  // ---------- Функции ----------
  function applyShadow(x, y, coreAlpha, haloAlpha) {
    heroImg.style.filter =
      `drop-shadow(${x}px ${y}px ${CORE_BLUR}px rgba(${COLOR}, ${coreAlpha})) ` +
      `drop-shadow(${x * HALO_MULT}px ${y * HALO_MULT}px ${HALO_BLUR}px rgba(${COLOR}, ${haloAlpha}))`;
  }

  function clearShadow() {
    heroImg.style.filter = "none";
  }

  function updateShadow() {
    rafId = null;

    const rect = heroImg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = pendingX - centerX;
    const dy = pendingY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const strength = Math.min(distance / MAX_DISTANCE, 1);
    const angleX = distance === 0 ? 0 : dx / distance;
    const angleY = distance === 0 ? 0 : dy / distance;

    // Тень — в противоположную сторону от курсора
    const shadowX = -angleX * MAX_OFFSET * strength;
    const shadowY = -angleY * MAX_OFFSET * strength;

    const coreAlpha =
      CORE_ALPHA_MIN + strength * (CORE_ALPHA_MAX - CORE_ALPHA_MIN);
    const haloAlpha =
      HALO_ALPHA_MIN + strength * (HALO_ALPHA_MAX - HALO_ALPHA_MIN);

    applyShadow(shadowX, shadowY, coreAlpha, haloAlpha);
  }

  function onMouseMove(e) {
    pendingX = e.clientX;
    pendingY = e.clientY;

    if (!rafId) {
      rafId = requestAnimationFrame(updateShadow);
    }
  }

  // ---------- Слушатели ----------
  // mousemove — на самой картинке
  heroImg.addEventListener("mousemove", onMouseMove);

  // mouseleave — ушёл с картинки → тень исчезает
  heroImg.addEventListener("mouseleave", () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    clearShadow();
  });
}

/* =========================================================
   3. Эквалайзер в hero
   Визуальная имитация аудио-спектра
   ========================================================= */
function initEqualizer() {
  const equalizer = document.getElementById("equalizer");
  if (!equalizer) return;

  // ---------- Настройки ----------
  const BAR_COUNT = 24; // сколько полосок
  const MIN_HEIGHT = 8; // мин. высота в %
  const MAX_HEIGHT = 100; // макс. высота в %
  const FPS = 30; // обновлений в секунду

  // ---------- Создаём полоски ----------
  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement("div");
    bar.className = "equalizer__bar";
    equalizer.appendChild(bar);

    // У каждой полоски свои параметры — «характер»
    bars.push({
      el: bar,
      current: MIN_HEIGHT, // текущая высота
      target: MIN_HEIGHT, // куда стремимся
      speed: 0.15 + Math.random() * 0.25, // скорость сглаживания
      // «Центральные» полоски прыгают выше — как в реальном спектре
      // где середина диапазона обычно активнее
      amplitude: 0.5 + Math.sin((i / BAR_COUNT) * Math.PI) * 0.5,
    });
  }

  // ---------- Анимация ----------
  let lastTime = 0;
  const interval = 1000 / FPS;

  function tick(time) {
    if (time - lastTime >= interval) {
      lastTime = time;

      bars.forEach((bar) => {
        // Раз в кадр с какой-то вероятностью выбираем новую цель
        if (Math.random() < 0.4) {
          const base = MIN_HEIGHT + Math.random() * (MAX_HEIGHT - MIN_HEIGHT);
          bar.target = base * bar.amplitude + MIN_HEIGHT * (1 - bar.amplitude);
        }

        // Плавно движемся от current к target (lerp)
        bar.current += (bar.target - bar.current) * bar.speed;

        // Применяем высоту
        bar.el.style.height = bar.current + "%";
      });
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* =========================================================
   4. Rails — бесшовный скролл через ручной цикл
   ========================================================= */
function initRails() {
  const rails = document.querySelectorAll(".rail");

  rails.forEach((rail, railIndex) => {
    const track = rail.querySelector(".rail__track");
    const firstGroup = rail.querySelector(".rail__group");
    if (!track || !firstGroup) return;

    // ---------- Настройки ----------
    const DURATION = 10000; // мс за одну копию
    const DIRECTION = railIndex === 0 ? -1 : 1; // левая вверх, правая вниз

    let groupHeight = 0;
    let startTime = null;

    function measure() {
      groupHeight = Math.round(firstGroup.getBoundingClientRect().height);
    }

    function animate(time) {
      if (startTime === null) startTime = time;

      if (groupHeight === 0) {
        requestAnimationFrame(animate);
        return;
      }

      const elapsed = time - startTime;
      const progress = (elapsed % DURATION) / DURATION;

      let offset;
      if (DIRECTION === -1) {
        // Левая: 0 → -groupHeight (едет вверх)
        offset = -progress * groupHeight;
      } else {
        // Правая: -groupHeight → 0 (едет вниз)
        offset = -(1 - progress) * groupHeight;
      }

      track.style.transform = `translate3d(0, ${offset}px, 0)`;

      requestAnimationFrame(animate);
    }

    const start = () => {
      measure();
      requestAnimationFrame(animate);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      window.addEventListener("load", start);
    }
  });
}

/* =========================================================
   5. Reactive-подсветка карточек артистов
   Пятно света следует за курсором внутри карточки
   ========================================================= */
function initArtistCards() {
  const cards = document.querySelectorAll(".carousel__slide .artist-card");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!finePointer.matches || reduceMotion.matches) return;

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

function initFooterYear() {
  const year = document.getElementById("footerYear");
  if (year) year.textContent = String(new Date().getFullYear());
}

/* =========================================================
   6. Меню (header)
   - стеклянная панель по центру, «линза» едет к активному пункту
   - прячется при скролле вниз, возвращается при скролле вверх
   - на мобильных — бургер и полноэкранное меню
   ========================================================= */
function initHeader() {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  if (!header || !nav || !burger) return;

  const lens = nav.querySelector(".nav__lens");

  // Пары «ссылка меню → секция»
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

  // Двигаем «линзу» под ссылку. При первом появлении — без анимации
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
      void lens.offsetWidth; // применяем позицию до включения transition
      lens.style.transition = "";
    }
    lens.classList.add("is-visible");
  }

  function updateActive() {
    // Активна последняя секция, верх которой уже выше «линии» на 35% экрана
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

  // Если растянули окно до десктопа при открытом меню — закрываем
  mobileQuery.addEventListener("change", (e) => {
    if (!e.matches) setMenu(false);
    moveLens(currentLink);
  });

  // Ширина пунктов меняется после загрузки шрифта и при ресайзе
  window.addEventListener("resize", () => moveLens(currentLink));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => moveLens(currentLink));
  }

  onScroll();
}

/* =========================================================
   7. Карусель артистов
   Трек двигаем сами через transform, без нативного scroll-snap.
   Позиция — дробный «индекс слайда»; после отпускания к цели
   ведёт критически задемпфированная пружина, поэтому и недосвайп,
   и бросок заканчиваются плавно, без рывков.
   ========================================================= */
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
  const last = slides.length - 1;

  // ---------- Настройки (крути под себя) ----------
  const STIFFNESS = 140; // жёсткость пружины: больше = быстрее доезжает
  const DAMPING = 2 * Math.sqrt(STIFFNESS); // критическое затухание — без «болтанки»
  const PROJECTION = 0.2; // сек: как далеко «летит» слайд после броска
  const COMMIT = 0.15; // доля шага: дальше неё свайп засчитывается как переход
  const EDGE_RESIST = 0.35; // сопротивление за крайними слайдами
  const DRAG_START = 6; // px до начала перетаскивания
  const MAX_VEL = 8; // потолок скорости, слайдов/сек

  // ---------- Состояние ----------
  let step = 1; // расстояние между центрами соседних слайдов, px
  let pos = 0; // текущая позиция в «слайдах» (дробная)
  let vel = 0; // скорость, слайдов/сек
  let target = 0; // индекс, к которому едем
  let active = -1; // слайд, ближайший к центру
  let rafId = null;
  let lastTime = 0;

  // ---------- Точки ----------
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

    slides.forEach((s, i) => {
      s.style.setProperty("--d", Math.min(Math.abs(i - pos), 1).toFixed(3));
    });

    const idx = clampIndex(Math.round(pos));
    if (idx !== active) {
      active = idx;
      syncState();
    }
  }

  // ---------- Пружина ----------
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

    if (instant || reduceMotion.matches) {
      stopLoop();
      pos = target;
      vel = 0;
      render();
      return;
    }
    startLoop();
  }

  // ---------- Перетаскивание (мышь, тач, стилус) ----------
  let dragging = false;
  let moved = false;
  let pointerId = null;
  let startX = 0;
  let startPos = 0;
  let startIndex = 0;
  let lastX = 0;
  let lastT = 0;
  let dragVel = 0;

  // За краями — «резиновое» сопротивление
  function resist(p) {
    if (p < 0) return p * EDGE_RESIST;
    if (p > last) return last + (p - last) * EDGE_RESIST;
    return p;
  }

  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    dragging = true;
    moved = false;
    pointerId = e.pointerId;
    startX = lastX = e.clientX;
    lastT = e.timeStamp;
    startPos = pos;
    startIndex = target;
    dragVel = 0;

    stopLoop(); // перехватываем слайд «на лету»
    vel = 0;
  });

  window.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pointerId) return;

    const dx = e.clientX - startX;

    if (!moved) {
      if (Math.abs(dx) < DRAG_START) return;
      moved = true;
      viewport.classList.add("is-dragging");
      // Захват только после порога — иначе обычный клик по ссылке сломается
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch (_) {}
    }

    pos = resist(startPos - dx / step);

    // Сглаженная скорость в слайдах/сек (без учёта сопротивления)
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

    // Просто тап — возобновляем движение к цели
    if (!moved) {
      goTo(target);
      return;
    }

    // Куда «упадёт» слайд с учётом броска
    let next = Math.round(pos + dragVel * PROJECTION);

    // Недосвайп: если потянули дальше COMMIT — всё равно листаем
    const delta = pos - startIndex;
    if (next === startIndex && Math.abs(delta) > COMMIT) {
      next = startIndex + Math.sign(delta);
    }

    // Если перед отпусканием палец/мышь стояли — инерции нет
    const stale = e.timeStamp - lastT > 80;
    vel = stale ? 0 : Math.max(-MAX_VEL, Math.min(MAX_VEL, dragVel));

    goTo(next);

    // click после mouseup ещё должен увидеть moved = true
    setTimeout(() => {
      moved = false;
    }, 0);
  }

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  // Нативный drag картинок/ссылок ломает перетаскивание
  viewport.addEventListener("dragstart", (e) => e.preventDefault());

  // ---------- Горизонтальный скролл трекпадом ----------
  let wheelTimer = null;

  viewport.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // вертикаль — странице

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

  // ---------- Клик: после перетаскивания игнорируем; по боковому слайду —
  // центрируем вместо перехода по ссылке ----------
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

  // ---------- Стрелки и клавиатура ----------
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

  // ---------- Resize и старт ----------
  window.addEventListener("resize", () => {
    measure();
    render();
  });

  measure();
  // Стартуем со среднего артиста — по бокам видны соседи
  target = pos = Math.floor(last / 2);
  render();
}