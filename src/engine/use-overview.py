# Every guide with an Overview (Jelly Shell, Git, Web): swap the engine's old Town for the Overview kit and the
# guide's own world (V + 'overview.js'). The stepper then just asks the Overview to show a step.
rep("import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';",
    "import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';\nimport { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';")
region('class Town {', '/* ---------------- section 2: backstage show', open('engine/overview-kit.js').read() + '\n' + open(V + 'overview.js').read() + '\n')
rep("    town.step = i; town.resetView(); const s = TOWN_STEPS[i];", "    town.go(i); town.resetView(); const s = TOWN_STEPS[i];")
rep("""    if (s.fly) { town.fly(s.fly[0], s.fly[1], s.fly[2]); sound.boing(500, .3, .08); town.onLand = () => { if (s.screen) town.drawScreen(s.screen); sound.blip(); }; }
    else { town.curve = null; town.packet.visible = town.packetLabel.visible = false; }
    if (i === 0) town.drawScreen(['kid@jelly:~$ _']);
""", "")
