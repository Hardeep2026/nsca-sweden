(() => {
  const nav = document.getElementById("primaryNav");
  const toggle = document.getElementById("navToggle");
  const dropdownItems = nav
    ? Array.from(nav.querySelectorAll(".nav-item.has-dropdown"))
    : [];

  // The address bar never changes, so remember which page is really showing.
  let currentUrl = window.location.href;

  /* ---------- Nav (bound once, header stays on screen) ---------- */
  const closeAllDropdowns = () => {
    dropdownItems.forEach((item) => {
      item.classList.remove("is-open");
      const btn = item.querySelector(".nav-dropdown-toggle");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  };

  const closeMobileNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    closeAllDropdowns();
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) closeAllDropdowns();
    });
  }

  dropdownItems.forEach((item) => {
    const btn = item.querySelector(".nav-dropdown-toggle");
    if (!btn) return;

    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = !item.classList.contains("is-open");
      closeAllDropdowns();
      if (willOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!nav) return;
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (!target.closest(".nav-item.has-dropdown")) {
      closeAllDropdowns();
    }

    if (nav.classList.contains("is-open") && !target.closest(".nav-primary")) {
      closeMobileNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllDropdowns();
      closeMobileNav();
    }
  });

  /* ---------- Navigation without changing the URL ---------- */
  const scrollToHash = (hash) => {
    if (hash && hash.length > 1) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadPage = async (url) => {
    const main = document.querySelector("main");
    try {
      const res = await fetch(url.href);
      if (!res.ok) throw new Error("Page not found");
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      const newMain = doc.querySelector("main");
      if (!main || !newMain) throw new Error("No <main> to swap");

      main.innerHTML = newMain.innerHTML;
      if (doc.title) document.title = doc.title;
      currentUrl = url.href;

      initPage();
      closeMobileNav();
      if (url.hash) scrollToHash(url.hash);
      else window.scrollTo({ top: 0 });
    } catch (error) {
      // Fallback: normal navigation (URL will change)
      window.location.href = url.href;
    }
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target;
    const link = target instanceof Element ? target.closest("a[href]") : null;
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const raw = link.getAttribute("href");
    if (/^(mailto:|tel:|javascript:)/i.test(raw)) return;

    // In-page anchors and "#" placeholders: scroll only, no #hash in the URL
    if (raw.charAt(0) === "#") {
      event.preventDefault();
      scrollToHash(raw);
      closeMobileNav();
      return;
    }

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return; // external links behave normally
    if (!/(\.html?|\/)$/i.test(url.pathname)) return;  // PDFs, images etc. behave normally

    event.preventDefault();
    const samePage = url.pathname === new URL(currentUrl).pathname;
    if (samePage) {
      scrollToHash(url.hash);
      closeMobileNav();
    } else {
      loadPage(url);
    }
  });

  /* ---------- Page content (re-run after every page swap) ---------- */
  const once = (el, fn) => {
    if (!el || el.dataset.bound) return;
    el.dataset.bound = "1";
    fn(el);
  };

  const initPage = () => {
    once(document.getElementById("contactForm"), (form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        if (!button) return;

        const original = button.innerHTML;
        button.disabled = true;
        button.innerHTML = "Message ready ✓";

        window.setTimeout(() => {
          button.disabled = false;
          button.innerHTML = original;
          form.reset();
        }, 1600);
      });
    });

    once(document.getElementById("missingForm"), (missingForm) => {
      missingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const button = missingForm.querySelector('button[type="submit"]');
        if (!button) return;

        const original = button.textContent;
        button.disabled = true;
        button.textContent = "Thanks — noted ✓";

        window.setTimeout(() => {
          button.disabled = false;
          button.textContent = original;
          missingForm.reset();
        }, 1600);
      });
    });

    once(document.getElementById("copyPageLink"), (copyBtn) => {
      copyBtn.addEventListener("click", async () => {
        const url = currentUrl; // the real page, even though the address bar doesn't change
        const original = copyBtn.textContent;

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
          } else {
            const input = document.createElement("input");
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            input.remove();
          }
          copyBtn.textContent = "Link copied ✓";
          copyBtn.classList.add("is-copied");
        } catch (error) {
          copyBtn.textContent = "Copy failed";
        }

        window.setTimeout(() => {
          copyBtn.textContent = original;
          copyBtn.classList.remove("is-copied");
        }, 1600);
      });
    });
  };

  initPage();
})();
