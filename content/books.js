// ─────────────────────────────────────────────────────────────────────────────
//  THE LIBRARY → /library/, the desk's bookshelf and the front page.
//
//  The owner's own library (2026-11-11), grouped into their own categories.
//  Only titles and authors go here.
//  Covers load from Open Library by ISBN (free API); if a cover is missing, a
//  hand-drawn cover is used. `free` links are legal free copies only (Project
//  Gutenberg, or the authors' own).
//
//  status: 'shelf' | 'reading' | 'read' | 'next' | 'revisit'. Everything starts
//  as 'shelf' (owned, not marked yet): move books to 'reading' or 'read' as you go.
//  `note` is a neutral one-line description; rewrite it in your words any time.
//  type: 'book' (default) | 'paper' | 'course' | 'article' | 'video'
//  The first 13 stand on the desk's shelf; the first 5 show on the front page.
// ─────────────────────────────────────────────────────────────────────────────

export const SHELVES = {
  philosophy: 'Philosophy',
  decisions: 'Decisions & behaviour',
  psychology: 'Psychology',
  stories: 'Fiction & history',
  math: 'Maths & statistics',
  cs: 'Computer science',
  ai: 'AI',
  work: 'Management & consulting',
  free: 'Free to read online',
};

export const STATUSES = { shelf: 'On the shelf', reading: 'Reading now', next: 'Want to read', read: 'Finished', revisit: 'Revisit' };

export const books = [
  { title: 'The Myth of Sisyphus', author: 'Albert Camus', isbn: '9780394700755', year: 1942, status: 'shelf', shelves: ['philosophy'], note: 'Camus on the absurd, and why life is worth living anyway.' },
  { title: 'Thus Spoke Zarathustra', author: 'Friedrich Nietzsche', isbn: '9780140441185', year: 1883, status: 'shelf', shelves: ['philosophy', 'free'], free: 'https://www.gutenberg.org/ebooks/1998', note: 'Nietzsche’s prophet comes down the mountain.' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', year: 2011, status: 'shelf', shelves: ['decisions', 'psychology'], note: 'The two systems of human judgement.' },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', isbn: '9780143058144', year: 1866, status: 'shelf', shelves: ['stories', 'free'], free: 'https://www.gutenberg.org/ebooks/2554', note: 'A murder in St Petersburg, and the conscience that follows it.' },
  { title: 'The Prince', author: 'Niccolò Machiavelli', isbn: '9780140449150', year: 1532, status: 'shelf', shelves: ['philosophy', 'free'], free: 'https://www.gutenberg.org/ebooks/1232', note: 'How power is won and kept, written for a Medici.' },
  { title: 'Reality+', author: 'David J. Chalmers', isbn: '9781543662894', year: 2022, status: 'shelf', shelves: ['philosophy', 'ai'], note: 'Virtual worlds and the problems of philosophy.' },
  { title: 'Predictably Irrational', author: 'Dan Ariely', isbn: '9780062018205', year: 2008, status: 'shelf', shelves: ['decisions'], note: 'The hidden forces that shape our decisions.' },
  { title: 'The Interpretation of Dreams', author: 'Sigmund Freud', isbn: '9780465019779', year: 1899, status: 'shelf', shelves: ['psychology', 'free'], free: 'https://www.gutenberg.org/ebooks/66048', note: 'Freud’s theory of what dreams are for.' },
  { title: 'Noise: A Flaw in Human Judgment', author: 'Daniel Kahneman, Olivier Sibony & Cass R. Sunstein', isbn: '9780316451406', year: 2021, status: 'shelf', shelves: ['decisions'], note: 'Why judgements that should agree so often don’t.' },
  { title: 'Superforecasting', author: 'Philip E. Tetlock & Dan Gardner', isbn: '9781101905562', year: 2015, status: 'shelf', shelves: ['decisions'], note: 'What the best forecasters do differently.' },
  { title: 'Fluent Python', author: 'Luciano Ramalho', isbn: '9781492056355', year: 2022, status: 'shelf', shelves: ['cs'], note: 'Idiomatic Python, second edition.' },
  { title: 'AI Engineering', author: 'Chip Huyen', isbn: '9781098166304', year: 2024, status: 'shelf', shelves: ['ai'], note: 'Building applications on top of foundation models.' },
  { title: 'Thinking in Systems', author: 'Donella H. Meadows', isbn: '9781603588478', year: 2008, status: 'shelf', shelves: ['decisions'], note: 'Stocks, flows and feedback loops: a primer.' },
  { title: 'Introduction to Probability', author: 'Joseph K. Blitzstein & Jessica Hwang', isbn: '9781466575578', year: 2014, status: 'shelf', shelves: ['math', 'free'], free: 'http://probabilitybook.net/', note: 'The textbook behind Harvard’s Stat 110.' },
  { title: 'Thinking in Bets', author: 'Annie Duke', isbn: '9780735216358', year: 2018, status: 'shelf', shelves: ['decisions'], note: 'Deciding well when you can’t know everything.' },
  { title: 'Irrationality: A History of the Dark Side of Reason', author: 'Justin E. H. Smith', isbn: '9780691210513', year: 2019, status: 'shelf', shelves: ['philosophy', 'decisions'], note: 'How reason keeps producing its opposite.' },
  { title: 'Freakonomics', author: 'Steven D. Levitt & Stephen J. Dubner', isbn: '9780061234002', year: 2005, status: 'shelf', shelves: ['decisions', 'work'], note: 'Economics applied to everyday puzzles.' },
  { title: 'The First 20 Hours', author: 'Josh Kaufman', isbn: '9781591845553', year: 2013, status: 'shelf', shelves: ['decisions'], note: 'How to learn a new skill fast.' },
  { title: 'Change by Design', author: 'Tim Brown', isbn: '9780061766084', year: 2009, status: 'shelf', shelves: ['work'], note: 'Design thinking, from the head of IDEO.' },
  { title: 'Bulletproof Problem Solving', author: 'Charles Conn & Robert McLean', isbn: '9781119553021', year: 2018, status: 'shelf', shelves: ['work'], note: 'A seven-step method for hard problems.' },
  { title: 'The McKinsey Way', author: 'Ethan M. Rasiel', isbn: '9780071368834', year: 1999, status: 'shelf', shelves: ['work'], note: 'How McKinsey consultants work.' },
  { title: 'Mossad', author: 'Michael Bar-Zohar & Nissim Mishal', isbn: '9780062123411', year: 2012, status: 'shelf', shelves: ['stories'], note: 'The greatest missions of the Israeli secret service.' },
];
