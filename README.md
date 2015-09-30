# codeplay

**A simple code watcher**

We write and test our code with modern tools, such as [this](https://github.com/gulpjs/gulp), [this](http://gruntjs.com/sample-gruntfile), [this](https://github.com/brunch/brunch/blob/master/docs/config.md), [this](https://github.com/facebook/fb-flo), [this](https://atom.io/packages/build), [this](http://sublime-text-unofficial-documentation.readthedocs.org/en/latest/reference/build_systems/configuration.html) and [this](https://www.jetbrains.com/idea/help/creating-and-editing-run-debug-configurations.html). Sometimes, I want something lighter — just a one-liner; no configuration.

```bash
# watch working directory, run code smartly by file extension
> codeplay

# focus on some of scripts
> codeplay 'crawl-*.py'

# watch source codes, run test if they change
> codeplay -n 'src/*.js' 'node_modules/mocha/bin/mocha test/index.js'
```
Then, you can play with the code in your favorite editor.

## Installation

```
npm install -g codeplay
```
