(() => {
  const TOGGLE_LABELS = new Set(["show", "hide"]);

  const normalize = (value) => (value || "").trim().toLowerCase();

  const getButtonLabel = (button) => {
    const direct = normalize(button.textContent);
    if (direct) return direct;
    const labelNode = button.querySelector(".life-password-toggle-label");
    return normalize(labelNode?.textContent);
  };

  const hasPasswordLikeInput = (container) => {
    if (!(container instanceof Element)) return false;
    return !!container.querySelector(
      'input[type="password"], input[type="text"][name*="pass" i], input[autocomplete="current-password"], input[autocomplete="new-password"], input[data-password]'
    );
  };

  const isPasswordToggleButton = (button) => {
    if (!(button instanceof HTMLButtonElement)) return false;

    if (button.dataset.passwordToggle === "true") return true;

    const aria = normalize(button.getAttribute("aria-label"));
    if (
      aria.includes("password") &&
      (aria.includes("show") || aria.includes("hide"))
    ) {
      return true;
    }

    const label = getButtonLabel(button);
    if (TOGGLE_LABELS.has(label)) {
      const parent = button.parentElement;
      if (!parent) return false;
      return hasPasswordLikeInput(parent);
    }

    return false;
  };

  const patchButton = (button) => {
    if (!isPasswordToggleButton(button)) return;

    if (button.type !== "button") {
      button.type = "button";
    }

    button.classList.add("life-password-toggle");

    const parent = button.parentElement;
    if (parent instanceof HTMLElement) {
      const style = getComputedStyle(parent);
      if (style.position === "static") {
        parent.style.position = "relative";
      }
      const input = parent.querySelector("input");
      if (input instanceof HTMLInputElement && !input.dataset.passwordPaddingFixed) {
        input.style.paddingRight = "4.5rem";
        input.dataset.passwordPaddingFixed = "true";
      }
    }

    if (!button.getAttribute("aria-label")) {
      const label = getButtonLabel(button);
      if (label === "hide") {
        button.setAttribute("aria-label", "Hide password");
      } else {
        button.setAttribute("aria-label", "Show password");
      }
    }

    const labelNode = button.querySelector("span");
    if (labelNode && !labelNode.classList.contains("life-password-toggle-label")) {
      labelNode.classList.add("life-password-toggle-label");
    }
  };

  const patchAll = (root = document) => {
    const buttons =
      root instanceof Element
        ? root.querySelectorAll("button")
        : document.querySelectorAll("button");
    buttons.forEach(patchButton);
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.tagName === "BUTTON") {
          patchButton(node);
        } else {
          patchAll(node);
        }
      });
    }
  });

  const run = () => {
    patchAll(document);
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const button = target.closest("button");
        if (!(button instanceof HTMLButtonElement)) return;
        if (!isPasswordToggleButton(button)) return;
        if (button.type !== "button") {
          button.type = "button";
        }
      },
      true
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
