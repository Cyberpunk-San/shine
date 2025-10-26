// ===== HORIZONTAL SCROLL CONVERSION =====
const container = document.querySelector('.horizontal-container');
const navButtons = document.querySelectorAll('.nav-btn');

// smooth scroll factor
let isScrolling = false;

container.addEventListener(
  "wheel",
  (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      container.scrollLeft += e.deltaY * 1.2; // slightly faster horizontal scroll
    }
  },
  { passive: false }
);

// ===== PARALLAX EFFECT =====
const backgroundLayer = document.querySelector('.background-layer');
const midgroundLayer = document.querySelector('.midground-layer');
const foregroundLayer = document.querySelector('.foreground-layer');
const lightingOverlay = document.querySelector('.lighting-overlay');
const scrollHint = document.querySelector('.scroll-hint');

container.addEventListener("scroll", () => {
  const scrollPos = container.scrollLeft;
  const maxScroll = container.scrollWidth - container.clientWidth;
  const progress = scrollPos / maxScroll;

  // Parallax speeds
  backgroundLayer.style.transform = `translateX(${-scrollPos * 0.1}px)`;
  midgroundLayer.style.transform = `translateX(${-scrollPos * 0.25}px)`;
  foregroundLayer.style.transform = `translateX(${-scrollPos * 0.4}px)`;

  // Lighting: fades in/out like breathing light
  const opacity = 0.3 + Math.sin(progress * Math.PI) * 0.3;
  lightingOverlay.style.opacity = opacity.toFixed(2);

  // Scroll hint fades away after first move
  if (scrollPos > 50) scrollHint.style.opacity = "0";
  else scrollHint.style.opacity = "1";

  // Activate nav button based on scroll position
  updateActiveButton(scrollPos);
});

// ===== NAVIGATION BUTTON HANDLERS =====
const sectionWidth = window.innerWidth;
navButtons.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    container.scrollTo({
      left: index * sectionWidth,
      behavior: "smooth",
    });
    animateButton(btn);
  });
});

// ===== BUTTON CLICK ANIMATION =====
function animateButton(btn) {
  btn.classList.add("pressed");
  setTimeout(() => btn.classList.remove("pressed"), 300);
}

// ===== SCROLL-BASED NAV HIGHLIGHT =====
function updateActiveButton(scrollPos) {
  const sectionIndex = Math.round(scrollPos / sectionWidth);
  navButtons.forEach((btn, i) => {
    btn.classList.toggle("active", i === sectionIndex);
  });
}

// ===== KEYBOARD NAVIGATION (← → keys) =====
window.addEventListener("keydown", (e) => {
  const activeIndex = [...navButtons].findIndex((btn) =>
    btn.classList.contains("active")
  );

  if (e.key === "ArrowRight" && activeIndex < navButtons.length - 1) {
    navButtons[activeIndex + 1].click();
  } else if (e.key === "ArrowLeft" && activeIndex > 0) {
    navButtons[activeIndex - 1].click();
  }
});

// ===== PARALLAX MOUSE INTERACTION =====
document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 30; // tilt factor
  const y = (e.clientY / window.innerHeight - 0.5) * 20;

  foregroundLayer.style.transform += ` rotateY(${x * 0.05}deg) rotateX(${-y * 0.05}deg)`;
});
