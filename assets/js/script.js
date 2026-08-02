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

  /* ── Image lightbox ──
     Covers activity photos and the technical figures, which are printed small
     inside their columns and are unreadable at that size. The overlay is built
     here instead of being repeated in the markup of every page. */
  var zoomable = document.querySelectorAll(
    '.act-photo img, .pb-figure img, .fp-fig img, img.zoomable'
  );

  if (zoomable.length) {
    var lb = document.createElement('div');
    lb.className = 'lb-overlay';
    lb.innerHTML =
      '<span class="lb-close" aria-label="Close">&times;</span>' +
      '<img alt="">' +
      '<div class="lb-cap"></div>';
    document.body.appendChild(lb);

    var lbImg   = lb.querySelector('img');
    var lbCap   = lb.querySelector('.lb-cap');
    var lbClose = lb.querySelector('.lb-close');

    function closeLb() {
      lb.classList.remove('open');
      lbImg.src = '';
      document.body.style.overflow = '';
    }

    zoomable.forEach(function (img) {
      img.classList.add('zoom-in');
      img.title = 'Click to enlarge';

      /* Technical figures are shown at column width, small enough that nothing
         signals they can be opened; the photo galleries already read as photos. */
      var wrap = img.closest('.pb-figure, .fp-fig');
      if (wrap && !wrap.querySelector('.fig-zoom')) {
        var hint = document.createElement('div');
        hint.className = 'fig-zoom';
        hint.innerHTML = '<i class="fas fa-search-plus"></i> Click to enlarge';
        wrap.appendChild(hint);
      }

      img.addEventListener('click', function () {
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        /* The caption is a sibling of the image inside its figure wrapper. */
        var cap = img.parentElement.querySelector('figcaption, .fig-cap');
        lbCap.textContent = cap ? cap.textContent.trim() : (img.alt || '');
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  }

  /* ---------- BibTeX viewer on the publications page ---------- */
  var bibBtns = document.querySelectorAll('.bib-btn');
  if (bibBtns.length) {
    var BIB_URL = 'assets/bib/publications.bib';

    var bx = document.createElement('div');
    bx.className = 'bib-overlay';
    bx.innerHTML =
      '<div class="bib-box">' +
        '<div class="bib-hdr"><span>BibTeX</span><span class="bib-close" aria-label="Close">&times;</span></div>' +
        '<pre class="bib-pre"></pre>' +
        '<div class="bib-actions">' +
          '<button type="button" class="btn btn-primary bib-copy"><i class="fas fa-copy"></i> Copy</button>' +
          '<a class="btn btn-outline" href="' + BIB_URL + '" download><i class="fas fa-download"></i> All entries</a>' +
          '<span class="bib-note"></span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bx);

    var bibPre = bx.querySelector('.bib-pre');
    var bibNote = bx.querySelector('.bib-note');
    var bibCopy = bx.querySelector('.bib-copy');
    var bibEntries = null;

    function closeBib() {
      bx.classList.remove('open');
      document.body.style.overflow = '';
    }

    /* One entry runs from its @type line to the closing brace in column one. */
    function splitBib(text) {
      var map = {};
      var re = /@\w+\{([^,]+),[\s\S]*?\n\}/g;
      var m;
      while ((m = re.exec(text)) !== null) {
        map[m[1].trim()] = m[0];
      }
      return map;
    }

    function showBib(key) {
      var entry = bibEntries && bibEntries[key];
      bibPre.textContent = entry || 'Entry not found. Please use the full .bib file.';
      bibNote.textContent = '';
      bx.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    bibBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-bibkey');
        if (bibEntries) { showBib(key); return; }
        fetch(BIB_URL)
          .then(function (r) { return r.text(); })
          .then(function (t) { bibEntries = splitBib(t); showBib(key); })
          .catch(function () { window.open(BIB_URL, '_blank'); });
      });
    });

    bibCopy.addEventListener('click', function () {
      var txt = bibPre.textContent;
      function done() { bibNote.textContent = 'Copied to clipboard'; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = txt;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); }
        catch (e) { bibNote.textContent = 'Press Ctrl+C to copy'; }
        document.body.removeChild(ta);
      }
    });

    bx.querySelector('.bib-close').addEventListener('click', closeBib);
    bx.addEventListener('click', function (e) { if (e.target === bx) closeBib(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeBib(); });
  }

});
