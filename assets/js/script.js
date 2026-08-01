document.addEventListener('DOMContentLoaded', function () {

  /* ── Mobile nav toggle ── */
  var toggle = document.querySelector('.nav-toggle');
  var links  = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.classList.toggle('open');
    });
  }

  /* ── Close mobile nav on link click ── */
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (links && links.classList.contains('open')) {
        links.classList.remove('open');
        if (toggle) toggle.classList.remove('open');
      }
    });
  });

  /* ── "More" dropdown: click and keyboard toggle (hover covers the pointer case) ── */
  document.querySelectorAll('.nav-more').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var li = btn.parentElement;
      var open = li.classList.toggle('dd-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  function closeDropdowns() {
    document.querySelectorAll('.nav-links > li.dd-open').forEach(function (li) {
      li.classList.remove('dd-open');
      var b = li.querySelector('.nav-more');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  document.addEventListener('click', closeDropdowns);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDropdowns();
  });

  /* ── Highlight active nav link based on current page ──
     Filenames with a space arrive percent-encoded in the path, so decode
     before comparing against the raw href. A match inside a dropdown also
     lights up its parent. */
  var current = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links > li').forEach(function (li) {
    var hit = false;
    li.querySelectorAll('a').forEach(function (a) {
      if (a.getAttribute('href') === current) { a.classList.add('active'); hit = true; }
    });
    if (hit) {
      var top = li.querySelector(':scope > a, :scope > .nav-more');
      if (top) top.classList.add('active');
    }
  });

  /* ── Activity photo lightbox ── */
  var lb     = document.getElementById('lb');
  var lbImg  = document.getElementById('lb-img');
  var lbClose = document.getElementById('lb-close');

  if (lb && lbImg) {
    document.querySelectorAll('.act-photo img').forEach(function (img) {
      img.addEventListener('click', function () {
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lb.classList.add('open');
      });
    });

    function closeLb() { lb.classList.remove('open'); lbImg.src = ''; }
    if (lbClose) lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  }

});
