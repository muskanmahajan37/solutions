var fs = require('fs');
var Rx = require('rx');
Rx.Node = require('rx-node');
var Path = require('path');
var _ = require('lodash');

let solutionDir = "./test-data/";
function setFullPath(a, b) {
  return a + '/' + b;
}

var Observable = Rx.Observable;

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
// Asynchronously make the directory at the specified path.
// Automatically completes if the directory already exists.
//
function mkdir(path) {

  return Rx.Observable.create(function(observer){

    fs.exists(path, checkExistence);

    function complete(e) {
      if(e) return observer.onError(e);
      observer.onNext(path);
      observer.onCompleted();
    };

    function checkExistence(exists) {
      return exists ?
        complete() :
        fs.mkdir(path, complete);
    }
  });
}

//
// Writes the file to the path.
// Creates any directories in the path that don't already exist.
//
// The MIT License (MIT)
// Copyright (c) 2013 Paul Taylor

function writeFile(path, file) {

  // Create any directories that don't exist before writing the file.
  var dirs = path.split('/');
  if(dirs[0] === '.') dirs.pop();

  var makeDirsObs = Rx.Observable.fromArray(dirs)
    .scan(setFullPath)
    .selectMany(mkdir)
    .onErrorResumeNext(Observable.empty());

  var writeFileObs = Rx.Observable.create(function(observer){

    fs.writeFile(path, file, cb);

    function cb(e) {
      if(e) return observer.onError(e);

      var data = getFilenameMetaData(path);
      data.file = file;

      observer.onNext(data);
      observer.onCompleted();
    }
  });

  return makeDirsObs.ignoreElements().concat(writeFileObs);
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
  var solutions = [];
  var count = 1;
  getFilesObs(solutionDir, '.json')
    .select(parseFileObs)
    .concatAll()
    .select(function (fileAndContents) {
      return fileAndContents;
    }).subscribe(function (res) {
    solutions.push(res);
    if(solutions.length >= 5) {
      writeFile('dist/' + count + '.json', JSON.stringify(solutions)).subscribe(function (res) {
        console.log(res);
      });
      count ++;
    }
  });
}
generate();
