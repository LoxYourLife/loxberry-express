#### 1.0.0 (2022-04-10)

**Features**

- Ability to change the configured ports
- Ability to set the default log level
- Separation from setting and log in the UI
- Ability to force restart in case of an error
- Ability to open logs in a new tab
- Ability to purge log files
- Plugins don't need to add a .htaccess anylonger
- New NPM Module for local plugin development based on express [Loxberry Express Dev Server](https://www.npmjs.com/package/loxberry-express-dev-server)

**Breaking changes**

- Split between unauthenticated and authenticated requests
- New fixed routes: /express (`express.js`) and /admin/express (`express.auth.js`)
- Websockets only work in non authenticated layer (`express.js`)
- Enforcing submodule `express` in `webfrontend/htmlauth`
