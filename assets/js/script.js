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

  /* ── Highlight active nav link based on current page ── */
  var current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links > li > a').forEach(function (a) {
    if (a.getAttribute('href') === current) {
      a.classList.add('active');
    }
  });

});
