// ─────────────────────────────────────────────────────────────────────────────
//  quiz.js — the mini dosha teaser (growth-plan §2.2, the funnel workhorse)
//
//  FIDELITY NOTE — this mirrors the app's real instrument rather than inventing
//  a quiz. src/data/doshaQuiz.js scores 5 trait dimensions per dosha:
//    3 × body (weight 1.5 — physical traits are the most stable prakriti
//    markers), 1 × mind, 1 × lifestyle (weight 1.0).
//  The app asks those as 15 agree/somewhat/disagree statements plus
//  tiebreakers. Here each dimension becomes ONE forced-choice question, so the
//  same five signals are captured in five taps — the right trade for a web
//  teaser. Weights are kept identical so the lean matches the app's.
//
//  It is deliberately LESS precise than the in-app assessment (no "somewhat"
//  gradations, no tiebreakers). The result says so and sends the user to the
//  app for the real thing — which is also the conversion mechanic.
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  var QUESTIONS = [
    {
      id: 'frame', weight: 1.5, prompt: 'Which best describes your natural build?',
      options: {
        vata:  'Naturally slim — I find it hard to gain weight',
        pitta: 'Medium and athletic — I put on muscle fairly easily',
        kapha: 'Solid and sturdy — my frame holds weight easily',
      },
    },
    {
      id: 'skin', weight: 1.5, prompt: 'How does your skin usually behave?',
      options: {
        vata:  'Tends to be dry, especially in winter',
        pitta: 'Flushes, reddens, or sunburns easily',
        kapha: 'Naturally smooth, thick, or slightly oily',
      },
    },
    {
      id: 'temperature', weight: 1.5, prompt: 'How do you handle temperature?',
      options: {
        vata:  'My hands and feet are often cold',
        pitta: 'I run warm — warmer than people around me',
        kapha: 'I tolerate cold well and rarely overheat',
      },
    },
    {
      id: 'stress', weight: 1.0, prompt: 'Under stress, you tend toward…',
      options: {
        vata:  'Worry or anxiety',
        pitta: 'Frustration or sharpness',
        kapha: 'Withdrawing or shutting down',
      },
    },
    {
      id: 'rhythm', weight: 1.0, prompt: 'Which sounds most like you?',
      options: {
        vata:  'My appetite is irregular — ravenous, then I forget to eat',
        pitta: 'Strong, punctual appetite — missing a meal makes me irritable',
        kapha: 'I fall asleep quickly and sleep deeply — hard to wake',
      },
    },
  ];

  // Taglines lifted verbatim from src/data/ayurveda/dosha-prakriti.js so the
  // web result and the app agree word-for-word.
  var DOSHAS = {
    vata: {
      label: 'Vata', devanagari: 'वात', elements: 'Air + Ether',
      tagline: 'Creative, quick, and adaptable. Thrives on routine and warmth.',
      practice: 'Grounding, warming, slower sequences — and a steady daily rhythm.',
    },
    pitta: {
      label: 'Pitta', devanagari: 'पित्त', elements: 'Fire + Water',
      tagline: 'Sharp, focused, and ambitious. Cools through ease and sweetness.',
      practice: 'Cooling, non-competitive practice — and permission to ease off.',
    },
    kapha: {
      label: 'Kapha', devanagari: 'कफ', elements: 'Earth + Water',
      tagline: 'Calm, steady, and enduring. Thrives on movement and lightness.',
      practice: 'Energising, warming, varied practice — momentum over comfort.',
    },
  };

  var DUAL_GAP_PCT = 5;   // matches doshaQuiz.js: <5pt gap reads as dual

  var answers = {};
  var index = 0;
  var el = {};

  function capture(event, props) {
    if (window.posthog) window.posthog.capture(event, props || {});
  }

  function score() {
    var totals = { vata: 0, pitta: 0, kapha: 0 };
    QUESTIONS.forEach(function (q) {
      var choice = answers[q.id];
      if (choice) totals[choice] += q.weight;
    });
    var sum = totals.vata + totals.pitta + totals.kapha || 1;
    var pct = {
      vata:  Math.round((totals.vata / sum) * 100),
      pitta: Math.round((totals.pitta / sum) * 100),
      kapha: Math.round((totals.kapha / sum) * 100),
    };
    var sorted = Object.keys(pct).sort(function (a, b) { return pct[b] - pct[a]; });
    return {
      pct: pct,
      primary: sorted[0],
      secondary: sorted[1],
      isDual: (pct[sorted[0]] - pct[sorted[1]]) < DUAL_GAP_PCT,
    };
  }

  function renderQuestion() {
    var q = QUESTIONS[index];
    var pctDone = Math.round((index / QUESTIONS.length) * 100);

    el.stage.innerHTML =
      '<p class="q-progress">Question ' + (index + 1) + ' of ' + QUESTIONS.length + '</p>' +
      '<div class="q-bar" role="progressbar" aria-valuenow="' + pctDone + '" ' +
        'aria-valuemin="0" aria-valuemax="100" aria-label="Quiz progress">' +
        '<span style="width:' + pctDone + '%"></span></div>' +
      '<h2 class="q-prompt" id="q-prompt" tabindex="-1">' + q.prompt + '</h2>' +
      '<div class="q-options" role="group" aria-labelledby="q-prompt"></div>' +
      (index > 0 ? '<button class="q-back" type="button">← Back</button>' : '');

    var wrap = el.stage.querySelector('.q-options');
    ['vata', 'pitta', 'kapha'].forEach(function (dosha) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'q-option';
      b.textContent = q.options[dosha];
      if (answers[q.id] === dosha) b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', function () { choose(q, dosha); });
      wrap.appendChild(b);
    });

    var back = el.stage.querySelector('.q-back');
    if (back) back.addEventListener('click', function () { index--; renderQuestion(); });

    // Move focus to the new question so screen-reader and keyboard users
    // aren't stranded at the top of the document after each answer.
    el.stage.querySelector('#q-prompt').focus();
  }

  function choose(q, dosha) {
    answers[q.id] = dosha;
    capture('quiz_question_answered', { question_id: q.id, choice: dosha, step: index + 1 });
    if (index < QUESTIONS.length - 1) { index++; renderQuestion(); }
    else renderResult();
  }

  function bar(dosha, pct, isTop) {
    return '<div class="r-row' + (isTop ? ' is-top' : '') + '">' +
      '<span class="r-name">' + DOSHAS[dosha].label + '</span>' +
      '<span class="r-track"><span class="r-fill" style="width:' + pct + '%"></span></span>' +
      '<span class="r-pct">' + pct + '%</span></div>';
  }

  function renderResult() {
    var r = score();
    var d = DOSHAS[r.primary];
    var headline = r.isDual
      ? 'You lean ' + d.label + '–' + DOSHAS[r.secondary].label
      : 'You lean ' + d.label;

    capture('quiz_completed', {
      primary: r.primary, secondary: r.secondary, is_dual: r.isDual,
      pct_vata: r.pct.vata, pct_pitta: r.pct.pitta, pct_kapha: r.pct.kapha,
    });

    el.stage.innerHTML =
      '<div class="result">' +
        '<p class="kicker">Your result</p>' +
        // Devanagari only on a single-dosha result — pairing one script with a
        // dual label ("Vata–Pitta वात") reads as a mistake.
        '<h2 class="r-headline" tabindex="-1">' + headline +
          (r.isDual ? '' : ' <span class="r-dev" lang="sa">' + d.devanagari + '</span>') +
        '</h2>' +
        (r.isDual ? '' : '<p class="r-elements">' + d.elements + '</p>') +
        '<p class="r-tagline">' + d.tagline + '</p>' +
        '<div class="r-bars">' +
          bar('vata',  r.pct.vata,  r.primary === 'vata') +
          bar('pitta', r.pct.pitta, r.primary === 'pitta') +
          bar('kapha', r.pct.kapha, r.primary === 'kapha') +
        '</div>' +
        (r.isDual
          ? '<p class="r-note">Your top two are close — that\'s common, and it usually means a dual constitution. The full assessment in the app includes tiebreaker questions to separate them.</p>'
          : '') +
        '<div class="r-cta">' +
          '<p class="r-practice"><strong>What this means for your practice:</strong> ' + d.practice + '</p>' +
          '<p class="r-body">The app builds on this: a full 15-question assessment, then a fresh daily practice composed for your dosha, your energy, and the time of day.</p>' +
          '<a class="play-badge" data-play-link data-placement="quiz_result" ' +
             'href="https://play.google.com/store/apps/details?id=com.sanctuary.app" ' +
             'aria-label="Get The Sanctuary on Google Play">' +
            '<img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" ' +
                 'alt="Get it on Google Play">' +
          '</a>' +
          '<p class="r-disclaimer">This short quiz is an introduction, not a diagnosis. It uses five of the fifteen markers in the full assessment, and Ayurvedic constitution is best confirmed with a qualified practitioner.</p>' +
          '<button class="q-back" type="button" id="q-restart">Retake the quiz</button>' +
        '</div>' +
      '</div>';

    // Newly-inserted badge needs the UTM → referrer chain applied (site.js).
    if (window.sanctuaryApplyAttribution) window.sanctuaryApplyAttribution(el.stage);

    el.stage.querySelector('.r-headline').focus();
    el.stage.querySelector('#q-restart').addEventListener('click', function () {
      answers = {}; index = 0;
      capture('quiz_restarted', {});
      renderQuestion();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    el.stage = document.getElementById('quiz-stage');
    var start = document.getElementById('quiz-start');
    if (!el.stage || !start) return;
    start.addEventListener('click', function () {
      // Always start clean. Without this, returning to the intro after a
      // completed run would resume at the last question instead of restarting.
      answers = {};
      index = 0;
      capture('quiz_started', {});
      document.getElementById('quiz-intro').hidden = true;
      el.stage.hidden = false;
      renderQuestion();
    });
  });
})();
