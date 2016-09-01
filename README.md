[![Build Status](https://secure.travis-ci.org/twigjs/twig.js.svg)](http://travis-ci.org/#!/richardedens/moonlightui)

# moonlightui

Moonlight UI is a lightweight SPA and user interfaces framework based on JavaScript / CSS and HTML.

### Docs

Documentation is available in the [MoonlightUI website](http://moonlightui.com) on Github.

### Feature Support

This will be included in a later stage once we reached version 1.0 status.

# Releases

Download the latest MoonlightUI release from github: https://github.com/richardedens/moonlightui/releases

## Installation

MoonlightUI can be installed as a bower package with:

    bower install moonlightui

Include moonlightui in your page with the following code:

```html
<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript" src="dist/js/moonlightui.min.js"></script>
        <link href="dist/css/moonlightui.min.css" media="all" rel="stylesheet"></link>
    </head>
    <body>
        <!-- ... markup for moonlighui ... -->
        <script type="text/javascript" src="app.js"></script>
    </body>
</html>
```

### Working on the source yourself

To start working on the source yourself you first need to install external libraries from NPM with.

  npm install

Then use grunt to watch the SASS and JavaScript files.

  grunt

### Serving with expresss

Inside the project you are able to serve the /docs/index.html with the following command.

  grunt serve
  
# Contributing

If wish to contribute feel free to fork on this repository and submit a pull request on Github. The source files are located in src/js/*.js.

## License

Moonlightui is available under the [MIT License][mit], see the LICENSE file for more information.

## Acknowledgments

The following external libraries are included into moonlightui.

[jQuery]:       https://jquery.com/
[jQuery UI]:    https://jqueryui.com/
[jsPlumb]:      https://jsplumbtoolkit.com/
[jsTree]:       https://jstree.com/
[async]:        http://caolan.github.io/async/
[PrismJS]:      http://prismjs.com/
[mit]:          http://www.opensource.org/licenses/mit-license.php
