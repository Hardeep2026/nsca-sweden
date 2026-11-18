(() => {
  const nav = document.getElementById("primaryNav");
  const toggle = document.getElementById("navToggle");
  const form = document.getElementById("contactForm");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

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
})();
