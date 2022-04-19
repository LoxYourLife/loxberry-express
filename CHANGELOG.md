#### 1.0.3 (2022-04-19)

##### Other Changes

* **feat:**  add plugin url express path as a library method "expressPath" (3ddea197)
* **fix:**  Fix issue that template can't be rendered on async handlers (ef02bcda)
* **ci:**  adding some checks to new release command and use package config (ddbf3be4)

#### 1.0.1 (2022-04-10)

##### Other Changes (type)

* **fix:**
  *  Change devDependencies to dependencies (2186730c)
  *  Add missing Changelog file (9ad018ab)
* **ci:**  Commit Changelog also on prereleases (59a4ce53)

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
