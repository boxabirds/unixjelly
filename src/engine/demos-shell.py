# Jelly Shell's lesson demos (src/guides/shell/demos.json): what presenter mode (present-patch.py) records its
# videos from, and what tests/shell.mjs plays through the page. One list per lesson, one action per frame.
# Actions: a command; @tab:text types and presses Tab, @enter presses Enter, @up recalls, @ctrlc stops.
import json
for _id, _demo in json.load(open('guides/shell/demos.json')).items():
    rep(f"id: '{_id}', word:", f"id: '{_id}', demo: {json.dumps(_demo, ensure_ascii=False)}, word:")
