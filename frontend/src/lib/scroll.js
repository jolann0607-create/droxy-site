export const scrollToId = (id) => {
  if (id === "#top") {
    if (window.__lenis) return window.__lenis.scrollTo(0, { offset: 0 });
    return window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const el = document.querySelector(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -90 });
  else el.scrollIntoView({ behavior: "smooth" });
};
