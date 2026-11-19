(() => {
  // The address bar never changes, so remember which page is really showing.
  let currentUrl = window.location.href;

  const getNav = () => document.getElementById("primaryNav");
  const getToggle = () => document.getElementById("navToggle");

  /* ---------- Nav helpers ---------- */
  const closeAllDropdowns = () => {
    document.querySelectorAll("#primaryNav .nav-item.has-dropdown").forEach((item) => {
      item.classList.remove("is-open");
      const btn = item.querySelector(".nav-dropdown-toggle");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  };

  const closeMobileNav = () => {
    const nav = getNav();
    const toggle = getToggle();
    if (nav && toggle) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    closeAllDropdowns();
  };

  /* ---------- Scrolling (no #hash in the URL) ---------- */
  const scrollToId = (hash) => {
    if (!hash || hash.length < 2) return false;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth" });
    return true;
  };

  const normPath = (p) => p.replace(/\/$/, "/index.html");

  /* ---------- Load another page without changing the URL ---------- */
  const loadPage = async (url) => {
    try {
      const res = await fetch(url.href);
      if (!res.ok) throw new Error("Page not found");
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      if (!doc.body) throw new Error("No <body>");

      // Add any stylesheet the new page needs that isn't loaded yet
      doc.head.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
        const href = l.getAttribute("href");
        if (href && !document.head.querySelector('link[rel="stylesheet"][href="' + href + '"]')) {
          document.head.appendChild(l.cloneNode(true));
        }
      });

      // Swap the whole page (header, sections, footer); keep our own <script> tags
      const scripts = Array.from(document.body.querySelectorAll(":scope > script"));
      const incoming = Array.from(doc.body.children)
        .filter((n) => n.tagName !== "SCRIPT")
        .map((n) => document.importNode(n, true));

      document.body.className = doc.body.className;
      document.body.replaceChildren(...incoming, ...scripts);
      if (doc.title) document.title = doc.title;
      currentUrl = url.href;

      window.scrollTo(0, 0);
      if (url.hash) requestAnimationFrame(() => scrollToId(url.hash));
    } catch (error) {
      // Fallback: normal navigation (URL will change)
      window.location.href = url.href;
    }
  };

  /* ---------- Copy link (copies the real page URL) ---------- */
  const copyLink = async (btn) => {
    const original = btn.textContent;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const input = document.createElement("input");
        input.value = currentUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      btn.textContent = "Link copied ✓";
      btn.classList.add("is-copied");
    } catch (error) {
      btn.textContent = "Copy failed";
    }
    window.setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("is-copied");
    }, 1600);
  };

  /* ---------- One delegated click handler (survives page swaps) ---------- */
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    // Mobile menu button
    const toggleBtn = target.closest("#navToggle");
    if (toggleBtn) {
      const nav = getNav();
      if (nav) {
        const open = nav.classList.toggle("is-open");
        toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
        if (!open) closeAllDropdowns();
      }
      return;
    }

    // Dropdown button ("Find your place")
    const ddBtn = target.closest(".nav-dropdown-toggle");
    if (ddBtn) {
      event.preventDefault();
      const item = ddBtn.closest(".nav-item.has-dropdown");
      const willOpen = !item.classList.contains("is-open");
      closeAllDropdowns();
      if (willOpen) {
        item.classList.add("is-open");
        ddBtn.setAttribute("aria-expanded", "true");
      }
      return;
    }

    // Copy link button
    const copyBtn = target.closest("#copyPageLink");
    if (copyBtn) {
      copyLink(copyBtn);
      return;
    }

    // Click outside: close dropdowns / mobile menu
    if (!target.closest(".nav-item.has-dropdown")) closeAllDropdowns();
    const nav = getNav();
    if (nav && nav.classList.contains("is-open") && !target.closest(".nav-primary")) {
      closeMobileNav();
    }

    // Links
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const raw = link.getAttribute("href");
    if (/^(mailto:|tel:|javascript:)/i.test(raw)) return;

    // "#section" and "#" links: scroll only, never touch the URL
    if (raw.charAt(0) === "#") {
      event.preventDefault();
      scrollToId(raw);
      closeMobileNav();
      return;
    }

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;  // external links behave normally
    if (!/(\.html?|\/)$/i.test(url.pathname)) return;   // PDFs, images etc. behave normally

    event.preventDefault();
    if (normPath(url.pathname) === normPath(new URL(currentUrl).pathname)) {
      if (!scrollToId(url.hash)) window.scrollTo({ top: 0, behavior: "smooth" });
      closeMobileNav();
    } else {
      loadPage(url);
    }
  });

  /* ---------- Forms (delegated) ---------- */
  const submitMessages = {
    contactForm: "Message ready ✓",
    missingForm: "Thanks — noted ✓",
  };

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !submitMessages[form.id]) return;

    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;

    const original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = submitMessages[form.id];

    window.setTimeout(() => {
      button.disabled = false;
      button.innerHTML = original;
      form.reset();
    }, 1600);
  });

  /* ---------- Escape closes menus ---------- */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileNav();
  });
})();
