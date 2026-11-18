/* NSCA Sweden – navigation that never changes the page URL.
   - Links like href="#news" scroll smoothly to the section (no #hash added).
   - Links with data-page="name" switch to <main class="page" data-page="name"> (no URL change).
   - href="#" placeholders do nothing. */
(function () {
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var pages = document.querySelectorAll('.page');

  function closeMenu() {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  function showPage(name) {
    var found = false;
    pages.forEach(function (p) {
      var match = p.dataset.page === name;
      p.hidden = !match;
      if (match) found = true;
    });
    return found;
  }

  function currentPage() {
    for (var i = 0; i < pages.length; i++) if (!pages[i].hidden) return pages[i];
  }

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';

    // Switch to another page (URL stays the same)
    if (a.dataset.page) {
      e.preventDefault();
      if (showPage(a.dataset.page)) window.scrollTo({ top: 0 });
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
