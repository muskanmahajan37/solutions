#!/usr/bin/env node
var solutions = require('../dist/');
var program = require('commander');
var pjson = require('../package.json');

program
  .version(pjson.version)
  .option('-p, --path', 'set JSON files path')
  .option('-s, --size', 'set each JSON file size')
  .parse(process.argv);
gi
if (program.path && program.size) {
  solutions.generate(program.path, program.size);
}
