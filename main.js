var exec = require("child_process").exec;
var fs = require("fs");
var cuid = require("cuid");
var colors = require("colors");
var code = require("./code.js");

exports.stats = false;

exports.init = function (option) {
  if (option) {
    if (option.stats === true) {
      console.log("".green);
      exports.stats = true;
    }
  }
  fs.exists("./temp", function (exists) {
    if (!exists) {
      if (exports.stats) {
        console.log("INFO: ".cyan + "init code directory".cyan);
      }
      fs.mkdirSync("./temp");
    }
  });
};

exports.runCode = function (envData, code, fn) {
  if (exports.stats) code.stats = true;
  code.askRun(envData, code, fn);
};

exports.runInput = function (envData, code, input, fn) {
  if (exports.stats) code.stats = true;
  code.askRunInput(envData, code, input, fn);
};

exports.flushSync = function () {
  path = "	./temp/";
  fs.readdir(path, function (err, files) {
    if (!err) {
      for (var i = 0; i < files.length; i++) {
        fs.unlinkSync(path + files[i]);
      }
    }
  });
};

exports.flush = function (fn) {
  path = "./temp/";
  fs.readdir(path, function (err, files) {
    if (!err) {
      for (var i = 0; i < files.length; i++) {
        fs.unlinkSync(path + files[i]);
      }
    }
  });
  fn();
};

exports.getStats = function (fn) {
  var up = process.uptime();
  var c = 0;
  var files = fs.readdirSync("temp");
  for (var i in files) {
    var s = fs.statSync("temp/" + files[file]);
    if (s.isFile()) if (files[i].indexOf(".cpp") !== -1) c++;
  }
  var ex = {
    uptime: up,
    cppfiles: c,
  };
  if (exports.stats) {
    var data =
      "== Stats ==\nUptime: " + up + "\nC++ Files Found: " + c + "\n== End ==";
    console.log(data);
  }
  fn(ex);
};
