var exec = require("child_process").exec;
var fs = require("fs");
var cuid = require("cuid");
var colors = require("colors");

exports.stats = false;

exports.compileCPP = function (envData, code, fn) {
  var filename = cuid.slug();
  path = "./temp/";

	var useros = envData.OS;
	var fileEnd;
	if(envData.OS == "windows")
		fileEnd = ".exe";
	else 
		fileEnd = ".out"; 

  fs.writeFile(path + filename + ".cpp", code, function (err) {
    if (exports.stats) {
      if (err) console.log("Error: ".red + err);
      else {
        console.log("Info: ".green + filename + ".cpp created");
        if (envData.cmd === "g++") {
          commmand =
            "g++ " + path + filename + ".cpp -o " + path + filename + fileEnd;
          exec(commmand, function (error, stdout, stderr) {
            if (error) {
              if (exports.stats) {
                console.log(
                  "Info: ".green +
                    filename +
                    ".cpp failed to compile"
                );
              }
              var out = { error: stderr };
              fn(out);
            } else {
              var progNotFinished = true;
              var tempcommand = "cd temp & " + filename;
              exec(tempcommand, function (error, stdout, stderr) {
                if (error) {
                  if (
                    error
                      .toString()
                      .indexOf("Error: stdout maxBuffer exceeded.") != -1
                  ) {
                    var out = {
                      error:
                        "Error: stdout maxBuffer exceeded.",
                    };
                    fn(out);
                  } else {
                    if (exports.stats) {
                      console.log(
                        "Info: ".green +
                          filename +
                          ".cpp failed to execute"
                      );
                    }

                    var out = { error: stderr };
                    fn(out);
                  }
                } else {
                  if (progNotFinished) {
                    progNotFinished = false; 
                    if (exports.stats) {
                      console.log(
                        "Info: ".green +
                          filename +
                          ".cpp is running"
                      );
                    }
                    var out = { output: stdout };
                    fn(out);
                  }
                }
              });
              if (envData.options.timeout) {
                setTimeout(function () {
                  exec(
                    "taskkill /im " + filename + fileEnd + " /f > nul",
                    function (error, stdout, stderr) {
                      if (progNotFinished) {
                        progNotFinished = false; 
                        if (exports.stats) {
                          console.log(
                            "Info: ".green +
                              filename +
                              fileEnd + " was killed after " +
                              envData.options.timeout +
                              "ms"
                          );
                        }
                        var out = { timeout: true };
                        fn(out);
                      }
                    }
                  );
                }, envData.options.timeout);
              }
            }
          });
        } else if (envData.cmd === "gcc") {
          //compile c code
          commmand =
            "gcc " + path + filename + ".cpp -o " + path + filename + fileEnd;
          exec(commmand, function (error, stdout, stderr) {
            if (error) {
              if (exports.stats) {
                console.log(
                  "Info: ".green +
                    filename +
                    ".cpp contained an error while compiling"
                );
              }
              var out = { error: stderr };
              fn(out);
            } else {
              exec(path + filename + fileEnd, function (error, stdout, stderr) {
                if (error) {
                  if (
                    error
                      .toString()
                      .indexOf("Error: stdout maxBuffer exceeded.") != -1
                  ) {
                    var out = {
                      error:
                        "Error: stdout maxBuffer exceeded. You might have initialized an infinite loop.",
                    };
                    fn(out);
                  } else {
                    if (exports.stats) {
                      console.log(
                        "Info: ".green +
                          filename +
                          ".cpp contained an error while executing"
                      );
                    }
                    var out = { error: stderr };
                    fn(out);
                  }
                } else {
                  if (exports.stats) {
                    console.log(
                      "Info: ".green +
                        filename +
                        ".cpp is running"
                    );
                  }
                  var out = { output: stdout };
                  fn(out);
                }
              });
            }
          });
        } else {
          console.log("ERROR: ".red + "unrecognized execution command ");
        }
      }
    } 
  });
};

exports.compileCPPWithInput = function (envData, code, input, fn) {
  var filename = cuid.slug();
  path = "./temp/";

  var fileE;
	if(envData.OS == "windows")
		fileE = ".exe";
	else 
		fileE = ".out";
  fs.writeFile(path + filename + ".cpp", code, function (err) {
    if (exports.stats) {
      if (err) console.log("ERROR: ".red + err);
      else {
        console.log("Info: ".green + filename + ".cpp created");
        if (envData.cmd === "g++") {
          //compile c code
          commmand =
            "g++ " + path + filename + ".cpp -o " + path + filename + fileE;
          exec(commmand, function (error, stdout, stderr) {
            if (error) {
              if (exports.stats) {
                console.log(
                  "Info: ".green +
                    filename +
                    ".cpp contained an error while compiling"
                );
              }
              var out = { error: stderr };
              fn(out);
            } else {
              if (input) {
                var inputfile = filename + "input.txt";

                fs.writeFile(path + inputfile, input, function (err) {
                  if (exports.stats) {
                    if (err) console.log("ERROR: ".red + err);
                    else
                      console.log(
                        "Info: ".green + inputfile + " (inputfile) created"
                      );
                  }
                });
                var progNotFinished = true;
                var tempcommand;
                if(envData.OS == "windows")
                  tempcommand = "cd temp & " + filename;
                else 
                  tempcommand = "cd temp && ./" + filename;

                exec(
                  tempcommand + "<" + inputfile,
                  function (error, stdout, stderr) {
                    if (error) {
                      if (
                        error
                          .toString()
                          .indexOf("Error: stdout maxBuffer exceeded.") != -1
                      ) {
                        var out = {
                          error:
                            "Error: stdout maxBuffer exceeded.",
                        };
                        fn(out);
                      } else {
                        if (exports.stats) {
                          console.log(
                            "Info: ".green +
                              filename +
                              ".cpp contained an error while executing"
                          );
                        }
                        var out = { error: stderr };
                        fn(out);
                      }
                    } else {
                      if (progNotFinished) {
                        progNotFinished = false;
                        if (exports.stats) {
                          console.log(
                            "Info: ".green +
                              filename +
                              ".cpp is running"
                          );
                        }
                        var out = { output: stdout };
                        fn(out);
                      }
                    }
                  }
                );
                if (envData.options.timeout) {
                  setTimeout(function () {
                    exec(
                      "taskkill /im " + filename + fileE + "/f > nul",
                      function (error, stdout, stderr) {
                        if (progNotFinished) {
                          progNotFinished = false;
                          if (exports.stats) {
                            console.log(
                              "Info: ".green +
                                filename +
                                fileE + " was killed after " +
                                envData.options.timeout +
                                "ms"
                            );
                          }
                          var out = { timeout: true };
                          fn(out);
                        }
                      }
                    );
                  }, envData.options.timeout);
                }
              } //input not provided
              else {
                if (exports.stats) {
                  console.log(
                    "Info: ".green + "Input mission for " + filename + ".cpp"
                  );
                }
                var out = { error: "Input Missing" };
                fn(out);
              }
            }
          });
        } else if (envData.cmd == "gcc") {
          //compile c code
          commmand =
            "gcc " + path + filename + ".cpp -o " + path + filename + fileE;
          exec(commmand, function (error, stdout, stderr) {
            if (error) {
              if (exports.stats) {
                console.log(
                  "Info: ".green +
                    filename +
                    ".cpp contained an error while compiling"
                );
              }
              var out = { error: stderr };
              fn(out);
            } else {
              if (input) {
                var inputfile = filename + "input.txt";

                fs.writeFile(path + inputfile, input, function (err) {
                  if (exports.stats) {
                    if (err) console.log("ERROR: ".red + err);
                    else
                      console.log(
                        "Info: ".green + inputfile + " (inputfile) created"
                      );
                  }
                });

                exec(
                  path + filename + fileE+ " < " + path + inputfile,
                  function (error, stdout, stderr) {
                    if (error) {
                      if (
                        error
                          .toString()
                          .indexOf("Error: stdout maxBuffer exceeded.") != -1
                      ) {
                        var out = {
                          error:
                            "Error: stdout maxBuffer exceeded. You might have initialized an infinite loop.",
                        };
                        fn(out);
                      } else {
                        if (exports.stats) {
                          console.log(
                            "Info: ".green +
                              filename +
                              ".cpp contained an error while executing"
                          );
                        }
                        var out = { output: stderr };
                        fn(out);
                      }
                    } else {
                      if (exports.stats) {
                        console.log(
                          "Info: ".green +
                            filename +
                            ".cpp successfully compiled and executed !"
                        );
                      }
                      var out = { output: stdout };
                      fn(out);
                    }
                  }
                );
              }
              else {
                if (exports.stats) {
                  console.log(
                    "Info: ".green + "Input missing for " + filename + ".cpp"
                  );
                }
                var out = { error: "Input Missing" };
                fn(out);
              }
            }
          });
        } else {
          console.log("ERROR: ".red + "unrecognized command");
        }
      } 
    } 
  }); 
}; 
