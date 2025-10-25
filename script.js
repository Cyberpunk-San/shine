const wrapper = document.querySelector('.scroll-wrapper');

// Set body height to match total scroll distance (based on wrapper width)
document.body.style.height = `${wrapper.scrollWidth}px`;

// Translate vertical scroll to horizontal motion
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  wrapper.style.transform = `translateX(-${scrollTop}px)`;
});
