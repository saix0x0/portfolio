// ─────────────────────────────────────────────────────────────────────────────
//  NOTES TO SELF → the notebook on the Penthouse desk (/hotel/, floor PH).
//  The Penthouse is the owner's floor, so this is written in your voice.
//  These are STARTER notes: jokes and pop-culture nods, not facts about you.
//  Rewrite, delete and add freely. Anything truly private belongs in the
//  encrypted Vault (/vault/), never here: this file is public.
//
//  sticky colours: yellow | pink | mint | blue | lilac | orange
// ─────────────────────────────────────────────────────────────────────────────

export const notebook = {
  title: 'Notes to self',
  tabs: [
    {
      id: 'pinned',
      label: 'Pinned',
      notes: [
        { color: 'yellow', title: 'Rule #1', text: 'Don’t panic. Carry a towel. Ship anyway.', tilt: -2 },
        { color: 'pink', title: 'Reminder', text: 'Do, or do not. There is no “I’ll refactor it later”.', tilt: 1.5 },
        { color: 'mint', title: 'Lights out', text: 'Start before you feel ready. Nobody waits on the grid.', tilt: -1 },
        { color: 'blue', title: '42', text: 'Found the answer. Still working on the question.', tilt: 2 },
        { color: 'lilac', title: 'On deadlines', text: 'Time is a flat circle. The submission portal is not.', tilt: -1.5 },
        { color: 'orange', title: 'Box, box', text: 'When the lap times drop off, pit. Sleep is a tyre change.', tilt: 1 },
      ],
    },
    {
      id: 'ideas',
      label: 'Idea jar',
      intro: 'Shake the jar. Some of these are good. Some are 3 a.m. ideas.',
      jar: [
        'A hotel where every floor is a different part of me. …wait.',
        'Elevator music, but it’s lo-fi remixes of compiler errors.',
        'An agent that reads my reading list and tells me which book I’m avoiding.',
        'Make the basement scarier. Or at least darker.',
        'A door code nobody guesses unless they love number theory.',
        'Teach the library cat to review pull requests.',
        'A map of every sunset I’ve ever stopped for.',
        'A “60-second version” of every long thing I write.',
        'Rubber duck debugging, but the duck talks back. Politely.',
        'A playlist that changes with the weather outside the hotel windows.',
        'Hide ducks all over the website. People love ducks.',
      ],
    },
    {
      id: 'todo',
      label: 'To-do',
      intro: 'Ticks are saved in this browser only.',
      todo: [
        'Fill in every TODO on this website (they know who they are)',
        'Learn one new keyboard shortcut a week',
        'Watch a sunset from somewhere new',
        'Read the book on the nightstand instead of buying another',
        'Call home',
        'Back up the laptop (yes, today)',
        'Sleep. Apparently it’s not optional.',
      ],
    },
    {
      id: 'lines',
      label: 'Lines I liked',
      lines: [
        { q: 'I’ll be back.', a: 'every bug I thought I fixed' },
        { q: 'With great power comes great responsibility.', a: 'also true of sudo' },
        { q: 'Roads? Where we’re going, we don’t need roads.', a: 'the glass elevator' },
        { q: 'It’s dangerous to go alone.', a: 'so the hotel has a guide' },
        { q: 'Winter is coming.', a: 'so are end-sems' },
        { q: 'The cake is a lie.', a: 'the deadline is not' },
        { q: 'Live long and prosper.', a: 'and commit often' },
        { q: 'Hello there.', a: 'how every good README should start' },
      ],
    },
    { id: 'doodles', label: 'Doodles', doodles: ['hotel', 'cat', 'car', 'duck'] },
    { id: 'scratch', label: 'Scratchpad', scratch: true },
  ],
};
