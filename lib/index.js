import fs from 'fs-extra';

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
      fs.readFile(dirname + filename, 'utf-8', function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}

let solutionDir = "./test-data/";

export default function generate () {
    readFiles(solutionDir,
    (name, content) => console.log(name, content),
    error => console.log(error));
}

generate();
