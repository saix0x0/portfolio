# Content schema

All content is in `content/`. Edit, save, refresh. There's nothing to build. Run `npm run check` afterwards.

## `site.js`
`name`, `fullName`, `role`, `college`, `degree`, `tagline`, `bio[]` (paragraphs), `interests[]`, `now[]` (`{label, text}`), `facts[]` (`[label, value]`), `email`, `contact.{provider: 'mailto'|'web3forms', web3formsKey}`, `socials[]` (`{label, url}`; empty url hides it), `hiring.{open, headline, lookingFor[], note, resume}`. Set `resume` to a path like `assets/resume.pdf` after adding the file.

## `projects.js`: projects
```js
{
  id: 'unique-slug',            // required; becomes /work/#p/unique-slug
  title: 'Name', subtitle: '',
  category: 'college',          // college | research | hackathon | personal | open-source | work
  status: 'shipped',            // shipped | in-progress | archived | idea
  year: 2026, period: 'Monsoon 2026',
  featured: true,               // shown in New York "Selected work" + 60-second view
  placeholder: true,            // shows a "Placeholder" badge; delete when real
  course: 'Course name',        // college work
  role: 'What I did', team: 'Solo / team of 4',
  tech: ['Python', 'PyTorch'],  // links to matching skills + powers constellation lines
  summary: 'One sentence.',
  problem: '', solution: '', contribution: '', architecture: '', challenges: '', outcome: '',
  highlights: ['…'],
  image: 'assets/projects/x.jpg',          // optional cover; otherwise a generated sky
  screenshots: [{ src: 'assets/projects/x-1.png', alt: '…' }],
  links: { code: '', demo: '', report: '', video: '', paper: '' }  // empty = hidden
}
```
Any case-study section you leave empty is simply not shown. Rome lists `college`, `research` and `hackathon` entries. `coursework[]` is `{code, name}`.

## `extracurriculars.js`: experiences
`{ id, title, org, role, kind, year, period, summary, link, placeholder }`. `kind`: club | leadership | event | debate | sport | volunteering | award | adventure. These appear in Rio and under the logbook's **Experiences** filter.

## `skills.js`
`skillGroups[]` = `{ name, skills: ['Python', …] }`. There are no proficiency numbers on purpose. A skill whose name matches a project's `tech` turns into a link to those projects. `learningNow[]`.

## `books.js`: library
`{ title, author, isbn, year, status, shelves[], free, url, note, type }`
- `status`: reading | next | read | revisit
- `shelves`: cs | ai | human | econ | history | philosophy (keys of `SHELVES`; add your own there)
- `free`: a link where it's **legally** free (author site, publisher, Project Gutenberg)
- `url`: canonical source for papers, courses or articles. `type`: book | paper | course | article | video
- Covers come from `covers.openlibrary.org` by ISBN. Without an ISBN, a cover is generated.

## `links.js`: Compass
`linkGroups[] = { name, gate, links: [{ name, url, note }] }`. Public, so nothing private goes here. Visitors (and you) can also add browser-local links from the page.

## Lab experiments
1. `cp lab/experiments/_template.js lab/experiments/my-idea.js`
2. Export `mount(root, { sky })` and optionally return a cleanup function.
3. Register it in `lab/experiments/index.js`: `{ id, title, blurb, status: 'live'|'wip'|'idea', module: './my-idea.js', hue }`.

An experiment that throws only shows an error card in its own stage.

## Private rooms
Edit `private/vault.md` or `private/observatory.md` as Markdown. Each `## Heading` becomes a card. Supported: headings, lists, `- [ ]` checkboxes, links, **bold**, *italic*, `code`, fenced code, `>` quotes. Then run `npm run seal vault` (or `observatory`) and commit the updated `sealed.json`.
