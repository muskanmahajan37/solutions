var fs = require('fs');
var Rx = require('rx');
Rx.Node = require('rx-node');
var Path = require('path');
var _ = require('lodash');

var Observable = Rx.Observable;
var observableProto = Observable.prototype;

let solutionDir = "./test-data/";
let encoding = 'utf-8';
function setFullPath(a, b) {
  return a + '/' + b;
}


function getFilenameMetaData(path) {

  var extension = Path.extname(path);

  return {
    extension: Path.extname(path),
    name: Path.basename(path, extension),
    location: Path.dirname(path),
    path: path
  }
}

//
// Asynchronously reads the files in the directory as an Array.
//
// The MIT License (MIT)
// Copyright (c) 2013 Paul Taylor

function readdir(dir) {

  return Rx.Observable.create(function (observer) {
    fs.readdir(dir, cb);

    function cb(e, files) {
      if (e) files = [];
      files = _.map(files, _.partial(setFullPath, dir));
      observer.onNext(files);
      observer.onCompleted();
    }
  });
}

//
// Asynchronously reads the file at the path.
//
// The MIT License (MIT)
// Copyright (c) 2013 Paul Taylor

function readfile(path) {
  let encoding = 'utf-8';
  return Rx.Observable.create(function (observer) {

    fs.readFile(path, encoding, cb);

    function cb(e, file) {
      if (e) return observer.onError(e);

      var data = getFilenameMetaData(path || '');
      data.file = file;
      observer.onNext(data);
      observer.onCompleted();
    }
  });
}

function getFilesObs(dir, filter) {
  return Rx.Observable.create(function (observer) {
    readdir(dir).subscribe(function (files) {
      for (var k in files) {
        if (!filter || files[k].indexOf(filter) > 0) {
          observer.onNext(files[k]);
        }
      }
      observer.onCompleted();
    });
  });
}

/**
 * @param {String} file
 */
function parseFileObs(file) {
  return Rx.Observable.create(function (observer) {
    readfile(file).subscribe(function (fileData) {
      var contents = JSON.parse(fileData.file);
      if (contents.length > 1) {
        _.each(contents, function (content) {
          observer.onNext(content);
        });
      } else if (contents.length === 1) {
        observer.onNext(contents[0]);
      }
      observer.onCompleted();
    });
  });
}

function generate() {
  getFilesObs(solutionDir, '.json')
    .select(parseFileObs)
    .concatAll()
    .select(function (fileAndContents) {
      return fileAndContents;
    }).subscribe(function (res) {
    console.log(res);
  });
}
generate();
