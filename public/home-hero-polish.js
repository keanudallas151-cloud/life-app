(() => {
  const normalize = (value) => (value || "").replace(/\s+/g, " ").trim();

  const hasHomeHeaderSearch = () =>
    !!document.querySelector(
      'input[placeholder*="Search topics"], input[placeholder*="Search"]'
    );

  const findTextNode = (matcher, root = document) => {
    const elements = Array.from(
      root.querySelectorAll("h1, h2, h3, p, span, strong, div")
    );
    return elements.find((el) => {
      if (el.children.length > 0) return false;
      return matcher(normalize(el.textContent));
    });
  };

  const findHeroContainer = () => {
    const containers = Array.from(
      document.querySelectorAll("section, article, main, div")
    );

    return (
      containers.find((container) => {
        const text = normalize(container.textContent).toLowerCase();
        return (
          text.includes("welcome to") &&
          text.includes("life") &&
          (text.includes("start reading") || text.includes("daily growth"))
        );
      }) || null
    );
  };

  const restoreHeroClasses = (heroContainer) => {
    document
      .querySelectorAll(".life-home-welcome-upgraded, .life-home-logo-upgraded")
      .forEach((node) => {
        if (heroContainer && heroContainer.contains(node)) return;
        node.classList.remove("life-home-welcome-upgraded");
        node.classList.remove("life-home-logo-upgraded");
      });
  };

  const findSidebarContainers = () => {
    return Array.from(document.querySelectorAll("aside, nav, section, div")).filter(
      (container) => {
        const text = normalize(container.textContent).toLowerCase();
        return (
          text.includes("knowledge map") &&
          text.includes("quiz") &&
          text.includes("library") &&
          text.includes("saved")
        );
      }
    );
  };

  const patchHero = () => {
    if (!hasHomeHeaderSearch()) return;

    const container = findHeroContainer();
    restoreHeroClasses(container);
    if (!container) return;

    const welcomeEl = findTextNode((text) => /^welcome to$/i.test(text), container);
    const logoEl = findTextNode((text) => /^life\.?$/i.test(text), container);

    if (!welcomeEl || !logoEl) return;

    welcomeEl.classList.add("life-home-welcome-upgraded");
    logoEl.classList.add("life-home-logo-upgraded");
    container.classList.add("life-home-hero-upgraded");
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

  const looksLikeSidebarLabelWordmark = (node) => {
    if (!(node instanceof HTMLElement)) return false;
    const text = normalize(node.textContent);
    if (!/^life\.?$/i.test(text)) return false;
    if (node.tagName !== "P") return false;

    const computed = getComputedStyle(node);
    const fontSize = Number.parseFloat(computed.fontSize || "0");
    const textTransform = (node.style.textTransform || computed.textTransform || "").toLowerCase();
    const textAlign = (node.style.textAlign || computed.textAlign || "").toLowerCase();

    return fontSize <= 18 && textTransform === "uppercase" && textAlign === "left";
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
    const sidebarContainers = findSidebarContainers();

    document.querySelectorAll(".life-home-logo-upgraded").forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (isHomepageWordmark(node)) return;
      node.classList.remove("life-home-logo-upgraded");
    });

    sidebarContainers.forEach((container) => {
      const nodes = Array.from(
        container.querySelectorAll("h1, h2, h3, p, span, div, strong")
      );

      nodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        const text = normalize(node.textContent);
        if (!/^life\.?$/i.test(text)) {
          restoreWordmark(node);
          return;
        }

        node.classList.remove("life-home-logo-upgraded");
        node.style.display = "none";
        node.setAttribute("data-life-sidebar-wordmark-removed", "true");
      });
    });

    const nonSidebarNodes = Array.from(
      document.querySelectorAll("h1, h2, h3, p, span, div, strong")
    ).filter(
      (node) =>
        node instanceof HTMLElement &&
        !sidebarContainers.some((container) => container.contains(node))
    );

    nonSidebarNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (isHomepageWordmark(node)) {
        restoreWordmark(node);
        return;
      }

      if (looksLikeLargeLifeWordmark(node) || looksLikeSidebarLabelWordmark(node)) {
        node.style.display = "none";
        node.setAttribute("data-life-sidebar-wordmark-removed", "true");
        return;
      }

      restoreWordmark(node);
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
