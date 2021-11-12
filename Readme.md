# Loxberry Express Server Plugin

This plugin allows you to create loxberry plugins easily with nodeJS and [ExpressJS] as the backend server.
Normally plugins can be written using Pearl or PHP. NodeJs was possible even before this plugin by providing everything
yourself.

## How does it work

The idea of the plugin is to provide an [ExpressJs] Server where you can hook into. To do that, your plugin needs an
`epress.js` file in `webfrontend/htmlauth`. Additionally you need to let [Apache2] know, that you want to use the express
server instead of apache. This is done using [Apache2] [mod_rewrite] and [mod_proxy] module.

The module provides also some metrics for now and the possibility to `start`, `stop` and `restart` the express server.
On top all the live logs are provided that you can check for errors and issues easily while developing.

The [ExpressJs] server comes additionally with [Handlebars] template enginge. The default Loxberry layout is provided by 
default. 

### Express.js hook

To hook into the express server, the file needs to export a function. There is an object passed as a parameter containing
the router and a function to render static content. The function needs to return the router to be able to work.
```
module.exports = ({router, static}) => {
  return router;
};
```

#### Providing a route
```
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
```
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

[express.js of this plugin](./blob/master/webfrontend/htmlauth/express.js)

### Rewrite Rules for Apache to use Express

You need to tell [Apache2] that you want to use express and your url path should be redirected to Express.
Therefore you need to write an `.htaccess` file. The file will be placed inside `webfrontend/htmlauth` folder.
Let's assume you write a plugin called "foobar", then the url to the plugin page would be `/admin/plugins/foobar/`. 
By default the index.cgi file in the folder `webfrontend/htmlauth` would be used to render the page. If you want to 
use the default `router.get('/'...)` route you need to specify a redirect rule. ''Please keep in mind that tose rules
only work relatively from `/admin/plugin/foobar/`. Only everything after the main route can be used.

```
RewriteEngine On # this is required
RewriteRule ^index.cgi http://localhost:3000/plugins/express [P,L] #the redirect
```

If you want to redirect all content:
```
RewriteEngine On
RewriteRule ^index.cgi http://localhost:3000/plugins/express [P,L]
RewriteRule ^(.\*) http://localhost:3000/plugins/express/$1 [P,L]
```

Let's assume you just want to use `/admin/plugins/foobar/my-express-routes` for the express server.
```
RewriteEngine On
RewriteRule ^index.cgi http://localhost:3000/plugins/express [P,L]
RewriteRule ^my-express-routes/(.\*) http://localhost:3000/plugins/express/$1 [P,L]
```

### Handlebars template engine

This is the default template engine for the express server and currently the only one. The view/template files are 
located in `webfrontend/htmlauth/views` directory in your plugin. Every file need the filextension `*.hbs`.

views/index.hbs
```
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
// views/index.hbs
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

```
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


[ExpressJs]: https://expressjs.com/
[Apache2]: https://httpd.apache.org/
[mod_rewrite]: https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html
[mod_proxy]: https://httpd.apache.org/docs/2.4/mod/mod_proxy.html
[Handlebars]: https://handlebarsjs.com/