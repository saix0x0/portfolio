// ─────────────────────────────────────────────────────────────────────────────
//  THE LIBRARY → /library/ and the Arctic scene.
//
//  A STARTER SHELF of real, well-known books matched to your interests. Every
//  `free` link points to a copy the author/publisher or Project Gutenberg
//  offers legally for free. Covers load from Open Library by ISBN (free API);
//  if a cover is missing, a hand-drawn cover is used.
//
//  status: 'reading' | 'read' | 'next' | 'revisit'   — all start as 'next';
//  move them as you go. `note` is YOUR note — the starter text is just a
//  neutral description; rewrite it.
//  type: 'book' (default) | 'paper' | 'course' | 'article' | 'video'
// ─────────────────────────────────────────────────────────────────────────────

export const SHELVES = {
  cs: 'Computer science',
  ai: 'AI & agents',
  human: 'Human sciences',
  econ: 'Economics',
  history: 'History',
  philosophy: 'Philosophy',
  free: 'Free to read online',
};

export const STATUSES = { reading: 'Reading now', next: 'Want to read', read: 'Finished', revisit: 'Revisit' };

export const books = [
  // Computer science
  { title: 'Structure and Interpretation of Computer Programs', author: 'Abelson & Sussman', isbn: '9780262510875', year: 1996, status: 'next', shelves: ['cs', 'free'], free: 'https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/6515/sicp.zip/index.html', note: 'The classic MIT introduction to programming as a way of thinking.' },
  { title: 'Operating Systems: Three Easy Pieces', author: 'Remzi & Andrea Arpaci-Dusseau', isbn: '9781985086593', year: 2018, status: 'next', shelves: ['cs', 'free'], free: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', note: 'Virtualisation, concurrency and persistence, explained clearly.' },
  { title: 'Crafting Interpreters', author: 'Robert Nystrom', isbn: '9780990582939', year: 2021, status: 'next', shelves: ['cs', 'free'], free: 'https://craftinginterpreters.com/contents.html', note: 'Build a programming language from scratch, twice.' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '9781449373320', year: 2017, status: 'next', shelves: ['cs'], note: 'How real systems store, move and agree on data.' },
  { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest & Stein', isbn: '9780262046305', year: 2022, status: 'next', shelves: ['cs'], note: 'The standard algorithms reference (CLRS).' },
  { title: 'Pro Git', author: 'Scott Chacon & Ben Straub', isbn: '9781484200773', year: 2014, status: 'next', shelves: ['cs', 'free'], free: 'https://git-scm.com/book/en/v2', note: 'The official Git book.' },

  // AI
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', isbn: '9780134610993', year: 2020, status: 'next', shelves: ['ai'], note: 'The field’s standard textbook, including agents.' },
  { title: 'Deep Learning', author: 'Goodfellow, Bengio & Courville', isbn: '9780262035613', year: 2016, status: 'next', shelves: ['ai', 'free'], free: 'https://www.deeplearningbook.org/', note: 'Foundations of deep learning, free online.' },
  { title: 'Reinforcement Learning: An Introduction', author: 'Richard Sutton & Andrew Barto', isbn: '9780262039246', year: 2018, status: 'next', shelves: ['ai', 'free'], free: 'http://incompleteideas.net/book/the-book-2nd.html', note: 'How agents learn from reward.' },

  // Human sciences / philosophy / economics / history
  { title: 'Gödel, Escher, Bach', author: 'Douglas Hofstadter', isbn: '9780465026562', year: 1979, status: 'next', shelves: ['philosophy', 'ai'], note: 'Minds, self-reference and strange loops.' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', year: 2011, status: 'next', shelves: ['human', 'econ'], note: 'The two systems of human judgement.' },
  { title: 'Meditations', author: 'Marcus Aurelius', isbn: '9780812968255', year: 180, status: 'next', shelves: ['philosophy', 'history', 'free'], free: 'https://www.gutenberg.org/ebooks/2680', note: 'A Roman emperor’s private notebook.' },
  { title: 'The Wealth of Nations', author: 'Adam Smith', isbn: '9780553585971', year: 1776, status: 'next', shelves: ['econ', 'history', 'free'], free: 'https://www.gutenberg.org/ebooks/3300', note: 'Where modern economics starts.' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', year: 2015, status: 'next', shelves: ['history', 'human'], note: 'A brief history of humankind.' },
  { title: 'Siddhartha', author: 'Hermann Hesse', isbn: '9780553208849', year: 1922, status: 'next', shelves: ['philosophy', 'free'], free: 'https://www.gutenberg.org/ebooks/2500', note: 'A short novel about a search for meaning. Almost a namesake.' },
  { title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', isbn: '9780156012195', year: 1943, status: 'next', shelves: ['philosophy'], note: 'The one who watched the sun set forty-four times in a day.' },
];
