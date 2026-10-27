# WebGPU for the jelly: assessment

**Status: steps 0 and 1 done in 1.7** (three.js 0.186.1; the better jelly on WebGL, described in architecture.md, The jelly's look). Step 1 went further than planned: the change that showed was the lighting (a window to reflect), deep attenuation colour and a floor glow, not the shader extras alone. Step 2, WebGPU as an opt-in, is not started. The experiments lived outside the repo, in a scratch folder.

## The short answer

**What Jelly Baby does.** The current Jelly Baby uses WebGPU and nothing else. It builds `THREE.WebGPURenderer` from `three/webgpu` (three.js r185), switches off three.js's built-in WebGL fallback on purpose, and shows an error if WebGPU is missing. Its jelly is a `MeshPhysicalNodeMaterial` written in TSL. The soft body still runs on the CPU, in JavaScript with a WebAssembly speed-up. The only part that needs WebGPU is the caustics: the bright light patterns under the jelly, made with GPU compute shaders.

**Most of the better look isn't WebGPU.** It comes from how the jelly is lit and authored:
- a photographed HDR room instead of `RoomEnvironment`;
- thickness that changes across the body, traced through the deformed mesh;
- full transmission with dispersion;
- AgX tone mapping, bloom and a colour grade;
- a local reflection probe;
- a mesh with 72,000 vertices.

Almost all of that can be done with the WebGL renderer we already use.

**Recommendation.**
1. **Upgrade three.js** from 0.169.0 to 0.186.1, keeping today's `WebGLRenderer`. I ran Shell Jelly on 0.186.1 with only the version in the import map changed. The letters, the jar and the Overview all work. The only warning is that `PCFSoftShadowMap` is gone.
2. **Bring the look across on WebGL first.** That means tone mapping, thickness per vertex, an inner glow, dispersion, and a cheaper see-through pass for slow machines. Every child gets these, and the old machines are exactly the ones that won't have WebGPU.
3. **Then, if still wanted, add WebGPU as an optional extra.** One renderer factory tries WebGPU and otherwise builds today's `WebGLRenderer`. The materials stay classic three.js materials, which both renderers draw. Only our two hand-written GLSL pieces (the jar's swirl background and the jelly patterns) need a TSL twin.

   Turn WebGPU on by default only after measuring it on real old machines. Keep the classic renderer as the fallback, rather than WebGPURenderer's own WebGL2 backend, at least at first. The reasons are in the measurements below.

**Main risks.**
- **Little gain for old machines.** Most of them won't get WebGPU, so they stay on WebGL whatever we do.
- **Two paths.** Two renderers can drift apart in look, and everything must be tested twice.
- **three.js's WebGPU side changes fast.** Its API is renamed every few releases. In my tests, 0.186.1's WebGPU path also broke on a 13-month-old Chromium (details in section 5).
- **Startup costs more.** The WebGPU path downloads about 730 KB of three.js (gzipped) instead of 417 KB, and its shaders are built in JavaScript before the first frame.

---

## 1. What Jelly Baby actually does

Sources:
- the repo: [scottstts/Jelly-Baby](https://github.com/scottstts/Jelly-Baby), at commit `19fc6ea` (14 Sep 2026);
- its [rendering doc](https://github.com/scottstts/Jelly-Baby/blob/main/docs/rendering-and-materials.md), [optical transport doc](https://github.com/scottstts/Jelly-Baby/blob/main/docs/optical-transport.md) and [soft-body doc](https://github.com/scottstts/Jelly-Baby/blob/main/docs/soft-body-and-interaction.md);
- the single-file study it started from, [`refs/jelly-webgpu.html`](https://github.com/scottstts/Jelly-Baby/blob/main/refs/jelly-webgpu.html). That study is probably what our port came from: one HTML file, an import map to `three@0.180.0` on jsDelivr, the same XPBD constants.

### Renderer

| | Jelly Baby |
|---|---|
| three.js | `^0.185.0` from npm, built with Vite. The single-file study uses 0.180.0 from jsDelivr |
| Renderer | `THREE.WebGPURenderer` from `three/webgpu` ([`renderer.ts`](https://github.com/scottstts/Jelly-Baby/blob/main/src/graphics/scene/renderer.ts)) |
| Fallback | **None, on purpose.** It sets `renderer._getFallback = null` so three.js can't switch to WebGL2, then checks `backend.isWebGPUBackend`. Without WebGPU, the page shows "This browser does not support WebGPU" |
| Context | Needs `isSecureContext` (HTTPS or localhost) and `navigator.gpu` |
| Device loss | Wraps three.js's `onDeviceLost` and `onError`, and treats either as fatal |
| Warm-up | `compileAsync` while the loading card is showing, so no shader compiles in the middle of play |
| Output | sRGB, `AgXToneMapping`, exposure 1.05. DPR is capped at 1.7 (1.5 on touch screens) and at 4 million pixels |

### Where the jelly look comes from

From [`baby.ts`](https://github.com/scottstts/Jelly-Baby/blob/main/src/graphics/character/baby.ts) and [`composite.ts`](https://github.com/scottstts/Jelly-Baby/blob/main/src/graphics/scene/composite.ts):

1. **The material.** `MeshPhysicalNodeMaterial` with `transmission: 1`, `ior: 1.35`, `dispersion: .025`, `attenuationDistance: .035`, `clearcoat: .42`, `roughness: .085`. The attenuation colour is worked out from each flavour's real RGB absorption, so thin parts are pale and thick parts deep.
2. **Thickness per vertex, from the actual shape.** This is the biggest single trick. `material.thicknessNode = attribute('opticalThickness')`. A Web Worker traces a ray from each vertex, refracted along the view direction, through a BVH of the deformed body, and writes back how far the light travels inside. The rays are traced through a 10,000-vertex stand-in mesh, and the results are mapped onto the 72,000-vertex visible one. In TSL this is one line. With a classic material it needs a shader patch (see section 5).
3. **Lighting.** A photographed HDR room (EXR files, baked offline into RGBA16F) goes through PMREM. Its window light is measured and drives the shadows and caustics. There are no extra lamps that would double the window. A 128² cube-camera reflection probe follows the jelly, so it reflects the real furniture near it.
4. **Caustics.** These use real WebGPU compute: `renderer.compute(...)` runs WGSL kernels written as TSL `wgslFn` code. The kernels deform the stand-in mesh, refit a BVH on the GPU, trace refracted rays, and draw the bright folds onto every surface that receives them. This is the only part of the look that can't be done the same way on WebGL. It needs storage buffers and compute shaders.
5. **The final image.** A TSL `RenderPipeline`: the scene pass, a gentle bloom (threshold .075, strength .18, at half resolution), a slight colour balance, a contrast grade and a vignette, then one AgX tone map.
6. **Detail.** The body has 72,234 vertices and 144,464 triangles. Our letters have a few thousand each.

### Physics

The physics runs on the **CPU**. `src/physics/soft-body.js` is plain JavaScript using `Float64Array`s, the same XPBD neo-Hookean solver we ported. `soft-body-kernel.js` adds a WebAssembly build of the same solver, compiled from C, and falls back to the JavaScript if WebAssembly fails. GPU compute is used only for the caustics, never for the soft body.

So moving our physics to the GPU would be going further than Jelly Baby does. For our small cages (a few hundred nodes per letter) it would cost more than it saves. Picking, collisions and the googly eyes all need the positions back on the CPU every frame.

---

## 2. WebGPURenderer, its WebGL fallback, and what changes

Everything here was checked in the three.js 0.186.1 source (`src/renderers/webgpu/WebGPURenderer.js`, `src/renderers/common/Renderer.js`, `WebGPUBackend.js`), unless a link says otherwise.

### How the fallback works

- `new WebGPURenderer()` builds a WebGPU backend and registers a `getFallback()` that builds a `WebGLBackend` (WebGL 2).
- `await renderer.init()` asks for an adapter. If that throws, for example when there is no `navigator.gpu` or no adapter, it builds the WebGL2 backend instead and logs "WebGPU is not available, running under WebGL2 backend."
- `forceWebGL: true` skips WebGPU altogether.
- `renderer.backend.isWebGPUBackend` tells you which backend you got.
- Since r181, `init()` must finish before the synchronous `render()` is called ([migration guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)). Our `JellyStage` constructor is synchronous, so it would need to wait for `init()`.
- The WebGPU backend always asks for a `featureLevel: 'compatibility'` adapter. When it gets a compatibility-only device, it turns MSAA off.

**The "WebGL fallback" is not today's renderer.** WebGPURenderer's WebGL2 backend is a separate, newer renderer that draws node materials compiled to GLSL. It isn't `WebGLRenderer`. The three.js forum calls the fallback experimental ([thread](https://discourse.threejs.org/t/webgpurenderer-forcewebgl-true-vs-webglrenderer/87805)), with known differences in blending and post-processing. Our guides already need WebGL 2, because three.js dropped WebGL 1 in r163. So the fallback reaches the same machines; the open question is only how mature it is.

### Materials

| Ours | Under WebGPURenderer |
|---|---|
| `MeshPhysicalMaterial`, `MeshStandardMaterial`, `MeshToonMaterial`, `MeshBasicMaterial`, `SpriteMaterial`, `ShadowMaterial` | **Work unchanged.** `NodeLibrary.fromMaterial()` copies each into its node version (`MeshPhysicalNodeMaterial`, `ShadowNodeMaterial`, and so on). Transmission, thickness, attenuation, clearcoat, sheen, iridescence and dispersion are all supported |
| `onBeforeCompile` (the jar's `paintJelly` patterns) | **Silently ignored.** Nothing in the node renderer calls it, so the jellies would lose their zebra, spots and so on without any error |
| `ShaderMaterial` (the jar's swirling background) | **Not supported.** The node builder logs `Material "ShaderMaterial" is not compatible` and draws a plain default material |
| `PCFSoftShadowMap` | Removed in both renderers. You get a warning, and `PCFShadowMap` is used, which is now soft as well |

The two GLSL pieces would need TSL versions:
- **The swirl background** becomes a `MeshBasicNodeMaterial` whose `colorNode` computes the same `sin`/`hue` mix from `positionLocal` and a `uniform` time. This is small.
- **The 12 jelly patterns** become a TSL function of `attribute('aR')` and a pattern-index uniform, put on `colorNode`. This is medium-sized, because the hash, the spots and the galaxy each need writing out.

TSL code runs on both of WebGPURenderer's backends, because it compiles to WGSL or GLSL. Raw `wgslFn` code runs only on WebGPU.

### Look changes I saw with the same material

These are from the experiment page's screenshots:
- **The background and fog get tone-mapped.** WebGPURenderer draws everything into a half-float buffer, then applies tone mapping and sRGB once at the end. That includes the clear colour and the fog. Under ACES, our pale blue sky `#d4eeff` came out grey, and the letters looked paler. The classic renderer clears straight to the canvas and applies fog after tone mapping.
- **The transmission source is a copy of the screen** (see section 4), so refraction near the edges of the canvas differs slightly.

### Do we need to upgrade from 0.169.0?

**Yes, for any WebGPU work.**
- 0.169 predates the `three/webgpu` entry point (r171), `RenderPipeline` (r183), the r181 `init()` rules and many WebGPU fixes.
- Jelly Baby uses r185, and its single-file study r180.
- The current release is **0.186.1** (24 Sep 2026, [npm](https://www.npmjs.com/package/three)).

**For the classic renderer alone, upgrading is cheap.** I swapped `three@0.169.0` for `three@0.186.1` in Shell Jelly's import map and changed nothing else. The welcome letters, the jar (all 12 looks, patterns included) and the Overview all rendered. The only new console message was the `PCFSoftShadowMap` warning.

Things to know about the upgrade ([migration guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)):

| Change | Release | Affects us? |
|---|---|---|
| Build split into `three.core.js` plus `three.module.js` | r171 | No code change. The import map URL is the same, and the browser loads `three.core.js` next to it |
| `PCFSoftShadowMap` deprecated, then removed; `PCFShadowMap` is soft now | r182 (WebGL), r186 (WebGPU) | Change `shell.html` to `PCFShadowMap` to silence the warning. Check shadow softness |
| PBR materials conserve energy better; rough materials look brighter | r181 | The grid floor (roughness .85) and the Overview's standard materials: check screenshots |
| `RoomEnvironment` moved in its scene, so PMREM light from it looks different | r183 | Every guide uses it. Check screenshots |
| `ColorManagement` methods renamed | r177 | We don't call them |
| `mergeVertices`, `mergeGeometries`, `RoundedBoxGeometry`, `FontLoader`, `RoomEnvironment` | | All still at the same `examples/jsm/` paths |
| `#include <begin_vertex>`, `#include <color_fragment>`, and `gl_FragColor` in `ShaderMaterial` | | Still there, so the jar's patches still apply |
| `renderer.transmissionResolutionScale` | r175 | **New and useful:** it shrinks the see-through pass (section 4) |
| Download size, gzipped | | 0.169's `three.module.js` is 262 KB. 0.186.1's `three.core.js` plus `three.module.js` is 417 KB. Adding `three.webgpu.js` makes it 730 KB |

---

## 3. Browser support (October 2026)

Sources: [gpuweb implementation status](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status), [Chrome: New in WebGPU 146](https://developer.chrome.com/blog/new-in-webgpu-146), [Wikipedia](https://en.wikipedia.org/wiki/WebGPU), [Khronos SIGGRAPH 2026 summary](https://www.khronos.org/developers/linkto/webgl-and-webgpu-sigg26).

| Browser and platform | WebGPU |
|---|---|
| Chrome and Edge on Windows, macOS, ChromeOS | Yes, since 113 (2023). On Windows it runs on Direct3D 12, so old GPUs without it, or on Chrome's blocklist, get no adapter |
| Chrome on Android | Yes, since 121, on Android 12 and later with ARM, Qualcomm or Intel GPUs. Imagination GPUs since 139, on Android 16 |
| Chrome on Linux | Intel Gen12 and later since 144. NVIDIA on Wayland since 147. Everything else is behind a flag |
| Chrome on Windows ARM | Behind a flag |
| Chrome "compatibility mode" (OpenGL ES 3.1, for older devices) | Shipped in 146, Android only. ChromeOS and Windows with Direct3D 11 are being "explored". three.js already asks for it |
| Safari | Yes, from Safari 26, on macOS Tahoe 26 and iOS and iPadOS 26. Not on older macOS, even with Safari 26 installed ([WebKit bug 299237](https://bugs.webkit.org/show_bug.cgi?id=299237)) |
| Firefox | Windows since 141. Apple-silicon Macs since 145. Linux in Nightly only. Android behind a flag; Mozilla aims for 2026 |

**What this means for the children's machines:**
- **Old Windows laptops** with GPUs from about 2013 or earlier, or stuck on an old Chrome (Windows 7 and 8 stopped at Chrome 109): no WebGPU.
- **Linux laptops** and Firefox on Linux: mostly no WebGPU.
- **Macs that can't run macOS Tahoe:** no WebGPU in Safari, but yes in Chrome.
- **School Chromebooks:** usually yes, if they're on a recent ChromeOS.

On all of these, the page must fall back to WebGL, as it does today.

**Without WebGPU, three.js falls back by itself**, unless the page disables it as Jelly Baby does. I checked this in headless Chromium: with no adapter, `navigator.gpu` exists, `requestAdapter()` returns null, and `init()` quietly switched to WebGL2.

### Where the guides run

- **From a file on disk:** `file://` counts as a secure context in Chromium. I checked: `isSecureContext` is true and `navigator.gpu` is there. Safari and Firefox still need checking.
- **GitHub Pages:** HTTPS, so fine.
- **claude.ai artifacts:** not tested.
  - The artifact allows scripts from jsDelivr, and `three.webgpu.js` and `three.tsl.js` are on jsDelivr. So pinned URLs such as `https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.webgpu.js` load.
  - **Risk:** frames with a null origin are reported to hide `navigator.gpu` ([Figma forum](https://forum.figma.com/t/webgpu-api-is-not-supported-in-the-plugin/61545)). Our artifacts use `localStorage`, so they don't have a null origin.
  - Either way, the fallback covers it. Test it once by hand.

---

## 4. Performance: faster, prettier, or neither?

### How each renderer does transmission

- **`WebGLRenderer` (today):** before drawing any see-through object, it **draws every opaque object a second time**: the floor, the eyes, the background sphere and the jar's coaster. They go into an extra full-size render target, which is half-float with 4× MSAA, and then it builds mipmaps of that target. Double-sided see-through objects also draw their back faces into it. You can see this in `renderTransmissionPass` in `WebGLRenderer.js`. Since r175, `renderer.transmissionResolutionScale` can shrink that target.
- **`WebGPURenderer` (either backend):** draws the opaque objects once, then **copies the framebuffer** into a mipmapped texture, `viewportOpaqueMipTexture`, and the see-through materials sample it. There's no second scene pass.
- **In both**, see-through objects don't see each other through themselves, only the opaque things behind. So a letter behind another letter isn't refracted. Jelly Baby's single body never runs into this.

### Measurements

**How these were taken.**
- Headless Chromium 141 with **SwiftShader**: software rendering on 4 CPU cores. The absolute numbers are meaningless; only the comparisons within a column count.
- **WebGPU was available headless** once Chromium was given SwiftShader's Vulkan adapter (flags in section 5). Without those flags, `navigator.gpu` exists but has no adapter, which is exactly what a machine without WebGPU sees.
- **The scene:** the experiment page draws the word "jelly" as today's welcome letters do: 5 letters with eyes, a shadow-casting sun, the grid floor and the `RoomEnvironment` light. The canvas is 1366 × 420 at DPR 1. Every frame, every letter's positions and normals are rewritten, as the soft body does.
- **The timing:** ms per frame is the median of 3 to 5 page loads, each 20 frames after a warm-up, waiting for the GPU to finish every frame. Where the two runs disagree, both numbers are shown.

**Without WebGPU** (what old machines get):

| Renderer and material | ms per frame, see-through on | ms per frame, see-through off | First frame (shader build), ms |
|---|---|---|---|
| `WebGLRenderer`, today's material | 956 / 1008 | 452 / 511 | 2043 / 2437 |
| `WebGLRenderer`, today's material, `transmissionResolutionScale = .5` | **667** | | 1916 |
| `WebGLRenderer` with the upgraded look (GLSL patch) | 1095 | | 2667 |
| WebGPURenderer's WebGL2 fallback, same classic material | 728 / 751 | 614 / 618 | 2060 / 3098 |
| WebGPURenderer's WebGL2 fallback, TSL jelly | 697 / 818 | | 3287 / 4105 |

**With WebGPU available:**

| Renderer | ms per frame, see-through on | ms per frame, see-through off |
|---|---|---|
| `WebGLRenderer`, today's material | 820 / 1009 | 469 |
| WebGPURenderer on WebGPU, same classic material | 424 / 776 | 343 / 660 |
| WebGPURenderer on WebGPU, TSL jelly | 972 | |

Times to the first frame in this mode were 4 to 9 seconds for every renderer, the classic one included. The WebGPU flags seem to slow the whole GPU process, so I don't compare startup here.

**What the numbers say:**
- **The see-through pass roughly doubles the frame cost in today's renderer** (+97 to 115%). In WebGPURenderer it adds 15 to 25%, on either backend. That matches the code: a second scene draw with 4× MSAA versus one copy.
- **With the see-through effect off, today's renderer is the fastest thing measured.** The WebGL2 fallback costs about 25 to 35% more per frame for the same picture, and its first frame is no faster.
- **`transmissionResolutionScale = .5` on today's renderer** (667 ms) beats the WebGL2 fallback (728 to 751 ms). That's a one-line change.
- **WebGPU itself was the fastest with the see-through effect on,** but the noisiest: 424 ms in one run, 776 ms in another. Software WebGPU says little about real GPUs.
- **The TSL jelly costs more to build.** Its first frame took 1.1 to 2 times as long as the same scene with the classic material. On a slow CPU that's a longer pause before the letters appear, unless it's built during a loading moment with `compileAsync`.
- **The GLSL version of the upgraded look costs about 10% per frame** over today's material on the classic renderer (1095 against 1008 ms). Part of that is dispersion's three texture reads.

Software rendering stresses fill rate and memory bandwidth the way old integrated GPUs do, so the direction of these results is probably right. **The sizes must be confirmed on the actual old machines** before anything becomes the default.

### So is WebGPU faster or prettier for us?

- **Prettier: not by itself.** The same material looks the same under both renderers, apart from the tone-mapped background. Jelly Baby is prettier because of its lighting and its material authoring, and the experiment shows that look can be done on WebGL too.
  - Panel 4 of the experiment uses today's `WebGLRenderer` with thickness per vertex, an inner glow, dispersion and neutral tone mapping, and matches panel 3, which does the same in TSL on WebGPU.
  - The biggest visible change in the experiment came from **tone mapping**. Neutral, which the jar already uses, keeps the jelly colours bright, where ACES greys them.
  - What WebGPU really adds is compute: caustics, and later perhaps GPU particles. Even Jelly Baby uses it only for caustics.
- **Faster: only in the see-through pass.** The copy is cheaper than our second scene pass, and that's the costliest effect we have (the Overview turns it off on slow machines).
  - But WebGPU starts slower: more JavaScript to download and parse, and shader building that takes longer before the first frame.
  - And on many old machines it simply isn't available.
  - Today's renderer can get much of the transmission saving with `transmissionResolutionScale`.

---

## 5. Integration plan

### Step 0: upgrade three.js, classic renderer only (small)

- `shell.html` import map: change `0.169.0` to `0.186.1`, and `PCFSoftShadowMap` to `PCFShadowMap`.
- Rebuild, run `npm test`, and look at the screenshots at 900 × 560 and 1366 × 768. Check the floor brightness (r181) and the `RoomEnvironment` lighting (r183) against the old screenshots, and retune `environmentIntensity` and exposure if needed.
- Run `node tests/perf.mjs`. It times physics only, so it won't change, but it's part of the definition of done.
- Note that downloads grow from 262 KB to 417 KB gzipped. On a slow connection that's the cost of the upgrade.

### Step 1: better jelly on WebGL, for every child (small to medium)

All of these work on today's renderer and need no WebGPU:
- **Tone mapping:** try `NeutralToneMapping` for the letters, as the jar already does. ACES washes our colours out. One line, but it's an art call.
- **Thickness per vertex:**
  - In `makeLetter()`, work out each vertex's depth through the glyph once at rest. The experiment does it cheaply: the slab depth for front and back faces, and for the walls a 2D ray across the glyph outline, using the `polys` that `makeLetter` already builds.
  - Store it as an `aThick` attribute.
  - Feed it to the transmission thickness. In GLSL, replace `#include <transmission_fragment>` with `ShaderChunk.transmission_fragment` after swapping its `material.thickness = thickness;` for the attribute (see `glPlusMaterial` in the experiment).
  - In TSL this is `material.thicknessNode = attribute('aThick')`.
  - The value squishes along with the body, because it rides the vertices.
- **An inner glow** that is stronger where the jelly is thin, plus a rim and a back-light term, added to the emissive light. That's six lines of GLSL, or six of TSL. It's a cheap stand-in for subsurface scattering. three.js has a `MeshSSSNodeMaterial` for WebGPURenderer, but it adds to the diffuse light, which transmission mostly replaces, so I used emissive instead.
- **`dispersion`:** a classic material property already in our 0.169. It costs three texture reads instead of one in the see-through pass, so leave it off on slow machines.
- **Old-machine handling:** extend what the Overview does (if the first two seconds run under 30 fps, transmission goes off).
  - Add a middle step first: `renderer.transmissionResolutionScale = .5`.
  - Use the same check for the welcome letters and the jar.
- **Combine the jar's patch.** `paintJelly` already uses `onBeforeCompile`. A thickness and glow patch must merge into the same hook, with one `customProgramCacheKey` per combination.

### Step 2: a renderer factory, with WebGPU as an opt-in (medium)

Put one function in `shell.html` and use it from `JellyStage`, which the jar and presenter mode inherit, and from `overview-kit.js`:

```js
// Picked once per page. WebGPU only when it is really there and has drawn a frame; otherwise today's renderer.
const RENDERER = await pickRenderer(); // 'webgpu' | 'webgl'
async function pickRenderer() {
  if (new URLSearchParams(location.search).get('renderer') !== 'webgpu') return 'webgl'; // opt-in until measured
  try { return (await navigator.gpu?.requestAdapter()) ? 'webgpu' : 'webgl'; } catch { return 'webgl'; }
}
async function makeRenderer(canvas, opts) {
  if (RENDERER === 'webgpu') {
    const { WebGPURenderer } = await import('three/webgpu');
    const r = new WebGPURenderer({ canvas, ...opts });
    r._getFallback = null; // our fallback is the classic renderer, not WebGPURenderer's WebGL2 backend
    try { await r.init(); return r; } catch { r.dispose(); }
  }
  return new THREE.WebGLRenderer({ canvas, ...opts });
}
```

What else this step needs:
- **The import map** gains `"three/webgpu"` and `"three/tsl"`, pinned to the same version. `three.webgpu.js` is only fetched when `?renderer=webgpu` is chosen. Keep `"three"` pointing at `three.module.js`, because the addons import from `'three'`. WebGPU users then also fetch `three.module.js` (131 KB). That's acceptable.
- **Async start.** `JellyStage` must wait for its renderer. Keep the constructor synchronous and skip `render()` until `this.ready` is set; physics can start straight away. The same applies to the Overview.
- **Mid-session failures.** Errors can come after `init()`. Our test Chromium threw after `init()` had succeeded, while building the first frame. And a device can be lost when a laptop sleeps. Wrap the first `render()` in a try, and set `onDeviceLost`. On either, save `jelly.renderer = 'webgl'` in `localStorage` and rebuild that stage with the classic renderer. Don't show a fatal error, as Jelly Baby does.
- **Materials stay classic.** WebGPURenderer converts them. Branch only where we have GLSL:
  - the jar's swirl background (`ShaderMaterial` or TSL);
  - `paintJelly` (`onBeforeCompile` or TSL `colorNode`);
  - the Step 1 thickness and glow patch (GLSL or `thicknessNode`/`emissiveNode`).

  Keep each pair next to each other in one function, `jellyMaterial(look, kind)`, so they can't drift apart.
- **Tone mapping and the background.** Under WebGPU, the clear colour and the fog are tone-mapped. Either turn tone mapping off for the background (draw it as a mesh with `toneMapped: false`, as the jar's sphere already is), or adjust the background colours for the WebGPU path. Check with screenshots side by side.
- **Order:** the welcome and lesson letters first (only classic materials, plus the Step 1 patch), then the Overview (only classic materials: toon, outlines, sprites), then the jar (two TSL ports), then presenter mode (it reuses `JellyStage`).

### Step 3: decide the default (small, but needs real machines)

- Measure on the actual old machines, plus one modern laptop, with a small `?renderer=webgpu&fps` overlay:
  - time to the first frame;
  - frames per second on the welcome screen, a full jar and the Overview;
  - how it feels while dragging a letter.
- **Make WebGPU the default only if it wins** on the machines that have it. Keep the classic renderer as the fallback for everyone else.
- **Move the fallback onto WebGPURenderer's WebGL2 backend** only if a later measurement on the old machines shows it at least equal there. That would give one code path, with TSL only and no GLSL.

### Step 4 (optional, large): extras only WebGPU can do

Caustics under the jar's jellies or the letters, ported from Jelly Baby's `gpu-caustics.js` (GPL-3.0, like us). And a bloom `RenderPipeline`. Only on the WebGPU path, and only after the old-machine check passes.

### Testing both paths

- **`tests/lib.mjs`** gets a `JELLY_RENDERER=webgpu` switch that launches Chromium with these flags and opens guides with `?renderer=webgpu`:
  ```
  --enable-unsafe-webgpu --enable-features=Vulkan --use-vulkan=swiftshader --use-webgpu-adapter=swiftshader
  ```
  SwiftShader then provides a WebGPU adapter. I checked this headless with Playwright's Chromium 141.
- **Run the suite twice** in CI or by hand: `fit`, `overview`, `jar`, `present`, `letters`. Add a check that `renderer.backend.isWebGPUBackend` really was WebGPU, so a silent fallback can't pass the WebGPU run.
- **A new `tests/render-perf.mjs`** (not pass/fail, like `perf.mjs`): ms per frame and time to the first frame for the letters, the jar and the Overview, on both renderers. The experiment's `perf.mjs` is a starting point.
- **Watch the Chromium version.** three r185 and later always pass `swizzle: 'rgba'` to `createView`. Playwright's Chromium 141 rejects that ("not of type GPUTextureComponentSwizzle"), so the WebGPU path failed after `init()` had succeeded. Those runs used `--enable-unsafe-webgpu`, which switches on experimental features, so a normal Chrome 141 may not hit this. The experiment strips the member with a test-only shim. Either update Playwright's Chromium, or keep the shim in `lib.mjs`.

### Sizes

| Step | Size | Notes |
|---|---|---|
| 0. Upgrade three.js | small | Verified to run. Review the screenshots |
| 1. Look upgrades on WebGL | small to medium | Mostly `makeLetter`, the letter material and the jar's `paintJelly`. Art direction is the slow part |
| 2. Factory and opt-in WebGPU | medium | `shell.html` (the stage and the factory), `overview-kit.js`, `jar-patch.py` (two TSL ports), import map, tests |
| 3. Decide the default | small | Needs the real old machines |
| 4. Caustics and bloom on WebGPU | large | Optional |

### Risks

1. **The benefit misses the old machines.** They mostly won't have WebGPU (section 3), so Steps 2 to 4 help only the children with newer computers. Step 1 helps everyone.
2. **Two renderers drift apart.** Tone-mapped backgrounds, shadow softness and edge refraction all differ, and every GLSL piece needs a TSL twin. Screenshot both in tests.
3. **three.js churn.** WebGPURenderer APIs were renamed in r173, r181, r182 and r183. Pin the version, and treat each upgrade as a task with both test runs.
4. **Browser coupling.** three r186's WebGPU backend uses newer WebGPU features, and failed on a 13-month-old Chromium, at least with experimental features switched on. Children on browsers that are a little old would hit that path, so the after-`init()` fallback in Step 2 is required, not optional.
5. **Startup on slow machines.** The WebGPU path downloads 730 KB of three.js (gzipped) instead of 417 KB. Its shaders are generated in JavaScript on the main thread. Several renderers on one page (the welcome letters, a lesson's letters, the jar, the Overview, presenter mode) each make their own GPU device and environment map.
6. **Hosting.** WebGPU inside claude.ai artifacts is untested. The fallback covers it.
7. **Performance rules** (`CLAUDE.md`): nothing may make the guides slower. Run the render-perf comparison for every step, and keep "things that stay still must sleep". A settled jar should skip `render()` altogether, on either renderer.

---

## The experiments

These are in the session scratch folder, `webgpu/`, not in the repo:

| File | What it is |
|---|---|
| `upstream/Jelly-Baby/` | A clone of Jelly Baby at `19fc6ea` |
| `exp/compare.src.html` | The experiment page. `exp/make.mjs` inlines the guides' font into it, giving `exp/compare.html`. It works from `file://` with a jsDelivr import map pinned to 0.186.1. It shows the word "jelly" four ways, each saying which backend really ran: (1) today's renderer and material; (2) WebGPURenderer with the same classic material; (3) WebGPURenderer with a TSL jelly (thickness per vertex, glow, dispersion, neutral tone mapping); (4) today's renderer with the same upgrades done in GLSL. `?force=webgl` forces the fallback, `?still` freezes the wobble, and `?perf=<panel>` times one panel |
| `exp/out/compare-webgpu.png`, `exp/out/compare-nogpu.png` | The four panels with and without a WebGPU adapter |
| `exp/perf.mjs`, `exp/out/perf*.txt` | The timings above |
| `exp/upgrade.mjs`, `exp/out/upgrade-*.png` | Shell Jelly on 0.169.0 and 0.186.1 (welcome, jar, Overview), one above the other |
| `exp/lib.mjs` | Launches Chromium with or without WebGPU, serves three.js from local npm copies, and holds the swizzle shim |
