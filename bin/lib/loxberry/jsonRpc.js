const jayson = require('jayson/promise');

const client = jayson.Client.http('http://localhost/admin/system/jsonrpc.php');
// const client = jayson.Client.http({
//   host: '10.10.1.4',
//   path: '/admin/system/jsonrpc.php',
//   auth: 'user:pass'
// });

const request = async (method, params, id) => {
  try {
    const response = await client.request(method, params, id);
    if (response.error) {
      throw response.error.message;
    }
    if (response.result) return response.result;
  } catch (e) {
    throw Error('Loxberry JsonRpc not available.', e);
  }
};

module.exports = {
  request: client.request,
  getHeader: () => request('LBWeb::get_lbheader', ['{{title}}', '{{LB_helpLink}}', '{{LB_help}}'], undefined),
  getFooter: () => request('LBWeb::get_lbfooter', [], undefined),
  getLanguage: () => request('LBWeb::lblanguage', [], undefined)
};
