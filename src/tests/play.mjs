// Play a guide's lesson demos (src/guides/<guide>/demos.json) through the real page, the way a child would: typing
// in the terminal, pressing keys, typing in nano, editing, clicking. Presenter mode records its videos from the same
// lists, so a demo that stops working fails here too.
//   a command            typed in the terminal, then Enter
//   @tab:text  @enter  @up  @ctrlc        keys in the terminal
//   @type:text  @key:Control+x             nano
//   { click: selector }  { edit: [from, to] }  { visit: address }  { link: text }  { choose: n }  { wait: ms }
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
export const demos = (guide) => JSON.parse(fs.readFileSync(path.join(here, '..', 'guides', guide, 'demos.json'), 'utf8'));

// Open a lesson and step on to its mission. Waits for the lesson itself to be on screen (a busy machine can be slow).
export async function toLesson(p, id) {
  await p.evaluate((id) => { location.hash = id; }, id);
  await p.waitForFunction((id) => {
    const ids = [...document.querySelectorAll('.ni')].map((a) => a.dataset.id).filter((x) => !['welcome', 'whole', 'backstage'].includes(x));
    // "Magic word 3 of 13", or "Mission 3 of 3" in Security Jelly
    return new RegExp(`^(Magic word|Mission) ${ids.indexOf(id) + 1} `).test(document.querySelector('#lNum')?.textContent ?? '');
  }, id);
  await p.evaluate(() => document.querySelector('#unStay')?.click());
  // on to the mission, one phase at a time, waiting for each to change rather than for a fixed pause
  const phase = () => p.evaluate(() => document.querySelector('#lcard').dataset.phase);
  for (let k = 0; k < 6; k++) {
    const was = await phase(); if (was === 'mission') break;
    await p.evaluate(() => document.querySelector('#lNext').click());
    await p.waitForFunction((was) => document.querySelector('#lcard').dataset.phase !== was, was, { timeout: 10000 }).catch(() => {});
  }
}

// Wait for a lesson to earn its jelly (its menu item turns done), rather than a fixed pause: a busy machine, or tests
// running side by side, can take longer than usual. A lesson that never finishes is reported by the caller.
export const done = (p, id) => p.waitForFunction((id) => document.querySelector(`.ni[data-id="${id}"]`)?.classList.contains('done'), id, { timeout: 20000 }).catch(() => {});

// `after` runs after every action (for example a check that nothing untaught shows).
export async function play(p, actions, after = async () => {}) {
  const t = p.locator('#termIn');
  const tool = (k) => p.evaluate((k) => { const b = document.querySelector(`.wtab[data-tool=${k}]`); if (b && !b.classList.contains('on')) b.click(); }, k);
  for (const a of actions) {
    if (typeof a === 'object') {
      if (a.wait) await p.waitForTimeout(a.wait);
      else if (a.click) { await p.evaluate((s) => document.querySelector(s).click(), a.click); await p.waitForTimeout(400); }
      else if (a.edit) { await tool('edit'); const ed = p.locator('#edText'); await ed.fill((await ed.inputValue()).replace(a.edit[0], a.edit[1])); await p.waitForTimeout(700); }
      else if (a.visit) { await p.fill('#bwUrl', a.visit); await p.press('#bwUrl', 'Enter'); await p.waitForTimeout(a.visit.includes('moon') ? 3200 : 1500); }
      else if (a.link) { await p.frameLocator('#bwFrame').locator(`a:has-text("${a.link}")`).first().click(); await p.waitForTimeout(1300); }
      else if ('choose' in a) { await p.evaluate((n) => document.querySelectorAll('.choice')[n].click(), a.choose); await p.waitForTimeout(1500); }
    } else if (a.startsWith('@type:')) { await p.fill('#nanoText', a.slice(6).replace(/\\n/g, '\n')); await p.waitForTimeout(150); }
    else if (a.startsWith('@key:')) { await p.press('#nanoText', a.slice(5)); await p.waitForTimeout(350); }
    else if (a.startsWith('@tab:')) { await tool('term'); await t.fill(a.slice(5)); await t.press('Tab'); await p.waitForTimeout(200); }
    else if (a === '@enter') { await t.press('Enter'); await p.waitForTimeout(250); }
    else if (a === '@up') { await t.fill(''); await t.press('ArrowUp'); await p.waitForTimeout(200); }
    else if (a === '@ctrlc') { await t.press('Control+c'); await p.waitForTimeout(300); }
    else { await tool('term'); await t.fill(a); await t.press('Enter'); await p.waitForTimeout(450); }
    await after(a);
  }
}
