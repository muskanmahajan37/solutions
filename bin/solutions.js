#!/usr/bin/env node
var solutions = require('../dist/');
var program = require('commander');
var pjson = require('../package.json');

program
  .version(pjson.version)
  .option('-p, --path <string>', 'set JSON files path')
  .option('-s, --size <n>', 'set each JSON file size', parseInt)
  .parse(process.argv);

if (program.path && program.size) {
  console.log(program.path, program.size);
  solutions.generate(program.path, program.size);
}
