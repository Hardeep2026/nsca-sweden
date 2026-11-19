(() => {
  const nav = document.getElementById("primaryNav");
  const toggle = document.getElementById("navToggle");
  const form = document.getElementById("contactForm");
  const dropdownItems = nav
    ? Array.from(nav.querySelectorAll(".nav-item.has-dropdown"))
    : [];

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

    nav.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileNav();
      });
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

  if (form) {
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
  }

  const missingForm = document.getElementById("missingForm");
  if (missingForm) {
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
  }

  const copyBtn = document.getElementById("copyPageLink");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const url = window.location.href;
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
  }
})();
