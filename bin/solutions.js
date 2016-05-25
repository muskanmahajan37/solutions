#!/usr/bin/env node
var solutions = require('../dist/');
var program = require('commander');
var pjson = require('../package.json');

program
  .version(pjson.version)
  .option('-i, --input <string>', 'set input JSON files path')
  .option('-o, --output <string>', 'set output JSON files path')
  .option('-s, --size <n>', 'set each JSON file size', parseInt)
  .parse(process.argv);

if (program.input && program.size && program.output) {
  console.log('input dir:' + program.input);
  console.log('output dir:' + program.output);
  console.log('page size:' + program.size);
  solutions.generate(program.input, program.output, program.size);
}
