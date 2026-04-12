(() => {
  const normalize = (value) => (value || "").replace(/\s+/g, " ").trim();

  const hasHomeHeaderSearch = () =>
    !!document.querySelector(
      'input[placeholder*="Search topics"], input[placeholder*="Search"]'
    );

  const findTextNode = (matcher) => {
    const elements = Array.from(
      document.querySelectorAll("h1, h2, h3, p, span, strong, div")
    );
    return elements.find((el) => {
      if (el.children.length > 0) return false;
      return matcher(normalize(el.textContent));
    });
  };

  const findHeroContainer = (welcomeEl, logoEl) => {
    if (!welcomeEl || !logoEl) return null;

    let container = welcomeEl.closest("section, article, main, div");
    while (container && !container.contains(logoEl)) {
      container = container.parentElement?.closest("section, article, main, div");
    }
    return container || logoEl.parentElement || null;
  };

  const patchHero = () => {
    if (!hasHomeHeaderSearch()) return;

    const welcomeEl = findTextNode((text) => /^welcome to$/i.test(text));
    const logoEl =
      findTextNode((text) => /^life\.?$/i.test(text)) ||
      findTextNode((text) => /^life$/i.test(text));

    if (!welcomeEl || !logoEl) return;

    const container = findHeroContainer(welcomeEl, logoEl);
    if (container) {
      container.classList.add("life-home-hero-upgraded");
    }

    welcomeEl.classList.add("life-home-welcome-upgraded");
    logoEl.classList.add("life-home-logo-upgraded");
  };

  const run = () => {
    patchHero();
  };

  const observer = new MutationObserver(() => {
    run();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      run();
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  } else {
    run();
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
})();
