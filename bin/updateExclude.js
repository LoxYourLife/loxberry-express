const path = require('path');
const fs = require('fs');

if (process.argv.length != 3 || !['set', 'remove'].includes(process.argv[2])) {
  console.log('missing command parameter, node updateExclude.js set|remove');
  process.exit();
}
const updateExclude = path.resolve(process.env.LBHOMEDIR, 'config/system/update-exclude.userdefined');
const command = process.argv[2];
const htmlExpress = 'webfrontend/html/express';
const htmlAuthExpress = 'webfrontend/htmlauth/express';

const buffer = fs.readFileSync(updateExclude);
const content = buffer.toString();

const hasHtml = content.indexOf(htmlExpress) !== -1;
const hasHtmlauth = content.indexOf(htmlAuthExpress) !== -1;

if (command === 'set') {
  if (!hasHtml || !hasHtmlauth) {
    let content = '\n';
    if (!hasHtml) content += htmlExpress + '\n';
    if (!hasHtmlauth) content += htmlAuthExpress;

    fs.appendFileSync(updateExclude, content);
  }
} else if (command === 'remove') {
  const lines = content.split('\n');
  const newLines = lines.filter((line) => !line.startsWith(htmlExpress) && !line.startsWith(htmlAuthExpress));

  if (newLines.length != lines.length) {
    fs.writeFileSync(updateExclude, newLines.join('\n'));
  }
}
