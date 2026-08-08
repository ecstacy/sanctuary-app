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
//
//  LOCALISATION — all copy lives in I18N, keyed off <html lang> (en/de/hi), so
//  /quiz, /de/quiz and /hi/quiz share this one script. de/hi strings are
//  machine-drafted; flag for a native pass before campaigns (Hindi review task).
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  var I18N = {
    en: {
      questions: [
        { id: 'frame', weight: 1.5, prompt: 'Which best describes your natural build?', options: {
          vata: 'Naturally slim — I find it hard to gain weight',
          pitta: 'Medium and athletic — I put on muscle fairly easily',
          kapha: 'Solid and sturdy — my frame holds weight easily' } },
        { id: 'skin', weight: 1.5, prompt: 'How does your skin usually behave?', options: {
          vata: 'Tends to be dry, especially in winter',
          pitta: 'Flushes, reddens, or sunburns easily',
          kapha: 'Naturally smooth, thick, or slightly oily' } },
        { id: 'temperature', weight: 1.5, prompt: 'How do you handle temperature?', options: {
          vata: 'My hands and feet are often cold',
          pitta: 'I run warm — warmer than people around me',
          kapha: 'I tolerate cold well and rarely overheat' } },
        { id: 'stress', weight: 1.0, prompt: 'Under stress, you tend toward…', options: {
          vata: 'Worry or anxiety',
          pitta: 'Frustration or sharpness',
          kapha: 'Withdrawing or shutting down' } },
        { id: 'rhythm', weight: 1.0, prompt: 'Which sounds most like you?', options: {
          vata: 'My appetite is irregular — ravenous, then I forget to eat',
          pitta: 'Strong, punctual appetite — missing a meal makes me irritable',
          kapha: 'I fall asleep quickly and sleep deeply — hard to wake' } },
      ],
      doshas: {
        vata:  { label: 'Vata',  elements: 'Air + Ether',   tagline: 'Creative, quick, and adaptable. Thrives on routine and warmth.',   practice: 'Grounding, warming, slower sequences — and a steady daily rhythm.' },
        pitta: { label: 'Pitta', elements: 'Fire + Water',  tagline: 'Sharp, focused, and ambitious. Cools through ease and sweetness.',  practice: 'Cooling, non-competitive practice — and permission to ease off.' },
        kapha: { label: 'Kapha', elements: 'Earth + Water', tagline: 'Calm, steady, and enduring. Thrives on movement and lightness.',    practice: 'Energising, warming, varied practice — momentum over comfort.' },
      },
      ui: {
        progress: function (i, n) { return 'Question ' + i + ' of ' + n; },
        progressAria: 'Quiz progress', back: '← Back', result: 'Your result',
        headline: function (p, s) { return s ? 'You lean ' + p + '–' + s : 'You lean ' + p; },
        dualNote: 'Your top two are close — that\'s common, and it usually means a dual constitution. The full assessment in the app includes tiebreaker questions to separate them.',
        practiceLabel: 'What this means for your practice:',
        appBody: 'The app builds on this: a full 15-question assessment, then a fresh daily practice composed for your dosha, your energy, and the time of day.',
        badgeAria: 'Get The Sanctuary on Google Play',
        disclaimer: 'This short quiz is an introduction, not a diagnosis. It uses five of the fifteen markers in the full assessment, and Ayurvedic constitution is best confirmed with a qualified practitioner.',
        retake: 'Retake the quiz',
      },
    },

    de: {
      questions: [
        { id: 'frame', weight: 1.5, prompt: 'Was beschreibt deinen natürlichen Körperbau am besten?', options: {
          vata: 'Von Natur aus schlank — ich nehme schwer zu',
          pitta: 'Mittel und athletisch — ich baue recht leicht Muskeln auf',
          kapha: 'Kräftig und stabil — mein Körper hält Gewicht leicht' } },
        { id: 'skin', weight: 1.5, prompt: 'Wie verhält sich deine Haut normalerweise?', options: {
          vata: 'Neigt zu Trockenheit, besonders im Winter',
          pitta: 'Errötet, rötet sich oder bekommt leicht Sonnenbrand',
          kapha: 'Von Natur aus glatt, dick oder leicht ölig' } },
        { id: 'temperature', weight: 1.5, prompt: 'Wie gehst du mit Temperatur um?', options: {
          vata: 'Meine Hände und Füße sind oft kalt',
          pitta: 'Mir ist schnell warm — wärmer als anderen um mich herum',
          kapha: 'Ich vertrage Kälte gut und überhitze selten' } },
        { id: 'stress', weight: 1.0, prompt: 'Unter Stress neigst du zu…', options: {
          vata: 'Sorge oder Angst',
          pitta: 'Frust oder Schärfe',
          kapha: 'Rückzug oder Erstarren' } },
        { id: 'rhythm', weight: 1.0, prompt: 'Was klingt am ehesten nach dir?', options: {
          vata: 'Mein Appetit ist unregelmäßig — heißhungrig, dann vergesse ich zu essen',
          pitta: 'Starker, pünktlicher Appetit — eine ausgelassene Mahlzeit macht mich gereizt',
          kapha: 'Ich schlafe schnell ein und tief — schwer zu wecken' } },
      ],
      doshas: {
        vata:  { label: 'Vata',  elements: 'Luft + Äther',   tagline: 'Kreativ, schnell und anpassungsfähig. Gedeiht mit Routine und Wärme.',        practice: 'Erdende, wärmende, langsamere Abfolgen — und ein steter Tagesrhythmus.' },
        pitta: { label: 'Pitta', elements: 'Feuer + Wasser', tagline: 'Scharf, fokussiert und ehrgeizig. Kühlt durch Leichtigkeit und Süße.',        practice: 'Kühlende, nicht-kompetitive Praxis — und die Erlaubnis, es ruhiger anzugehen.' },
        kapha: { label: 'Kapha', elements: 'Erde + Wasser',  tagline: 'Ruhig, beständig und ausdauernd. Gedeiht mit Bewegung und Leichtigkeit.',      practice: 'Belebende, wärmende, abwechslungsreiche Praxis — Schwung vor Bequemlichkeit.' },
      },
      ui: {
        progress: function (i, n) { return 'Frage ' + i + ' von ' + n; },
        progressAria: 'Quiz-Fortschritt', back: '← Zurück', result: 'Dein Ergebnis',
        headline: function (p, s) { return s ? 'Du tendierst zu ' + p + '–' + s : 'Du tendierst zu ' + p; },
        dualNote: 'Deine beiden stärksten Doshas liegen nah beieinander — das ist häufig und deutet meist auf eine duale Konstitution hin. Die vollständige Bewertung in der App enthält Stichfragen, um sie zu trennen.',
        practiceLabel: 'Was das für deine Praxis bedeutet:',
        appBody: 'Die App baut darauf auf: eine vollständige Bewertung mit 15 Fragen und dann eine frische tägliche Praxis, komponiert für dein Dosha, deine Energie und die Tageszeit.',
        badgeAria: 'The Sanctuary bei Google Play holen',
        disclaimer: 'Dieses kurze Quiz ist eine Einführung, keine Diagnose. Es nutzt fünf der fünfzehn Marker der vollständigen Bewertung; die ayurvedische Konstitution wird am besten von einer qualifizierten Fachperson bestätigt.',
        retake: 'Quiz wiederholen',
      },
    },

    hi: {
      questions: [
        { id: 'frame', weight: 1.5, prompt: 'आपकी स्वाभाविक काया को सबसे अच्छा क्या बताता है?', options: {
          vata: 'स्वाभाविक रूप से दुबला — मुझे वज़न बढ़ाना कठिन लगता है',
          pitta: 'मध्यम और सुगठित — मुझ पर मांसपेशियाँ आसानी से बनती हैं',
          kapha: 'ठोस और मज़बूत — मेरी काया आसानी से वज़न रखती है' } },
        { id: 'skin', weight: 1.5, prompt: 'आपकी त्वचा आमतौर पर कैसी रहती है?', options: {
          vata: 'रूखी रहती है, खासकर सर्दियों में',
          pitta: 'जल्दी लाल हो जाती है या धूप से जल जाती है',
          kapha: 'स्वाभाविक रूप से चिकनी, मोटी या थोड़ी तैलीय' } },
        { id: 'temperature', weight: 1.5, prompt: 'आप तापमान को कैसे सहते हैं?', options: {
          vata: 'मेरे हाथ-पैर अक्सर ठंडे रहते हैं',
          pitta: 'मुझे जल्दी गर्मी लगती है — आस-पास के लोगों से ज़्यादा',
          kapha: 'मैं ठंड अच्छे से सहता हूँ और शायद ही कभी ज़्यादा गर्म होता हूँ' } },
        { id: 'stress', weight: 1.0, prompt: 'तनाव में आप किस ओर झुकते हैं?', options: {
          vata: 'चिंता या घबराहट',
          pitta: 'झुंझलाहट या तीखापन',
          kapha: 'पीछे हटना या चुप हो जाना' } },
        { id: 'rhythm', weight: 1.0, prompt: 'इनमें से क्या आप जैसा लगता है?', options: {
          vata: 'मेरी भूख अनियमित है — कभी बहुत ज़्यादा, फिर खाना भूल जाता हूँ',
          pitta: 'तेज़, समय पर भूख — भोजन छूटने पर चिड़चिड़ापन',
          kapha: 'मैं जल्दी और गहरी नींद सोता हूँ — जगाना मुश्किल' } },
      ],
      doshas: {
        vata:  { label: 'वात',  elements: 'वायु + आकाश',  tagline: 'सृजनशील, तेज़ और अनुकूलनशील। नियम और गर्माहट में फलता-फूलता है।', practice: 'स्थिरता देने वाली, गर्म, धीमी श्रृंखलाएँ — और एक स्थिर दैनिक लय।' },
        pitta: { label: 'पित्त', elements: 'अग्नि + जल',   tagline: 'तीक्ष्ण, केंद्रित और महत्वाकांक्षी। सहजता और मधुरता से शांत होता है।', practice: 'शीतल, प्रतिस्पर्धा-रहित साधना — और थोड़ा ढील देने की अनुमति।' },
        kapha: { label: 'कफ',   elements: 'पृथ्वी + जल',  tagline: 'शांत, स्थिर और सहनशील। गति और हल्केपन में फलता-फूलता है।',       practice: 'स्फूर्तिदायक, गर्म, विविध साधना — आराम से पहले गति।' },
      },
      ui: {
        progress: function (i, n) { return 'प्रश्न ' + i + ' / ' + n; },
        progressAria: 'क्विज़ प्रगति', back: '← पीछे', result: 'आपका परिणाम',
        headline: function (p, s) { return s ? p + '–' + s + ' झुकाव' : 'आपकी प्रकृति ' + p; },
        dualNote: 'आपके शीर्ष दो दोष करीब हैं — यह सामान्य है और आमतौर पर द्वि-प्रकृति दर्शाता है। ऐप का पूर्ण आकलन उन्हें अलग करने के लिए निर्णायक प्रश्न शामिल करता है।',
        practiceLabel: 'आपकी साधना के लिए इसका अर्थ:',
        appBody: 'ऐप इसी पर आगे बढ़ता है: 15 प्रश्नों का पूर्ण आकलन, फिर आपके दोष, ऊर्जा और समय के लिए रची गई एक नई दैनिक साधना।',
        badgeAria: 'The Sanctuary को Google Play पर पाएँ',
        disclaimer: 'यह संक्षिप्त क्विज़ एक परिचय है, निदान नहीं। यह पूर्ण आकलन के पंद्रह में से पाँच संकेतकों का उपयोग करता है; आयुर्वेदिक प्रकृति की पुष्टि किसी योग्य वैद्य से करना सर्वोत्तम है।',
        retake: 'क्विज़ फिर से लें',
      },
    },
  };

  // Devanagari script names for the single-dosha result flourish. On the Hindi
  // page the labels are already Devanagari, so the extra flourish is skipped.
  var DEVANAGARI = { vata: 'वात', pitta: 'पित्त', kapha: 'कफ' };

  var LANG = (document.documentElement.lang || 'en').slice(0, 2);
  var T = I18N[LANG] || I18N.en;
  var QUESTIONS = T.questions;
  var DOSHAS = T.doshas;
  var U = T.ui;
  var showDev = LANG !== 'hi';

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
      '<p class="q-progress">' + U.progress(index + 1, QUESTIONS.length) + '</p>' +
      '<div class="q-bar" role="progressbar" aria-valuenow="' + pctDone + '" ' +
        'aria-valuemin="0" aria-valuemax="100" aria-label="' + U.progressAria + '">' +
        '<span style="width:' + pctDone + '%"></span></div>' +
      '<h2 class="q-prompt" id="q-prompt" tabindex="-1">' + q.prompt + '</h2>' +
      '<div class="q-options" role="group" aria-labelledby="q-prompt"></div>' +
      (index > 0 ? '<button class="q-back" type="button">' + U.back + '</button>' : '');

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
      '<span class="r-track"><span class="r-fill r-fill--' + dosha + '" style="width:' + pct + '%"></span></span>' +
      '<span class="r-pct">' + pct + '%</span></div>';
  }

  function renderResult() {
    var r = score();
    var d = DOSHAS[r.primary];
    var headline = U.headline(d.label, r.isDual ? DOSHAS[r.secondary].label : null);

    capture('quiz_completed', {
      primary: r.primary, secondary: r.secondary, is_dual: r.isDual,
      pct_vata: r.pct.vata, pct_pitta: r.pct.pitta, pct_kapha: r.pct.kapha,
    });

    el.stage.innerHTML =
      '<div class="result">' +
        '<p class="kicker">' + U.result + '</p>' +
        // Devanagari flourish only on a single-dosha result, and only when the
        // labels aren't already Devanagari (i.e. not the Hindi page).
        '<h2 class="r-headline" tabindex="-1">' + headline +
          (!r.isDual && showDev ? ' <span class="r-dev" lang="sa">' + DEVANAGARI[r.primary] + '</span>' : '') +
        '</h2>' +
        (r.isDual ? '' : '<p class="r-elements">' + d.elements + '</p>') +
        '<p class="r-tagline">' + d.tagline + '</p>' +
        '<div class="r-bars">' +
          bar('vata',  r.pct.vata,  r.primary === 'vata') +
          bar('pitta', r.pct.pitta, r.primary === 'pitta') +
          bar('kapha', r.pct.kapha, r.primary === 'kapha') +
        '</div>' +
        (r.isDual ? '<p class="r-note">' + U.dualNote + '</p>' : '') +
        '<div class="r-cta">' +
          '<p class="r-practice"><strong>' + U.practiceLabel + '</strong> ' + d.practice + '</p>' +
          '<p class="r-body">' + U.appBody + '</p>' +
          '<a class="play-badge" data-play-link data-placement="quiz_result" ' +
             'href="https://play.google.com/store/apps/details?id=com.sanctuary.app" ' +
             'aria-label="' + U.badgeAria + '">' +
            '<img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" ' +
                 'alt="' + U.badgeAria + '">' +
          '</a>' +
          '<p class="r-disclaimer">' + U.disclaimer + '</p>' +
          '<button class="q-back" type="button" id="q-restart">' + U.retake + '</button>' +
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
