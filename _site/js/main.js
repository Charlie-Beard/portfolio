const PAGE_TRANSITION_KEY = "portfolio-page-transition-end";

const LOADER_MESSAGES = [
  "Reading the work",
  "Reviewing the details",
  "Thinking through the approach",
  "Curating the content",
  "Loading case study",
  "Considering the context",
  "Almost ready",
];

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
    loader.innerHTML = `<p class="page-loader__message"><span class="page-loader__text"></span><span class="page-loader__cursor"></span></p>`;
  }

  const textEl = loader?.querySelector(".page-loader__text");
  let messageInterval = null;

  function startMessages() {
    if (!textEl) return;
    let i = Math.floor(Math.random() * LOADER_MESSAGES.length);
    textEl.textContent = LOADER_MESSAGES[i];
    messageInterval = setInterval(() => {
      i = (i + 1) % LOADER_MESSAGES.length;
      textEl.textContent = LOADER_MESSAGES[i];
    }, 750);
  }

  function stopMessages() {
    clearInterval(messageInterval);
    messageInterval = null;
  }

  let pendingEndTime = 0;
  try {
    pendingEndTime = Number(window.sessionStorage.getItem(PAGE_TRANSITION_KEY) || 0);
  } catch (error) {}

  if (pendingEndTime) {
    startMessages();
    const delay = Math.max(0, pendingEndTime - Date.now());

    window.setTimeout(() => {
      try {
        window.sessionStorage.removeItem(PAGE_TRANSITION_KEY);
      } catch (error) {}

      stopMessages();
      requestAnimationFrame(() => {
        document.body.classList.add("is-ready");
        document.body.classList.remove("is-navigating");
      });
    }, delay);
  } else {
    document.body.classList.add("is-ready");
  }

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      stopMessages();
      document.body.classList.add("is-ready");
      document.body.classList.remove("is-navigating");
    }
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");

    if (!link) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const url = new URL(link.href, window.location.href);

    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.hash) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash === window.location.hash) return;

    event.preventDefault();

    const randomDelay = Math.floor(Math.random() * 1000) + 500;

    try {
      window.sessionStorage.setItem(PAGE_TRANSITION_KEY, String(Date.now() + randomDelay));
    } catch (error) {}

    document.body.classList.add("is-navigating");
    startMessages();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.location.href = url.href;
      });
    });
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
