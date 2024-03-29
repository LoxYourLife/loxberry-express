const fs = require('fs').promises;
const path = require('path');
const PRODUCTION = process.env.NODE_ENV === 'production';
const { getHeader, getFooter } = require('./jsonRpc');

module.exports = async (logger) => {
  let template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{title}}</title>
</head>
<body>
  {{{body}}}
</body>
</html>`;

  if (PRODUCTION) {
    try {
      const header = await getHeader();
      const footer = await getFooter();

      const fixedHeader = header
        .replaceAll('{{', '\\{{')
        .replaceAll('\\{{title', '{{title')
        .replaceAll('\\{{LB_helpLink', '{{LB_helpLink')
        .replaceAll('\\{{LB_help', '{{LB_help');

      template = `${fixedHeader}\t\t\t\t\t{{{body}}}\n\t\t\t\t\t${footer.replaceAll('{{', '\\{{')}`;
    } catch (error) {
      logger.error('Fetching Layout failed', error);
    }
  }

  const handle = await fs.open(path.resolve(__dirname, '../../views/layouts/main.hbs'), 'w');
  await handle.write(template);
  await handle.close();
};
