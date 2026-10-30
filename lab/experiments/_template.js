// TEMPLATE — copy me to start a new experiment.
// 1. cp lab/experiments/_template.js lab/experiments/my-idea.js
// 2. add { id: 'my-idea', title, blurb, status: 'wip', module: './my-idea.js', hue: 120 } to index.js
//
// mount(root, { sky }) receives an empty element that fills the screen, plus the
// site's sky engine (sky.setPalette('arctic'), sky.aurora(), sky.fireworks()…).
// Return a cleanup function to remove listeners / stop animation loops.

export function mount(root, { sky }) {
  root.innerHTML = `<div style="padding:40px;max-width:60ch">
    <h2 style="font-size:2.4rem">Hello from a new experiment</h2>
    <p>Edit <code>lab/experiments/_template.js</code>.</p>
    <button class="btn" type="button">Make it snow fireworks</button></div>`;
  const onClick = () => sky.fireworks(3);
  root.querySelector('button').addEventListener('click', onClick);
  return () => root.querySelector('button')?.removeEventListener('click', onClick);
}
