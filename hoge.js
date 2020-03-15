const { execFile } = require("child_process");

execFile("echo", ["$PATH"], {shell: true}, (err, stdout, stderr) => {
  console.log(err, stdout, stderr);
});
