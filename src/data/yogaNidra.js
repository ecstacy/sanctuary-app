// ─────────────────────────────────────────────────────────────────────────────
//  yogaNidra.js — a guided Yoga Nidra session, as timed stages.
//
//  Yoga Nidra ("yogic sleep") is a classical guided relaxation, not a posture —
//  which is why it has no asana page. This is the practice itself: the standard
//  arc (settle → breath → rotation of consciousness through the body →
//  stillness → gentle return), broken into timed stages the guided page steps
//  through. Public, well-established practice content — no invented claims.
//
//  Durations are in seconds; the total is ~13 min, a common Nidra length. The
//  page can be given a shorter target and it scales the stages proportionally.
// ─────────────────────────────────────────────────────────────────────────────

export const YOGA_NIDRA = {
  id: 'yogaNidra',
  name: 'Yoga Nidra',
  sanskrit: 'Yogic Sleep',
  totalSeconds: 13 * 60,
  stages: [
    {
      key: 'settle',
      title: 'Settle',
      seconds: 120,
      cues: [
        'Lie down on your back, arms a little away from the body, palms up.',
        'Let the whole body be heavy and still — no need to move from here.',
        'Close your eyes. Take one slow breath in, and a long breath out.',
      ],
    },
    {
      key: 'intention',
      title: 'Intention',
      seconds: 60,
      cues: [
        'Bring to mind one short, positive intention — a sankalpa.',
        'Something already true, phrased simply: “I am calm and at ease.”',
        'Repeat it silently three times, then let it go.',
      ],
    },
    {
      key: 'breath',
      title: 'Breath awareness',
      seconds: 150,
      cues: [
        'Let the breath be completely natural — no effort to change it.',
        'Simply feel each breath as it comes and goes.',
        'Silently count each breath backwards from 27… 26… 25…',
        'If you lose count, gently begin again. There is nowhere to be.',
      ],
    },
    {
      key: 'rotation',
      title: 'Rotation of consciousness',
      seconds: 300,
      cues: [
        'Move your awareness through the body — just resting attention, not moving.',
        'Right hand… thumb, fingers, palm, wrist, arm, shoulder.',
        'Left hand… thumb, fingers, palm, wrist, arm, shoulder.',
        'Right leg… then left leg, from toes to hip.',
        'The back… the front… the whole head. The whole body at once, heavy and still.',
      ],
    },
    {
      key: 'stillness',
      title: 'Stillness',
      seconds: 120,
      cues: [
        'Rest in the quiet space between waking and sleep.',
        'Nothing to do, nothing to hold. Simply be aware, and at ease.',
      ],
    },
    {
      key: 'return',
      title: 'Return',
      seconds: 90,
      cues: [
        'Gently become aware of the breath again, and of the body lying here.',
        'Recall your intention once more, silently.',
        'Begin to deepen the breath. Small movements — fingers, toes.',
        'When you are ready, roll to one side, and slowly sit up.',
      ],
    },
  ],
}
