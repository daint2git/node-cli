const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const parseArgs = require("minimist");

const files = require("./lib/files");
const github = require("./lib/github");

clear();

console.log(
  chalk.yellow(figlet.textSync("git-init", { horizontalLayout: "full" }))
);

if (files.directoryExists(".git")) {
  console.log(chalk.red("Already a Git repository."));
  process.exit();
}

// (async () => {
//   await github.getPersonalAccessToken();
// })();

console.log(parseArgs(process.argv.slice(2)));

// dang lam toi Creating a Repository
