// Web Jelly 1: the block editor and the exercises around it. Every mission's steps are played by tests/help.mjs
// ("Do it for me" on every step); this test checks the editor the way children actually use it.
import { launch, guideUrl, verdict } from './lib.mjs';

const b = await launch({ draw: false }), problems = [];
const ok = (c, m) => { if (!c) problems.push(m); };
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
p.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
const editor = () => p.frames().find((f) => f.url().startsWith('about:srcdoc'));
const ticks = () => p.evaluate(() => document.querySelectorAll('#lPips .pip.ok').length);
const pageHtml = () => editor().evaluate(() => document.querySelector('iframe').contentDocument.body.innerHTML);
const pageText = () => editor().evaluate(() => document.querySelector('iframe').contentDocument.body.innerText.replace(/\s+/g, ' ').trim());
// an exercise's mission, from a fresh start
async function mission(id) {
  await p.goto(guideUrl('jellyweb') + '#' + id); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  for (let k = 0; k < 2; k++) { await p.evaluate(() => document.querySelector('#lNext').click()); await p.waitForTimeout(300); }
  await p.waitForTimeout(600);
  return editor();
}

// A word from an earlier module has a bubble: what it means, and a link to the exercise that taught it.
await p.goto(guideUrl('jellyweb') + '#page'); await p.waitForTimeout(900);
ok(await p.textContent('#lTitle') === 'What\'s a web page?', `the story's headline is "${await p.textContent('#lTitle')}"`);
await p.hover('.known:visible'); await p.waitForTimeout(450);
const bubble = await p.evaluate(() => [document.querySelector('#knPop.on')?.textContent, document.querySelector('#knPop a')?.getAttribute('href')]);
ok(/instructions the computer follows/.test(bubble[0] ?? '') && bubble[1] === '../jellyshell/#backstage', `the "program" bubble says ${JSON.stringify(bubble)}`);
await p.mouse.move(5, 760); await p.waitForTimeout(500);
ok(!await p.isVisible('#knPop.on'), 'the bubble closes when the mouse leaves');

// Step 1, "Click the big heading", ticks from the heading's words, its block, or the page.
for (const where of ['words', 'block', 'page']) {
  const fr = await mission('page');
  if (where === 'words') await fr.locator('.blk.heading input').first().click();
  if (where === 'block') await fr.locator('.blk.heading > .bh .name').click();
  if (where === 'page') await fr.frameLocator('iframe').locator('h1').click();
  await p.waitForTimeout(500);
  ok(await ticks() === 1, `clicking the heading's ${where} doesn't tick "Click the big heading"`);
}
// Every block shows its HTML name; the page block doesn't (body is taught later).
{
  const fr = editor(), names = await fr.evaluate(() => [...document.querySelectorAll('.bh .hname')].map((e) => e.textContent));
  ok(JSON.stringify(names) === '["h1","p"]', `HTML names on the blocks: ${names}`);
}
// A new block's words get the cursor, ready to type over.
{
  const fr = await mission('list');
  for (const k of ['para', 'heading', 'list']) {
    await fr.locator(`[data-add="${k}"]`).click(); await p.waitForTimeout(250);
    await p.keyboard.type(`typed ${k}`); await p.waitForTimeout(400);
    ok((await pageText()).includes(`typed ${k}`), `typing straight after + ${k} didn't reach the page`);
  }
}
// Italic ticks wherever it goes: in a paragraph, the heading, or inside the bold just typed.
for (const where of ['para', 'heading', 'bold']) {
  const fr = await mission('bold');
  await fr.locator('.blk.para input').first().click(); await fr.locator('[data-add="bold"]').click(); await p.keyboard.type('lime'); await p.waitForTimeout(400);
  if (where === 'para') await fr.locator('.blk.para input').first().click();
  if (where === 'heading') await fr.locator('.blk.heading input').first().click();
  await fr.locator('[data-add="italic"]').click(); await p.waitForTimeout(500);
  ok(await ticks() >= 2, `+ Italic with the ${where} selected doesn't tick the italic step`);
}
// The bin: only on the selected block, never on the page block; it deletes that block only.
{
  const fr = await mission('bold'), bins = () => fr.evaluate(() => [...document.querySelectorAll('.tree .bin')].filter((x) => x.offsetParent).length);
  ok(await bins() === 0, 'a bin shows before anything is selected');
  await fr.locator('.blk.para > .bh .name').click(); await p.waitForTimeout(200);
  ok(await bins() === 1, 'the selected paragraph has no bin, or more than one');
  await fr.locator('.blk.para > .bh .bin').click(); await p.waitForTimeout(300);
  ok(!(await pageText()).includes('I like jelly') && (await pageText()).includes('My jelly page'), `the bin deleted the wrong thing: "${await pageText()}"`);
  ok(!await fr.evaluate(() => !!document.querySelector('#tools [data-remove]')), 'the old Delete button is back');
}
// Carrying a block to the bottom edge scrolls the blocks; letting go below the last block puts it at the end, in view.
{
  const fr = await mission('move');
  await fr.locator('.blk.para > .bh .name').click();
  for (let i = 0; i < 12; i++) { await fr.locator('[data-add="para"]').click(); await p.keyboard.type(`para ${i}`); }
  await fr.evaluate(() => { document.querySelector('.tree').scrollTop = 0; });
  const tree = await fr.locator('.tree').boundingBox(), h = await fr.locator('.blk.heading > .bh .name').boundingBox();
  await p.mouse.move(h.x + 10, h.y + h.height / 2); await p.mouse.down(); await p.mouse.move(h.x + 10, h.y + 30, { steps: 4 });
  await p.mouse.move(h.x + 10, tree.y + tree.height - 6, { steps: 10 }); await p.waitForTimeout(2500);
  ok(await fr.evaluate(() => document.querySelector('.tree').scrollTop) > 100, 'holding a block at the bottom edge didn\'t scroll the blocks');
  await p.mouse.up(); await p.waitForTimeout(800);
  const order = await fr.evaluate(() => [...document.querySelector('iframe').contentDocument.body.firstElementChild.children].map((e) => e.tagName));
  ok(order.at(-1) === 'H1', `the heading didn't go to the end of the page: ${order.join(' ')}`);
  ok(await fr.evaluate(() => { const t = document.querySelector('.tree').getBoundingClientRect(), r = document.querySelector('.blk.heading').getBoundingClientRect(); return r.top >= t.top - 1 && r.bottom <= t.bottom + 1; }), 'the dropped heading is out of view');
}
// A picture's settings are buttons on the selected block; each opens its field with the cursor in it.
{
  const fr = await mission('picture'), shown = () => fr.evaluate(() => [...document.querySelectorAll('.attr-btn')].filter((x) => x.offsetParent).map((x) => x.textContent.trim()));
  await fr.locator('.blk.para > .bh .name').click(); await fr.locator('[data-add="picture"]').click(); await p.waitForTimeout(300);
  ok(JSON.stringify(await shown()) === '["File name ✎","Alt words ✎"]', `the picture's settings: ${await shown()}`);
  await fr.locator('.attr-btn[data-edit=alt]').click(); await p.waitForTimeout(200);
  ok(await fr.evaluate(() => document.activeElement?.matches('.attr-edit input[data-attr=alt]')), 'Alt words didn\'t open its field with the cursor in it');
  await p.keyboard.type('Gerald the gerbil'); await p.waitForTimeout(500);
  ok(/alt="Gerald the gerbil"/.test(await pageHtml()), 'typing the alt words didn\'t change the page');
  await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  ok(!await fr.evaluate(() => !!document.querySelector('.attr-edit')), 'Enter didn\'t close the field');
  await fr.locator('.blk.heading > .bh .name').click(); await p.waitForTimeout(200);
  ok((await shown()).length === 0, 'the heading shows the picture\'s settings');
}
// Start over really starts over: the page is back as it was when the mission began, and nothing is ticked.
{
  const fr = await mission('page'), before = await pageHtml();
  await p.evaluate(() => document.querySelector('#lDoIt').click()); await p.evaluate(() => document.querySelector('#doitYes').click()); await p.waitForTimeout(400);
  await fr.locator('[data-add="para"]').click(); await p.keyboard.type('Extra words'); await p.waitForTimeout(600);
  ok(await ticks() >= 1 && (await pageHtml()) !== before, 'the page didn\'t change before Start over');
  await p.evaluate(() => document.querySelector('#lRestart').click()); await p.waitForTimeout(600);
  ok(await ticks() === 0, `Start over left ${await ticks()} steps ticked`);
  ok((await pageHtml()).replace(/ class="[^"]*"/g, '') === before.replace(/ class="[^"]*"/g, ''), 'Start over didn\'t put the page back as it was');
  await fr.locator('[data-add="para"]').click(); await p.keyboard.type('Changed again'); await p.waitForTimeout(600);
  ok(await ticks() === 0, 'a change after Start over ticked a step that wasn\'t done again');
  await p.evaluate(() => document.querySelector('#lDoIt').click()); await p.waitForTimeout(300);
  ok(await p.isVisible('#doitPop'), 'after Start over, the jelly can be earned again, so "Do it for me" should warn again');
}
await p.screenshot({ path: 'web.png' });
await b.close();
verdict(problems);
