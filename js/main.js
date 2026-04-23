function setupHeaderState() {
  const updateHeader = () => {
    document.body.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function setupPageLoader() {
  const loader = document.querySelector(".page-loader");

  if (loader) {
    loader.innerHTML = `<div class="loader"></div>`;
  }

  const delay = 1000 + Math.random() * 1000;

  window.setTimeout(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("is-ready");
    });
  }, delay);

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      document.body.classList.add("is-ready");
    }
  });
}

function setupYear() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function init() {
  setupHeaderState();
  setupPageLoader();
  setupYear();
}

document.addEventListener("DOMContentLoaded", init);
