/* Glossary hover previews.
   Every <a class="term"> on the site gets a small preview card on hover,
   with a "More" link through to the full entry. Definitions here are
   condensed from the full entries in notes.html; keep the two in step. */
(function () {
  'use strict';

  var G = {
    'flow-stress': {
      term: 'Flow stress',
      full: 'also written as the flow stress equation, or constitutive relation',
      tip: 'The stress a metal sustains while it is deforming plastically, as a function of strain, strain rate, and temperature. It is the material input that caps the accuracy of any crash or impact simulation.'
    },
    'shpb': {
      term: 'SHPB (Split Hopkinson Pressure Bar)',
      full: 'also called the Kolsky bar',
      tip: 'The standard laboratory technique for measuring material response at strain rates of roughly 10<sup>2</sup> to 10<sup>4</sup> s<sup>-1</sup>. A short specimen sits between two long elastic bars, and the strains recorded on the bars reconstruct the specimen history.'
    },
    'taylor-hopkinson': {
      term: 'Taylor-Hopkinson impact test',
      full: 'a Taylor cylinder experiment instrumented with a Hopkinson bar',
      tip: 'A cylinder is fired against a Hopkinson bar acting as the anvil, so the deformed shape and the force history come from one experiment. It reaches higher strain rates than a conventional SHPB, at the cost of a non-uniform deformation field.'
    },
    'strain-rate': {
      term: 'Strain rate regimes',
      full: 'quasi-static, intermediate, high, and very high strain rate',
      tip: 'How fast deformation accumulates, in s<sup>-1</sup>. Each technique covers its own band: testing machines about 10<sup>-4</sup> to 10<sup>0</sup> s<sup>-1</sup>, the Hopkinson bar roughly 10<sup>2</sup> to 10<sup>4</sup> s<sup>-1</sup>, plate impact beyond that.'
    },
    'dif': {
      term: 'DIF (Dynamic Increase Factor)',
      full: 'the strain rate sensitivity of strength, expressed as a ratio',
      tip: 'The dynamic strength at a given strain rate divided by the quasi-static strength of the same material. A compact way of reporting rate sensitivity, though the reference condition is not always stated consistently.'
    },
    'johnson-cook': {
      term: 'Johnson-Cook model',
      full: 'JC; the multiplicative strain, strain rate, and temperature flow stress equation',
      tip: 'The most widely used empirical flow stress equation in impact engineering, built into essentially every explicit finite element solver. It assumes strain hardening, strain rate, and thermal softening simply multiply together.'
    },
    'tedi-fs': {
      term: 'TEDI-FS',
      full: 'Tensor Decomposition and Interpolation for Flow Stress',
      tip: 'The framework developed in the constitutive modeling stream. Flow stress data over strain, strain rate, and temperature is arranged as an order-3 tensor, decomposed into non-negative factors, then reconstructed and extended by a neural network.'
    },
    'mape': {
      term: 'MAPE (Mean Absolute Percentage Error)',
      full: 'the standard accuracy metric in this flow stress work',
      tip: 'The average gap between predicted and measured values, each expressed as a percentage of the measurement. Preferred over an absolute metric because flow stress varies over a wide range across the test matrix.'
    },
    'cp-decomposition': {
      term: 'CP decomposition',
      full: 'CANDECOMP/PARAFAC; also called canonical polyadic decomposition',
      tip: 'Writing a multi-way array as a sum of a few simple components, each the outer product of one vector per dimension. For flow stress it expresses the whole three-dimensional dataset in terms of a few one-dimensional curves.'
    },
    'nncp': {
      term: 'NN-CP (Non-negative CP decomposition)',
      full: 'CP decomposition with all factor matrices constrained to be non-negative',
      tip: 'CP decomposition in which every factor must be non-negative, the three-way generalization of non-negative matrix factorization. Components can then only add and never cancel, so each is a physically admissible contribution.'
    },
    'svd': {
      term: 'SVD (Singular Value Decomposition)',
      full: 'the matrix counterpart of tensor decomposition',
      tip: 'Factorization of a matrix into orthogonal directions ordered by how much of the data each explains. It separates the dominant trend from noise and gives a principled way to decide how many components the data supports.'
    },
    'ann': {
      term: 'ANN (Artificial Neural Network)',
      full: 'used here as a surrogate model, not as a black-box replacement for mechanics',
      tip: 'A function approximator trained on data, used here in a deliberately narrow way: to interpolate a response surface that decomposition has already given structure, and to build fast surrogates for otherwise expensive simulations.'
    },
    'cnn-bilstm': {
      term: 'CNN-BiLSTM',
      full: 'convolutional layers followed by a bidirectional long short-term memory network',
      tip: 'The convolutional layers pick out local waveform features and the bidirectional recurrent layers relate them along the time axis. Used in the battery stream to classify damage states from acoustic emission recordings.'
    },
    'phm': {
      term: 'PHM (Prognostics and Health Management)',
      full: 'condition monitoring, diagnosis, and remaining-life prediction',
      tip: 'Inferring the internal condition of a system from measurable signals, diagnosing what has gone wrong, and estimating remaining life. For batteries the practical question is whether an impacted cell with no visible damage is still safe.'
    },
    'acoustic-emission': {
      term: 'Acoustic emission (AE)',
      full: 'passive listening to the elastic waves released by internal damage',
      tip: 'When a material cracks, delaminates, or slips internally it releases a transient elastic wave that a surface sensor can pick up. The measurement is passive, so it catches damage as it happens and reaches events external inspection cannot see.'
    },
    'soc': {
      term: 'SOC (State of Charge)',
      full: 'the remaining charge as a fraction of full capacity',
      tip: 'How full the cell is, from 0 to 100 percent. It matters mechanically as well as electrically: stored lithium changes electrode stiffness and stored stress, and a fuller cell has more energy to release if it fails.'
    },
    'isc': {
      term: 'Internal short circuit (ISC)',
      full: 'a direct electrical path formed inside the cell between the two electrodes',
      tip: 'Mechanical loading can tear the thin separator holding the electrodes apart, letting them touch. It is the usual mechanical trigger for thermal runaway, and it can develop minutes to hours after an impact that left no external mark.'
    },
    'thermal-runaway': {
      term: 'Thermal runaway',
      full: 'self-sustaining exothermic failure of a cell',
      tip: 'Above a threshold temperature the reactions inside a cell generate heat faster than the cell can shed it, so the temperature climbs on its own and ends in venting, fire, or rupture. Once started the process sustains itself.'
    },
    'multiphysics-fem': {
      term: 'Multiphysics FEM',
      full: 'finite element modeling with coupled mechanical, electrical, and thermal fields',
      tip: 'Several physical fields solved together, each feeding the others. For a battery under impact: deformation fails the separator, the failure sets up a short, the short generates heat, and the heat changes the material properties.'
    }
  };

  var SHOW_DELAY = 200;
  var HIDE_DELAY = 180;
  var GAP = 10;

  function keyFor(a) {
    var h = a.getAttribute('href') || '';
    if (h.indexOf('note_nncp.html') === 0) return 'nncp';
    var i = h.indexOf('#');
    return i >= 0 ? h.slice(i + 1) : null;
  }

  function init() {
    var terms = document.querySelectorAll('a.term');
    if (!terms.length) return;

    // Coarse pointers have no hover state; the link itself still works.
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

    var tt = document.createElement('div');
    tt.className = 'tt';
    tt.setAttribute('role', 'tooltip');
    tt.id = 'term-tip';
    tt.innerHTML =
      '<div class="tt-term"></div>' +
      '<div class="tt-full"></div>' +
      '<div class="tt-tip"></div>' +
      '<a class="tt-more" href="#">More <i class="fas fa-arrow-right"></i></a>';
    document.body.appendChild(tt);

    var elTerm = tt.querySelector('.tt-term');
    var elFull = tt.querySelector('.tt-full');
    var elTip = tt.querySelector('.tt-tip');
    var elMore = tt.querySelector('.tt-more');

    var showT = null, hideT = null, current = null;

    function place(a) {
      tt.style.visibility = 'hidden';
      tt.classList.add('on');
      tt.style.left = '0px';
      tt.style.top = '0px';

      var r = a.getBoundingClientRect();
      var w = tt.offsetWidth, h = tt.offsetHeight;
      var vw = document.documentElement.clientWidth;
      var vh = document.documentElement.clientHeight;

      var left = r.left + r.width / 2 - w / 2;
      if (left < 12) left = 12;
      if (left + w > vw - 12) left = vw - 12 - w;

      var top = r.bottom + GAP;
      var above = false;
      if (top + h > vh - 12 && r.top - GAP - h > 12) {
        top = r.top - GAP - h;
        above = true;
      }
      tt.classList.toggle('tt-above', above);

      // Point the arrow at the term even when the card is clamped to the edge.
      var ax = r.left + r.width / 2 - left;
      if (ax < 16) ax = 16;
      if (ax > w - 16) ax = w - 16;
      tt.style.setProperty('--arrow', ax + 'px');

      tt.style.left = (left + window.pageXOffset) + 'px';
      tt.style.top = (top + window.pageYOffset) + 'px';
      tt.style.visibility = '';
    }

    function show(a) {
      var k = keyFor(a), g = k && G[k];
      if (!g) return;
      current = a;
      elTerm.textContent = g.term;
      elFull.textContent = g.full;
      elTip.innerHTML = g.tip;
      elMore.setAttribute('href', a.getAttribute('href'));
      a.setAttribute('aria-describedby', 'term-tip');
      place(a);
    }

    function hide() {
      tt.classList.remove('on');
      if (current) current.removeAttribute('aria-describedby');
      current = null;
    }

    function queueShow(a) {
      clearTimeout(hideT);
      clearTimeout(showT);
      showT = setTimeout(function () { show(a); }, SHOW_DELAY);
    }

    function queueHide() {
      clearTimeout(showT);
      clearTimeout(hideT);
      hideT = setTimeout(hide, HIDE_DELAY);
    }

    for (var i = 0; i < terms.length; i++) {
      (function (a) {
        a.addEventListener('mouseenter', function () { queueShow(a); });
        a.addEventListener('mouseleave', queueHide);
        a.addEventListener('focus', function () { clearTimeout(hideT); show(a); });
        a.addEventListener('blur', queueHide);
      })(terms[i]);
    }

    // Keep the card open while the pointer is on it, so More stays clickable.
    tt.addEventListener('mouseenter', function () { clearTimeout(hideT); });
    tt.addEventListener('mouseleave', queueHide);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { clearTimeout(showT); hide(); }
    });
    window.addEventListener('scroll', function () {
      if (current) place(current);
    }, { passive: true });
    window.addEventListener('resize', function () {
      if (current) place(current);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
