/* Next-routes allows us to set up dynamic routing, where the address of the campaign
is part of the path. REQUIRED - server.js script to tell next.js to use this file/routes
that we set up. */

const routes = require('next-routes')();

routes
  .add('/campaigns/new', '/campaigns/new')
  .add('/campaigns/:address', 'campaigns/show')
  .add('/campaigns/:address/requests', '/campaigns/requests/index')
  .add('/campaigns/:address/requests/new', '/campaigns/requests/new');

module.exports = routes;
