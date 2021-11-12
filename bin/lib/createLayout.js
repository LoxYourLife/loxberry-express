const jayson = require('jayson/promise');
const fs = require('fs').promises;
const path = require('path');
const PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = async () => {
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
    const client = jayson.client.http('http://localhost:80/admin/system/jsonrpc.php');
    const batch = [
      client.request('LBWeb::get_lbheader', ['{{title}}', '{{LB_helpLink}}', '{{LB_help}}'], undefined, false),
      client.request('LBWeb::get_lbfooter', [], undefined, false)
    ];
    const response = await client.request(batch);

    if (response.length === 2) {
      template = `${response[0].result}\t\t\t\t\t{{{body}}}\n\t\t\t\t\t${response[1].result}`;
    }
  }

  const handle = await fs.open(path.resolve(__dirname, '../views/layouts/main.hbs'), 'w');
  await handle.write(template);
  await handle.close();
};
