import fs from 'fs';
const src = fs.readFileSync(process.argv[2], 'utf8'), font = fs.readFileSync(process.argv[3], 'utf8');
fs.writeFileSync(process.argv[4], src.replace('/*FONT_JSON*/', font));
