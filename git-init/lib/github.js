// access token management
const CLI = require("clui");
const { Octokit } = require("@octokit/rest");
const Spinner = CLI.Spinner;

const inquirer = require("./inquirer");

module.exports = {
  async getPersonalAccessToken() {
    const credentials = await inquirer.askGithubCredentials();
    const status = new Spinner("Authenticating you, please wait...");

    status.start();

    try {
      const octokit = new Octokit({
        userAgent: credentials.username,
        auth: credentials.password,
        previews: ["jean-grey", "symmetra"],
        timeZone: "Europe/Amsterdam",
        baseUrl: "https://api.github.com",
        log: {
          debug: () => {},
          info: () => {},
          warn: console.warn,
          error: console.error,
        },
      });

      const { data } = await octokit.repos.get({
        owner: "daint2git",
        repo: "react-shared-components",
      });
      // console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      status.stop();
    }
  },
};
