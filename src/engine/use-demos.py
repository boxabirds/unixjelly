# Each lesson's demo (V + 'demos.json'): what presenter mode records its videos from, and what the guide's
# play-through test plays through the page (tests/play.mjs). Run by a guide's build, after its lessons are in.
import json
for _id, _demo in json.load(open(V + 'demos.json')).items():
    rep(f"{{ id: '{_id}', ", f"{{ id: '{_id}', demo: {json.dumps(_demo, ensure_ascii=False)}, ")
