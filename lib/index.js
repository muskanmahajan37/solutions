import fs from 'fs-extra';
var Rx = require('rx');
Rx.Node = require('rx-node');
var th2 = require('through2');

let solutionDir = "./test-data/";

function readFiles(dirname) {
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      onError(err);
      return;
    }

    var solutions = {};

    filenames.forEach(function (filename) {
      var filePath = solutionDir + filename;
      var file = fs.createReadStream(filePath).on('error', console.log.bind(console, 'fs err'));

      var transform = th2(function (ch, en, cb) {
        cb(null, ch.toString());
      }).on('error', function (err) {
        console.log(err, err.toString());
      });

      // rx-node has convenience functions (another way)
      Rx.Node.fromTransformStream(transform).share()
        .map(value => JSON.parse(value.toString()))
        .subscribe(function (value) {
          console.log(value);
          solutions[filename] = value;
        });

      file.pipe(transform);
    });
  });
}

export default function generate() {
  readFiles(solutionDir);
}

generate();
