[![Node.js CI](https://github.com/LoxYourLife/loxberry-express/actions/workflows/node.js.yml/badge.svg)](https://github.com/LoxYourLife/loxberry-express/actions/workflows/node.js.yml)


# Loxberry Express Server Plugin

This plugin allows you to create loxberry plugins easily with nodeJS and [ExpressJS] as the backend server.
Normally plugins can be written using Pearl or PHP. NodeJs was possible even before this plugin by providing everything yourself. Websockets can be handled as well.

**Attention**
> The functionality comes as a pluin to the loxberry. If you want to rely on this in your plugin, you need to check if the express plugin is installed on the target loxberry system. In case it's not installed, the installation routine should not be interruped. A check should be done while accessing the plugin. Here is a small example.

webfrontend/htmlauth/index.cgi
```perl
#!/usr/bin/perl

require LoxBerry::Web;
use LoxBerry::System;
use CGI;

# This is to check if the express plugin is installed and in case it's not

# it will print an error with the hint that the unifi_presence plugin requires

# the express plugin.

my $minRequiredVersion = "0.0.4";
my $unvalidVersion = "0.1.0";
my $version = LoxBerry::System::pluginversion("express");

if ($version && $version ge $minRequiredVersion && $version lt $unvalidVersion) {
my $q = CGI->new;
print $q->header(-status => 307, -location => '/admin/express/plugins/unifi_presence');
exit(0);
}

my $template = HTML::Template->new(
    filename => "$lbptemplatedir/error.html",
global_vars => 1,
loop_context_vars => 1,
die_on_bad_params => 0,
);
$template->param( REQUIRED_VERSION => $minRequiredVersion);
$template->param( MAX_VERSION => $unvalidVersion);

%L = LoxBerry::System::readlanguage($template, "language.ini");
LoxBerry::Web::lbheader("<Plugin name>", "", "");
print $template->output();
LoxBerry::Web::lbfooter();
```

templates/error.html
```html
<h3><TMPL_VAR COMMON.MISSING_PLUGIN></h3>
<p style="color: red">
  <TMPL_VAR COMMON.REQUIRE_EXPRESS_1>
  <a href="https://loxwiki.atlassian.net/wiki/spaces/LOXBERRY/pages/1673527328/Express+Server
" target="_blank"><TMPL_VAR COMMON.EXPRESS_PLUGIN> (&gt;=<TMPL_VAR REQUIRED_VERSION> & &lt; <TMPL_VAR MAX_VERSION>)</a>
  <TMPL_VAR COMMON.REQUIRE_EXPRESS_2>
<p>
```

language_files
```ini
// templates/lang/language_de.ini
[COMMON]
MISSING_PLUGIN="Fehlendes Plugin"
REQUIRE_EXPRESS_1="Dieses Plugin benötigt das"
REQUIRE_EXPRESS_2="Plugin. Du kannst es entweder installieren oder das Plugin deinstallieren."
EXPRESS_PLUGIN="Express Server"

// templates/lang/language_en.ini
[COMMON]
MISSING_PLUGIN="Missing Plugin"
REQUIRE_EXPRESS_1="This plugin reguires the"
REQUIRE_EXPRESS_2="plugin. Either install the required plugin or uninstall this one."
EXPRESS_PLUGIN="Express Server"
```

## Installation

For installation you can check the releases page of GitHub or the official documentation in the [Loxwiki].

## How does it work

The idea of the plugin is to provide an [ExpressJs] Server where you can hook into. To do that, your plugin needs an `express.uth.js` and/or a `express.js` file in `webfrontend/htmlauth/express`. Those file is automatically picked up by the server as soon as it's receiving a request for your plugin. The difference to those files is, that for `express.auth` you need to be logged in into loxberry and for `express` not. It's basically the same as `html` and `htmlauth` for typical plugins.

To let Express handle your requests you need to apply the `index.cgi` as mentioned in the pervious chapter. There we check for the existence of Express and the correct versions.

The Express Server runs at port 3300 by default and can be changed after installation and allows your plugin to hook into the url path `/admin/express/plugins/:name` for authoried requests and `/express/plugins/:name` for unauthorized requests. The Name is the plugin defined `folder_name` from the plugin configuration file `plugin.cfg`. You should only use those 2 urls and never use a port directly. The ports can be changed and could be different for each installation.

*Attention:*
> Your express.js file is cached during the execution time of the server. Every server restart clears the cache und picks up the file again. During `postupgrade` your plugin should and have to send a curl request to the express server to invalidate the cache. This needs to be done after the dependencies are installed. `curl -X POST http://localhost/admin/express/system/plugin/<plugin_name>

The module provides also some metrics and the possibility to `start`, `stop` and `restart` the express server. On top all the live logs are provided that you can check for errors and issues easily while developing.

![Screenshot](docs/screen.jpg)

The [ExpressJs] server comes with the [Handlebars] template enginge and the Loxberry layout is provided by default. 

Sometime you want to use Websockets, and now that's as easy as defining a route. You can even provide multiple websockets for different purposes in case you want to.
_Attention:_
> Websockets do only work in `express.js` and per url `/express/plugins/<plugin_name>/<path>` do to limitations of websocket with basic auth.

### Express.js handler

To hook into the express server, the handler file needs to export a function. There is an object passed as a parameter list. The function needs to return the router to be able to work. The paramers are equal for `express.js` and `express.auth.js`

Parameters:
* router: The express router to specify your routes / url pathes you want to handle
* expressStatic: a symlink to [express.static]
* logger: A logger class with `info`, `debug`, `warn` and `error` methods. See Logger section.
* _: the lodash library
* translate: a function to access the tranlations like `translate('hello')`

You can decide which parameter you need by using destructing. Let's assume you just want to use the router: `module.exports = ({router}) => {...`. An example with router logger and lodash would look like this: `module.exports = ({router, logger, _}) => { ...`.


```js
module.exports = ({router, static}) => {
  return router;
};
```

#### Providing a route
```js
module.exports = ({router}) => {
  router.get('/', (req, res) => {
    res.send('ok'); // for normal text content
    res.json({hello: 'world'}); // for json content
    res.render('index', {title: 'MyPluginTitle'}); // to use handlebars template engine
  });
  return router;
};
```

You can of course return more than just one route
```js
module.exports = ({router}) => {
  router.get('/', (req, res) => {
    res.render('index', {title: 'MyPluginTitle'});
  });
  router.get('/hello/:name', (req, res) => {
    res.json({hello: req.params.name});
  });
  return router;
};
```

Everything you can do on router level in express you can also do in your plugin.

### Websockets

The Websocket implementation is a custom one inspired by the `express-ws` library. Websockets only work unauthorized at the moment due to limitations with websocket and basic auth. Every websocket definition in `express.auth.js` will not work. To define a websocket handler in your express file, you can use `router.ws` instead of `router.get`. The provided arguments are:
* the socket
* the request
* a next function

```js
// IMPORTANT: express.js NOT express.auth.js
const clients = [];
module.exports = ({router, logger}) => {
  router.ws('/foo', (ws, request, next) => {
    ws.on('open', () => clients.push(ws));
    ws.on('message', (message) => {
      logger.debug(`received message: ${message}`);
      ws.send(message.toString());
    });
  });

  return router;
};
```

[express.js of this plugin](webfrontend/htmlauth/express.js)


### Translation files

with express you also have the possibility to use translations if you like to. Like other plugins your translation files
need to be placed into `templates/lang/`. Every js file in there get's picked up and the name of the file represents
the language. For english you need to place a file named `en.js`. The File is a normal js file and returns a json format
 with key value pairs. The key is then used to access the translation using the `translate` function in node or `{{t 'key'}}` in handlebars.

#### File Content

```js
module.exports = {
  key: 'value'
  anotherKey: 'another value {{name}}'
}
translate('key') // value
translate('anotherKey', {name: 'foo'}) // another value foo
```

### Handlebars template engine

This is the default template engine for the express server and currently the only one. The view/template files are 
located in `templates` directory in your plugin. Every file need the filextension `*.hbs`.

templates/index.hbs
```html
<h1>This is my First Template</h1>
```
To render the file you ned to use `res.render` in the the `express.js` file: `res.render('index', {title: 'Foobar'})`. 
The template is then redered within the loxberry layout. When you use the layout, always provide at least the title.

You can also render your own page, without the layout. Therefore you need to specify `{layout: false}` in the render method.
`res.render('index', {layout: false})`.

The LoxBerry layout has 3 variables you can specify:
* title: the Page title and title for the header
* LB_helpLink: A url for further documentation to your plugin
* LB_help: a template to render (not yet specified and checked)

Those properties are equal to `Loxberry::Web::lbheader($template_title, $helpurl, $helptemplate);`.
More on this on the [Loxberry Documentation](https://www.loxwiki.eu/display/LOXBERRY/LoxBerry%3A%3AWeb%3A%3Albheader)

#### Render with placeholder variables
To know how the syntax for [Handlebars] works, i'd recomment to checkout their documentation.
Here is a basic example:
```
// templates/index.hbs
<h1>{{myTitle}}</h1>
<div>Hello {{name}}</div>

// express.js
res.render('index', {title:'My Page title', myTitle: 'Hello World Demo', name: 'Foobar'});

// output wrapped in Layout
<h1>Hello World Demo<h1>
<div>Hello Foobar</div>
```

The simplified layout would look like this: (title is replaced with "My Page Title" and body is replaced with your
index.hbs view.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{title}}</title>
</head>
<body>
  {{{body}}}
</body>
</html>
```
#### Render with translation files

To access the translation files there is a magic helper named `t`. With that helper you cann access the translations.
[i18next] is used as a translation helper and you can take advantage of their documentation.

```js
module.exports = {
  helloWorld: 'Hello World'
  hello: 'Hello {{name}}'
}
```

```html
<h1>{{t 'helloWorld'}}</h1>
<h2>{{t 'hello' name='Foo'}}</h2>
```

## Logger

The plugin uses a custom Logger class for a unified logfile. This logfile is than used to show the logs on the plugin page. Loggers are separated by the plugin who uses the logger. The express plugin flags all entries with "Express" whereas a plugin "my_cool_plugin" would be flaged with "My Cool Plugin".
This works by default, you and don't need to think about this.

The logfiles are stored in `LBHOME/logs/plugins/express/` and separated.
Errors will be written into `express-errors.log` and normal logs into `express.log`.

In the interface of the express server you can set a loglevel which is given for all plugins. It's maybe not the best approach, but accepted for now.

### Log methods
* info(message: String)
* debug(message: String)
* warn(message: String)
* error(message: String, error: Exception)

[ExpressJs]: https://expressjs.com/
[Apache2]: https://httpd.apache.org/
[mod_rewrite]: https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html
[mod_proxy]: https://httpd.apache.org/docs/2.4/mod/mod_proxy.html
[Handlebars]: https://handlebarsjs.com/
[i18next]: https://www.i18next.com/]
[express.static]: https://expressjs.com/de/starter/static-files.html
[postinstall]: https://www.loxwiki.eu/pages/viewpage.action?pageId=23462653#Pluginf%C3%BCrdenLoxberryentwickeln(abVersion1.x)-Rootverzeichnis-Datei:postinstall.shYellowOptional
[preroot]: https://www.loxwiki.eu/pages/viewpage.action?pageId=23462653#Pluginf%C3%BCrdenLoxberryentwickeln(abVersion1.x)-Rootverzeichnis-Datei:preroot.shYellowOptional
[Loxwiki]: https://loxwiki.atlassian.net/wiki/spaces/LOXBERRY/pages/1673527328/Express+Server
