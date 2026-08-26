// ─────────────────────────────────────────────────────────────────────────────
//  guides-data.mjs — long-form top-of-funnel guides (website /guides)
//
//  Cornerstone educational content: foundational Ayurveda that answers the
//  broad "what is…" / "how do I…" queries and links DOWN into the food pages,
//  dosha hubs and quiz. Plain general-wellness education (no per-food medical
//  claims), authored to be substantially original rather than a data dump.
//
//  Imported by BOTH scripts/build-guides.mjs (renders the pages) and
//  scripts/build-pose-pages.mjs (owns sitemap.xml, needs the slugs).
//
//  SHAPE
//  ─────
//    { slug, title, h1, kicker, description, updated, readingMins,
//      intro: [para…],
//      sections: [{ h2, body: [para…], links?: [{href,label}] }],
//      faqs: [{ q, a }],
//      related: [{ href, label }] }
//  A `para` is an HTML-safe string; the generator escapes nothing inside it,
//  so keep paras plain text with only the inline <a>/<em> the author intends.
// ─────────────────────────────────────────────────────────────────────────────

export const GUIDES = [
  {
    slug: 'what-is-your-dosha',
    title: 'What is your dosha? Vata, Pitta & Kapha explained | The Sanctuary',
    h1: 'What is your dosha?',
    kicker: 'Ayurveda basics',
    description: 'A plain-English guide to the three doshas — Vata, Pitta and Kapha — what they govern, how to recognise yours, and the difference between your constitution and a passing imbalance.',
    updated: '2026-08-26',
    readingMins: 6,
    intro: [
      'Ayurveda, the traditional system of health from India, describes everything in nature — including you — as a play of three functional energies called <em>doshas</em>: Vata, Pitta and Kapha. They are not substances you can point to but patterns of how things move, transform and hold together. Learning to read them is the whole practical art.',
      'Everyone is made of all three. What differs is the proportion, and that proportion is what people mean when they ask “what is my dosha?”',
    ],
    sections: [
      {
        h2: 'Vata — movement',
        body: [
          'Vata is the principle of movement: breath, circulation, the passage of thoughts, the impulse of a muscle. Its qualities are dry, light, cold, subtle and mobile. When Vata is balanced you feel energetic, creative and quick. When it is high you feel scattered, anxious, dry and restless, and sleep gets light and broken.',
          'Vata rises with cold, wind, travel, irregular routines and too little food or rest. It settles with warmth, oil, weight, routine and quiet.',
        ],
      },
      {
        h2: 'Pitta — transformation',
        body: [
          'Pitta is the principle of transformation: digestion, metabolism, body heat, and the mind’s ability to process and decide. Its qualities are hot, sharp, oily, light and slightly liquid. Balanced Pitta is focused, warm and capable. Aggravated Pitta runs hot — irritable, critical, inflamed, prone to acidity and skin heat.',
          'Pitta rises with heat, sun, skipped meals, and sour, salty, spicy or fried food. It settles with cooling, sweetness, and a slower pace.',
        ],
      },
      {
        h2: 'Kapha — structure',
        body: [
          'Kapha is the principle of structure and cohesion: the fluid, tissue and stability that hold the body together. Its qualities are heavy, cold, oily, smooth and stable. Balanced Kapha is calm, strong and steady. Excess Kapha feels heavy, sluggish, congested and reluctant to change.',
          'Kapha rises with heavy, sweet, cold, oily food and too little movement. It settles with lightness, warmth, stimulation and exercise.',
        ],
      },
      {
        h2: 'Prakriti vs vikriti — the difference that matters',
        body: [
          'Your <em>prakriti</em> is the constitution you were born with — your baseline proportion of the three doshas. It does not really change over a lifetime.',
          'Your <em>vikriti</em> is your current state — which dosha is running high <em>right now</em>, because of the season, your stress, or what you have been eating. This is the more useful thing to know day to day, because it tells you what to do today. A Kapha person can absolutely have a Vata flare in a cold, busy week — and in that week they should eat and live to calm Vata, not Kapha.',
        ],
        links: [
          { href: '/quiz', label: 'Find your dosha with the quiz' },
        ],
      },
      {
        h2: 'So what do you do with it?',
        body: [
          'The single most useful rule in Ayurveda is “like increases like, and opposites balance.” Whatever quality is in excess, you reduce by bringing in its opposite. Cold and dry Vata is met with warm, moist food. Hot Pitta is met with cool. Heavy Kapha is met with light. That one idea drives the whole of Ayurvedic eating.',
        ],
        links: [
          { href: '/foods/for-vata', label: 'Best foods for Vata' },
          { href: '/foods/for-pitta', label: 'Best foods for Pitta' },
          { href: '/foods/for-kapha', label: 'Best foods for Kapha' },
        ],
      },
    ],
    faqs: [
      { q: 'Can you have more than one dosha?', a: 'Yes — most people are a blend of two, with one leading. A roughly equal mix of all three is called tridoshic and is uncommon.' },
      { q: 'Can your dosha change?', a: 'Your constitution (prakriti) stays essentially fixed. What changes is your current state (vikriti) — which dosha is aggravated right now — and that is what you adjust for.' },
      { q: 'How do I know which dosha is high right now?', a: 'By its qualities: dry, anxious and restless is Vata; hot, sharp and irritable is Pitta; heavy, slow and congested is Kapha. The Sanctuary reads this from how you feel and tailors the day to it.' },
    ],
    related: [
      { href: '/guides/six-tastes-of-ayurveda', label: 'The six tastes and how they balance you' },
      { href: '/guides/how-to-eat-for-your-dosha', label: 'How to eat for your dosha' },
    ],
  },

  {
    slug: 'six-tastes-of-ayurveda',
    title: 'The six tastes of Ayurveda (rasa) and how they balance you | The Sanctuary',
    h1: 'The six tastes of Ayurveda',
    kicker: 'Ayurveda basics',
    description: 'Sweet, sour, salty, pungent, bitter and astringent — Ayurveda’s six tastes (rasa) each act on the doshas in a predictable way. A guide to what each taste does and how to use them to balance a meal.',
    updated: '2026-08-26',
    readingMins: 7,
    intro: [
      'Ayurveda reads food first through <em>taste</em> — <em>rasa</em>. Not as pleasure, but as information: each of the six tastes carries a set of qualities and moves the doshas in a knowable direction. A balanced meal in the classical sense is one that includes all six, weighted toward whichever taste your current state needs.',
      'There are six: sweet, sour, salty, pungent, bitter and astringent.',
    ],
    sections: [
      {
        h2: 'Sweet (madhura)',
        body: [
          'Sweet is building, cooling and grounding — think grains, milk, ripe fruit, root vegetables, not just sugar. It calms Vata and Pitta and increases Kapha. It is the most nourishing taste and the bulk of most balanced diets, but in excess it is the one that makes Kapha heavy.',
        ],
      },
      {
        h2: 'Sour (amla)',
        body: [
          'Sour — citrus, fermented foods, tamarind, yoghurt — is heating and stimulating. It kindles appetite and calms Vata, but aggravates Pitta and Kapha. A squeeze of lemon wakes up a dish; a lot of sour inflames a hot system.',
        ],
      },
      {
        h2: 'Salty (lavana)',
        body: [
          'Salty is heating, moistening and grounding. Like sour it settles Vata and raises Pitta and Kapha. A little makes food digestible and satisfying; a lot retains water and heats the blood.',
        ],
      },
      {
        h2: 'Pungent (katu)',
        body: [
          'Pungent — chilli, ginger, black pepper, mustard — is the hottest, lightest, most drying taste. It stokes digestion and clears congestion, so it reduces Kapha, but it strongly aggravates Pitta and, being dry and light, aggravates Vata too. It is the great Kapha medicine and the great Pitta trap.',
        ],
      },
      {
        h2: 'Bitter (tikta)',
        body: [
          'Bitter — leafy greens, turmeric, bitter gourd — is cooling, light and drying, and the most detoxifying taste. It reduces Pitta and Kapha and aggravates Vata. Almost no cuisine features it heavily, which is exactly why most diets are short of it.',
        ],
      },
      {
        h2: 'Astringent (kashaya)',
        body: [
          'Astringent — legumes, unripe banana, pomegranate, many raw vegetables — is cooling, drying and compacting; it is the puckering, mouth-drying quality. It reduces Pitta and Kapha and aggravates Vata. It tones and firms but, overdone, it is constipating and depleting for a dry Vata system.',
        ],
      },
      {
        h2: 'Putting it together',
        body: [
          'The pattern is easier than the list. Three tastes are cooling (sweet, bitter, astringent) and three are heating (sour, salty, pungent). Sweet, sour and salty build; pungent, bitter and astringent lighten and dry. To calm a hot Pitta system, lean on sweet, bitter and astringent. To lighten heavy Kapha, lean on pungent, bitter and astringent. To ground dry, anxious Vata, lean on sweet, sour and salty, and go easy on the drying three.',
        ],
        links: [
          { href: '/foods/', label: 'Browse foods by taste and potency' },
        ],
      },
    ],
    faqs: [
      { q: 'What are the six tastes in Ayurveda?', a: 'Sweet, sour, salty, pungent, bitter and astringent. Each moves the doshas in a set direction — three tastes are cooling and three are heating.' },
      { q: 'Which tastes reduce Pitta?', a: 'The three cooling tastes: sweet, bitter and astringent. Sour, salty and pungent all aggravate Pitta.' },
      { q: 'Which taste is best for weight and Kapha?', a: 'Pungent, bitter and astringent are the light, drying tastes that reduce Kapha; heavy sweet foods increase it.' },
    ],
    related: [
      { href: '/guides/what-is-your-dosha', label: 'What is your dosha?' },
      { href: '/guides/how-to-eat-for-your-dosha', label: 'How to eat for your dosha' },
    ],
  },

  {
    slug: 'how-to-eat-for-your-dosha',
    title: 'How to eat for your dosha: a practical Ayurvedic guide | The Sanctuary',
    h1: 'How to eat for your dosha',
    kicker: 'Practical Ayurveda',
    description: 'A practical guide to eating for your dosha — how to favour and ease off foods for Vata, Pitta and Kapha, why potency matters more than calories, and how to adjust for the season and your current state.',
    updated: '2026-08-26',
    readingMins: 6,
    intro: [
      'Eating for your dosha is not a list of forbidden foods. It is a direction: which qualities to bring more of, and which to ease off, so that whatever is in excess comes back toward the middle. Here is how to do it without turning every meal into a calculation.',
    ],
    sections: [
      {
        h2: 'Start from your current state, not a label',
        body: [
          'The mistake is to eat forever for the dosha a quiz gave you. Far more useful is to notice what is high <em>now</em>. Cold, dry, anxious, irregular? That is Vata, whatever your constitution. Hot, sharp, irritable, inflamed? Pitta. Heavy, slow, congested? Kapha. Eat to calm what is loud today.',
        ],
        links: [
          { href: '/guides/what-is-your-dosha', label: 'Prakriti vs vikriti, explained' },
        ],
      },
      {
        h2: 'To calm Vata',
        body: [
          'Favour warm, moist, grounding and lightly oily food: cooked grains, soups and stews, ghee, root vegetables, warm milk, stewed fruit, and the sweet, sour and salty tastes. Ease off raw salads, dried fruit, crackers, cold drinks and skipped meals. Regular timing matters as much as the food.',
        ],
        links: [{ href: '/foods/for-vata', label: 'Best foods for Vata →' }],
      },
      {
        h2: 'To cool Pitta',
        body: [
          'Favour cooling, sweet and mildly bitter or astringent food: sweet fruit, cucumber, leafy greens, coconut, milk, and plenty of water-rich vegetables. Ease off the sour, salty, spicy and fried, and do not skip meals — a hungry Pitta gets sharp. Eat in a calm setting, not at the desk.',
        ],
        links: [{ href: '/foods/for-pitta', label: 'Best foods for Pitta →' }],
      },
      {
        h2: 'To lighten Kapha',
        body: [
          'Favour light, warm, dry and pungent food: steamed vegetables, legumes, barley, ginger and warming spices, and the pungent, bitter and astringent tastes. Ease off the heavy, sweet, cold and oily — dairy, fried food, cold desserts. A lighter breakfast and the day’s main meal at midday suit Kapha well.',
        ],
        links: [{ href: '/foods/for-kapha', label: 'Best foods for Kapha →' }],
      },
      {
        h2: 'Potency beats calories',
        body: [
          'Ayurveda ranks a food less by its calories than by its <em>vīrya</em> — whether it heats or cools you — and its qualities: heavy or light, moist or dry. Two “healthy” foods can pull in opposite directions: a cooling cucumber and a heating chilli are both low-calorie and do completely different things to a hot system. This is why the same salad that suits summer Pitta can unsettle winter Vata.',
        ],
      },
      {
        h2: 'Let the season carry half the work',
        body: [
          'You do not have to micromanage. The seasons move the doshas in broad strokes — Kapha in spring, Pitta in summer, Vata in autumn — so eating with the season does much of the balancing for you. Warm, cooked food in the cold months; cooling, lighter food in the heat.',
        ],
      },
    ],
    faqs: [
      { q: 'Do I have to give up foods that aggravate my dosha?', a: 'No. Eating for your dosha is about proportion and direction — favouring some qualities and easing off others — not a list of banned foods. An occasional aggravating food is fine when the overall balance is right.' },
      { q: 'Should I eat for my constitution or my current state?', a: 'For your current state. Notice which dosha is high now — from how you feel and the season — and eat to calm that. Your birth constitution is the long-run baseline, not the daily instruction.' },
      { q: 'Why does Ayurveda care about hot vs cold foods?', a: 'Because a food’s heating or cooling potency (vīrya) is what shifts an imbalance. Bringing the opposite quality to whatever is in excess is the core mechanism of Ayurvedic eating.' },
    ],
    related: [
      { href: '/guides/what-is-your-dosha', label: 'What is your dosha?' },
      { href: '/guides/six-tastes-of-ayurveda', label: 'The six tastes of Ayurveda' },
    ],
  },
]
