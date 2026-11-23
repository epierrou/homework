# CLAUDE.md

Glosträning – a static vocabulary practice site (index.html, app.js, style.css).
Weekly word lists live in `data/words.js` (the `WEEKS` array, newest week first).

## Git
- Commit as the repo owner, not as Claude:
  `git config user.name "Erik Pierrou"`
  `git config user.email "126284944+epierrou@users.noreply.github.com"`
- `main` is the main branch and is what GitHub Pages publishes.

## Adding a week
When given a screenshot of the week's words ("glosor"), add a new block at the top
of `WEEKS` in `data/words.js`: id `YYYY-vNN`, title, due date of the test, the
teacher's note, and every word with `sv`, `en` and two short, simple example
sentences (kid level) with the English word in [brackets].
Check that all exercises load without errors before committing.
