import { Command } from "commander";
import chalk from "chalk";
import envinfo from "envinfo";
import inquirer from "inquirer";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
import execa from "execa";
import Listr from "listr";
import figlet from "figlet";

const access = promisify(fs.access);
const copy = promisify(ncp);

let projectName;

async function init() {
  console.log(
    chalk.green(figlet.textSync("g5 create-app", { horizontalLayout: "full" })),
  );

  const program = new Command("name1")
    .version("1.0.0")
    .arguments("<project-directory>")
    .usage(`${chalk.green("<project-directory>")} [options]`)
    .option("--info", "print environment debug info")
    .action((name) => {
      projectName = name;
    })
    .allowUnknownOption()
    .on("--help", () => {
      console.log(
        `    Only ${chalk.green("<project-directory>")} is required.`,
      );
    })
    .parse(process.argv);

  const programOptions = program.opts();

  if (programOptions.info) {
    console.log(chalk.bold("\nEnvironment Info:"));
    console.log(`  running from ${__dirname}`);

    return envinfo
      .run(
        {
          System: ["OS", "CPU"],
          Binaries: ["Node", "npm", "Yarn"],
          Browsers: ["Chrome", "Edge", "Firefox", "Safari"],
        },
        {
          duplicates: true,
          showNotFound: true,
        },
      )
      .then(console.log);
  }

  console.log(chalk.black("prompt for options"));
  const options = await promptForOptions();
  await createProject({
    ...options,
    projectName,
  });
}

async function promptForOptions() {
  const defaultTemplate = "JavaScript";
  const questions = [
    {
      type: "list",
      name: "template",
      message: "Please choose which project template to use",
      choices: ["JavaScript", "TypeScript"],
      default: defaultTemplate,
    },
    {
      type: "confirm",
      name: "git",
      message: "Initialize a git repository?",
      default: false,
    },
  ];

  const answers = await inquirer.prompt(questions);

  return {
    template: answers.template,
    git: answers.git,
  };
}

async function copyTemplateFiles(options) {
  return copy(options.templateDirectory, options.targetDirectory, {
    clobber: false,
  });
}

async function initGit(options) {
  const result = await execa("git", ["init"], {
    cwd: options.targetDirectory,
  });

  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
  }

  return;
}

async function installDependencies(options) {
  const result = await execa("yarn", ["install"], {
    cwd: options.targetDirectory,
  });

  if (result.failed) {
    return Promise.reject(new Error("Failed to install dependencies"));
  }

  return;
}

async function createProject(options) {
  const targetDirectory = path.resolve(process.cwd(), options.projectName);

  fs.mkdirSync(targetDirectory);

  options = {
    ...options,
    targetDirectory: targetDirectory,
  };

  const templateDirectory = path.resolve(
    __dirname,
    "../templates",
    `${options.template.toLowerCase()}-template`,
  );

  options.templateDirectory = templateDirectory;

  try {
    await access(templateDirectory, fs.constants.R_OK);
  } catch {
    console.error("%s Invalid template name", chalk.red.bold("ERROR"));
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: "Copy project files",
      task: () => copyTemplateFiles(options),
    },
    {
      title: "Initialize git",
      task: () => initGit(options),
      enabled: () => options.git,
    },
    {
      title: "Install dependencies",
      task: () => installDependencies(options),
      skip: () =>
        !options.runInstall
          ? "Pass --install to automatically install dependencies"
          : undefined,
    },
  ]);

  await tasks.run();

  console.log("%s Project ready", chalk.green.bold("DONE"));
  return true;
}

init();
