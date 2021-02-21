#!/usr/bin/env node
var fs = require('fs');
var docopt = require('docopt-js').docopt;
var codeplay = require('../index');

function readHelp() {
  return fs.readFileSync(__dirname + '/usage.txt') + '';
}
function parseArg() {
  return docopt(readHelp());
}

var argv = parseArg();
codeplay.start({
  noneAsArgs: argv['--no-append'],
  allAsArgs: argv['--all-append'],
  filesPtn: argv['<files_ptn>'] || '*',
  cmdPtn: argv['<cmd_ptn>'] || '?'
});
