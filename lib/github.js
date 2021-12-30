const CLI = require('clui');
const Configstore = require('configstore');
const { Octokit } = require('@octokit/rest');
const Spinner = CLI.Spinner;
const { createTokenAuth } = require("@octokit/auth-token");

const inquirer = require('./inquirer');
const pkg = require('../package.json');
const { conforms } = require('lodash');

const conf = new Configstore(pkg.name);

let octokit;

module.exports = {
    getInstance: () => {
        return octokit;
    },

    getStoredGithubToken: () => {
        return conf.get('github.token');
    },

    getPersonalAccessToken: async () => {
        const credentials = await inquirer.askGithubCredentials();
        const status = new Spinner('Authenticating you, please wait...');

        status.start();

        const auth = createTokenAuth(credentials.token);

        try {
            const { token } = await auth();

            if (token) {
                conf.set('github.token', token);
                return token;
            } else {
                throw new Error('GitHub token was not found in the response');
            }
        } finally { status.stop(); }
    },

    githubAuth: (token) => {
        octokit = new Octokit({
            auth: token
        });
    }
};