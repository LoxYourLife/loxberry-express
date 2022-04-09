# Loxberry Express Dev Server

This is a simple express dev sever which allows you to develop your express loxberry plugin locally.

## Installation

`npm i --save-dev loxberry-express-dev-server`

## Usage in your plugin

There is a how to guide on how to develop a plugin for loxberry with node.js. [Develop Loxberry Plugin With NodeJs]

To get started you can use the plugin generator with:
`npm init loxberry-plugin <your plugin name>`

When you choose NodeJs, the dev server is automatically added as a dependency.

In case you want to do that yourself, add a script to your package json to run the server:
```json
"scripts": {
  "dev": "loxberryExpressDevServer ./"
}
```

For a better coding experience you can install nodemon and restart the server on file changes.

`npm i --save-dev nodemon`
```json
"scripts": {
  "dev": "nodemon --watch webfrontend/htmlauth --watch templates --exec 'node_modules/.bin/loxberryExpressDevServer' -- ./"
}
```

The Dev Server will be in sync with the [Loxberry Express Server] plugin.

[Develop Loxberry Plugin With NodeJs]: https://loxwiki.atlassian.net/wiki/spaces/LOXBERRY/pages/1673625653/Node+JS+Plugin+Entwicklung´
[Loxberry Express Server]: https://loxwiki.atlassian.net/wiki/spaces/LOXBERRY/pages/1673527328/Express+Server

