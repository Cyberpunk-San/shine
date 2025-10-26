// Keyboard navigation between pages
window.addEventListener('keydown', (e) => {
  const currentPage = window.location.pathname.split('/').pop();
  const pages = ['index.html', 'silence.html', 'emptiness.html', 'stillness.html', 'end.html'];
  const currentIndex = pages.indexOf(currentPage);

  if (e.key === 'ArrowRight' && currentIndex < pages.length - 1) {
    window.location.href = pages[currentIndex + 1];
  } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
    window.location.href = pages[currentIndex - 1];
  }
});

// Handle window resize for all pages
window.addEventListener('resize', () => {
  // This will be overridden by individual page scripts
});