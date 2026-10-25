/* =========================================================
   FLOW STATE MUSIC — main script
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initScrollDown();
  initHeroShadow();
  initEqualizer();
  initRails();
  initArtistCards();
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
  const cards = document.querySelectorAll(".artist-card__image");

  cards.forEach((card) => {
    let rafId = null;
    let pendingX = 0;
    let pendingY = 0;

    function update() {
      rafId = null;

      const rect = card.getBoundingClientRect();
      const x = ((pendingX - rect.left) / rect.width) * 100;
      const y = ((pendingY - rect.top) / rect.height) * 100;

      // Записываем в CSS-переменные — градиент сам перестроится
      card.style.setProperty("--mx", x + "%");
      card.style.setProperty("--my", y + "%");
    }

    card.addEventListener("mousemove", (e) => {
      pendingX = e.clientX;
      pendingY = e.clientY;

      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    });
  });
}

/* =========================================================
   6. Меню (header)
   - становится «стеклянным» после небольшого скролла
   - прячется при скролле вниз, возвращается при скролле вверх
   - подсвечивает пункт текущей секции
   - на мобильных — бургер и полноэкранное меню
   ========================================================= */
function initHeader() {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  if (!header || !nav || !burger) return;

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

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    if (open) header.classList.remove("header--hidden");
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
  }

  function onScroll() {
    ticking = false;
    const y = window.scrollY;

    header.classList.toggle("header--solid", y > 40);

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
  });

  onScroll();
}

/* =========================================================
   7. Карусель артистов
   Основа — нативный scroll-snap (свайп на телефоне работает сам).
   JS добавляет: подсветку центрального слайда, стрелки, точки,
   клавиатуру и перетаскивание мышью.
   ========================================================= */
function initArtistsCarousel() {
  const root = document.getElementById("artistsCarousel");
  if (!root) return;

  const track = root.querySelector(".carousel__track");
  const slides = [...root.querySelectorAll(".carousel__slide")];
  const prevBtn = root.querySelector(".carousel__arrow--prev");
  const nextBtn = root.querySelector(".carousel__arrow--next");
  const dotsBox = root.querySelector(".carousel__dots");
  if (!track || !slides.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let active = -1; // индекс слайда, ближайшего к центру
  let rafId = null;

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

  // ---------- Навигация ----------
  function slideLeft(i) {
    const s = slides[i];
    return s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2;
  }

  function goTo(i, smooth = true) {
    const index = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({
      left: slideLeft(index),
      behavior: smooth && !reduceMotion.matches ? "smooth" : "instant",
    });
  }

  function syncState() {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === active));
    dots.forEach((d, i) => {
      if (i === active) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
    if (prevBtn) prevBtn.disabled = active <= 0;
    if (nextBtn) nextBtn.disabled = active >= slides.length - 1;
  }

  // ---------- Подсветка по расстоянию до центра ----------
  function update() {
    rafId = null;
    const center = track.scrollLeft + track.clientWidth / 2;

    let nearest = 0;
    let nearestDist = Infinity;

    slides.forEach((s, i) => {
      const dist = Math.abs(s.offsetLeft + s.offsetWidth / 2 - center);
      const d = Math.min(dist / s.offsetWidth, 1);
      s.style.setProperty("--d", d.toFixed(3));

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });

    if (nearest !== active) {
      active = nearest;
      syncState();
    }
  }

  track.addEventListener(
    "scroll",
    () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    },
    { passive: true },
  );

  // ---------- Стрелки и клавиатура ----------
  if (prevBtn) prevBtn.addEventListener("click", () => goTo(active - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goTo(active + 1));

  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(slides.length - 1);
    }
  });

  // ---------- Перетаскивание мышью (тач работает нативно) ----------
  let isDown = false;
  let moved = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    isDown = true;
    moved = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;

    if (!moved && Math.abs(dx) > 5) {
      moved = true;
      track.classList.add("is-dragging"); // отключает snap на время перетаскивания
    }
    if (moved) track.scrollLeft = startScroll - dx;
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;

    if (moved) {
      track.classList.remove("is-dragging");
      goTo(active); // доводим до ближайшего слайда
      // click после mouseup ещё должен увидеть moved = true
      setTimeout(() => {
        moved = false;
      }, 0);
    }
  }

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  // Нативный drag картинок/ссылок ломает перетаскивание
  track.addEventListener("dragstart", (e) => e.preventDefault());

  // Клик: после перетаскивания — игнорируем; по боковому слайду — центрируем,
  // а не переходим по ссылке
  track.addEventListener("click", (e) => {
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

  // ---------- Resize и старт ----------
  window.addEventListener("resize", () => goTo(active, false));

  // Стартуем со среднего артиста — по бокам видны соседи
  goTo(Math.floor((slides.length - 1) / 2), false);
  update();
}