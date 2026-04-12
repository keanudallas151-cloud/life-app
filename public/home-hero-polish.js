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

  const getAncestors = (node) => {
    const ancestors = [];
    let current = node instanceof Element ? node : null;
    while (current && current !== document.body) {
      ancestors.push(current);
      current = current.parentElement;
    }
    return ancestors;
  };

  const looksLikeLargeLifeWordmark = (node) => {
    if (!(node instanceof HTMLElement)) return false;
    const text = normalize(node.textContent);
    if (!/^life\.?$/i.test(text)) return false;
    const fontSize = Number.parseFloat(getComputedStyle(node).fontSize || "0");
    return fontSize >= 40;
  };

  const isHomepageWordmark = (node) => {
    return getAncestors(node).some((ancestor) => {
      const text = normalize(ancestor.textContent).toLowerCase();
      return (
        text.includes("welcome to") &&
        (text.includes("start reading") || text.includes("daily growth"))
      );
    });
  };

  const restoreWordmark = (node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.dataset.lifeSidebarWordmarkRemoved === "true") {
      node.style.removeProperty("display");
      node.removeAttribute("data-life-sidebar-wordmark-removed");
    }
  };

  const patchSidebarWordmark = () => {
    const nodes = Array.from(
      document.querySelectorAll("h1, h2, h3, p, span, div, strong")
    );

    nodes.forEach((node) => {
      if (!looksLikeLargeLifeWordmark(node)) {
        restoreWordmark(node);
        return;
      }

      if (isHomepageWordmark(node)) {
        restoreWordmark(node);
        return;
      }

      node.style.display = "none";
      node.setAttribute("data-life-sidebar-wordmark-removed", "true");
    });
  };

  const run = () => {
    patchHero();
    patchSidebarWordmark();
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
