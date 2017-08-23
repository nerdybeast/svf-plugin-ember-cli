import * as inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as chalk from 'chalk';
import { join } from 'path';

const camelcase = require('lodash.camelcase');
const upperfirst = require('lodash.upperfirst');

function ask(questions) {

	if(!Array.isArray(questions)) {
		questions = [questions];
	}

	return inquirer.prompt(questions);
}

export async function getPageName(emberAppName: string) {

	emberAppName = upperfirst(camelcase(emberAppName));

	let answers = await ask({
		type: 'input',
		name: 'pageName',
		message: `Name of the new Visualforce page (default: ${chalk.cyan(emberAppName)})`
	});

	return answers.pageName || emberAppName;
}

export async function getAppDirectory() {

	let answers = await ask({
		type: 'input',
		name: 'appDirectory',
		message: 'Path to the root directory of the ember app:',
		async validate(userInput) {

			let pathExists = await fs.pathExists(userInput);
			if(!pathExists) return `The directory ${chalk.cyan(userInput)} was not found`;

			let isEmberApp = await fs.pathExists(join(userInput, 'ember-cli-build.js'));
			if(!isEmberApp) return `The directory ${chalk.cyan(userInput)} doesn't appear to contain an ember app`;

			//TODO: move this into its own question so that the user doesn't have to keep re-entering the path over and over.
			let hasBeenBuilt = await fs.pathExists(join(userInput, 'dist', 'index.html'));
			if(!hasBeenBuilt) return `Ember app found but it appears it hasn't been built yet, please build the app and then try again`;

			return true;
		}
	});

	return answers.appDirectory;
}