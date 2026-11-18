/* NSCA Sweden – navigation that never changes the page URL.
   - href="#section-id" links scroll smoothly to the section (no #hash added).
   - data-page="name" links switch to <div class="page" data-page="name"> (no URL change).
   - href="#" placeholders do nothing. */
(function () {
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var pages = document.querySelectorAll('.page');

  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  function showPage(name) {
    var target = null;
    pages.forEach(function (p) { if (p.dataset.page === name) target = p; });
    if (!target) return false;
    pages.forEach(function (p) { p.hidden = p !== target; });
    return true;
  }

  if (burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';

    // Switch page (URL stays the same)
    if (a.dataset.page) {
      e.preventDefault();
      showPage(a.dataset.page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      closeMenu();
      return;
    }

    // In-page anchors and "#" placeholders (URL stays the same)
    if (href.charAt(0) === '#') {
      e.preventDefault();
      if (href.length > 1) {
        var target = document.querySelector(href);
        if (target) {
          var host = target.closest('.page');
          if (host && host.hidden) showPage(host.dataset.page);
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
      closeMenu();
    }
  });
})();
