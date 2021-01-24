// command-line user interaction
const inquirer = require("inquirer");

module.exports = {
  askGithubCredentials() {
    const questions = [
      {
        name: "username",
        type: "input",
        message: "Enter your Github username or e-mail address:",
        validate(value) {
          if (value.length) return true;
          return "Please enter your username or e-mail address.";
        },
      },
      {
        name: "password",
        type: "input",
        message: "Enter your password:",
        validate(value) {
          if (value.length) return true;
          return "Please enter your password.";
        },
      },
    ];

    return inquirer.prompt(questions);
  },
};
