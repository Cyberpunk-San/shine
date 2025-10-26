// ===== HORIZONTAL SCROLL CONVERSION =====
// Converts vertical mouse wheel to horizontal scroll
const container = document.querySelector('.horizontal-container');

container.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  }
}, { passive: false });

// ===== PARALLAX EFFECT =====
// Different layers move at different speeds
const backgroundLayer = document.querySelector('.background-layer');
const midgroundLayer = document.querySelector('.midground-layer');
const foregroundLayer = document.querySelector('.foreground-layer');
const lightingOverlay = document.querySelector('.lighting-overlay');

container.addEventListener('scroll', () => {
  const scrollPos = container.scrollLeft;
  
  // Parallax speeds (adjust these to change effect intensity)
  const backgroundSpeed = 0.2;  // slowest
  const midgroundSpeed = 0.3;   // medium
  const foregroundSpeed = 0.4;  // fastest
  
  // Apply transforms
  backgroundLayer.style.transform = `translateX(${-scrollPos * backgroundSpeed}px)`;
  midgroundLayer.style.transform = `translateX(${-scrollPos * midgroundSpeed}px)`;
  foregroundLayer.style.transform = `translateX(${-scrollPos * foregroundSpeed}px)`;
  
  // Lighting animation 
  const maxScroll = 3000;
  const scrollProgress = scrollPos / maxScroll;
  
  // Opacity varies: starts at 0.3, peaks at 0.6 in middle, back to 0.3
  let opacity;
  if (scrollProgress < 0.5) {
    opacity = 0.3 + (scrollProgress * 0.6);
  } else {
    opacity = 0.6 - ((scrollProgress - 0.5) * 0.6);
  }
  
  lightingOverlay.style.opacity = opacity;
});

// ===== NAVIGATION BUTTON HANDLERS =====

const navButtons = document.querySelectorAll('.nav-btn');

navButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    console.log(`Button ${index + 1} clicked`);
  });
});
