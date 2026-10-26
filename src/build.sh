#!/usr/bin/env bash
# Builds every guide from source and writes each one into its folder at the top of the repo.
# Run it from anywhere: ./src/build.sh
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build

# 1. The shared engine: Jelly Shell's page plus the patches every guide inherits.
python3 engine/base-patch.py
# 2. Each other guide starts from that page and swaps in its own lessons, tools and styles.
python3 guides/git/build.py
python3 guides/web/build.py
python3 guides/shell2/build.py
python3 guides/security/build.py

# 3. Put in the jelly letters' font, check the script is valid JavaScript, and wrap it as a full HTML page.
guide() {
  local name=$1 font=$2 folder=$3
  node tools/inline-font.mjs "build/$name.src.html" "fonts/$font" "build/$name.html"
  sed -n '/<script type="module">/,/<\/script>/p' "build/$name.html" | sed '1d;$d' > "build/$name.check.mjs"
  node --check "build/$name.check.mjs"
  mkdir -p "../$folder"
  {
    printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>[hidden]{display:none!important}body{margin:0}img{max-width:100%%}</style>\n'
    awk '/^<div class="gate" role="alert">/{print "</head>\n<body>"} {print}' "build/$name.html"
    printf '</body>\n</html>\n'
  } > "../$folder/index.html"
  echo "built $folder/index.html"
}
guide jelly-shell titan.json jellyshell
guide jelly-shell2 titan-shell2.json jellyshell2
guide jelly-git titan.json jellygit
guide jelly-web titan-web.json jellyweb
guide jelly-security titan.json jellysecurity

# 4. Stamp the version and a fingerprint of the guides on the landing page.
python3 tools/stamp-version.py ../index.html
