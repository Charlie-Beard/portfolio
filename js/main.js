function setupHeaderState() {
  const updateHeader = () => {
    document.body.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function setupYear() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function equalizeCards() {
  const cards = document.querySelectorAll(".project-card");
  if (!cards.length) return;

  cards.forEach((card) => (card.style.minHeight = ""));

  if (window.matchMedia("(min-width: 60rem)").matches) {
    const maxHeight = Math.max(...Array.from(cards).map((c) => c.offsetHeight));
    cards.forEach((card) => (card.style.minHeight = maxHeight + "px"));
  }
}

function debounce(fn, delay) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}

function init() {
  setupHeaderState();
  setupYear();
  equalizeCards();
  window.addEventListener("resize", debounce(equalizeCards, 150), { passive: true });
}

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("load", equalizeCards);
