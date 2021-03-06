import * as inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as chalk from 'chalk';
import { join } from 'path';
import { AppDetails } from './interfaces/app-details';
import getAppDetails from './app-details';

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

			return true;
		}
	});

	return answers.appDirectory;
}

export async function ensureAppHasBeenBuilt(appDetails: AppDetails) : Promise<void> {

	if(appDetails.hasBeenBuilt) return;

	await ask({
		type: 'input',
		name: 'hasBeenBuilt',
		message: `Ember app found but it appears it hasn't been built yet, hit enter after building`,
		async validate(userInput) {
			let updatedDetails = await getAppDetails(appDetails.appDirectory);
			return updatedDetails.hasBeenBuilt || 'App not built yet';
		}
	});
}

export async function ensureLocationTypeSet(appDetails: AppDetails) : Promise<void> {

	if(appDetails.locationType.toLowerCase() === 'hash') return;

	let currentLocationType = chalk.yellow(`"${appDetails.locationType}"`);
	let envFilePath = chalk.cyan(`${appDetails.appDirectory}/config/environment.js`);

	await ask({
		type: 'input',
		name: 'locationTypeSet',
		message: `Incorrect location type of ${currentLocationType}. In order for an ember app to work properly on a Visualforce page, the ${chalk.yellow('locationType')} property in ${envFilePath} must be set to ${chalk.yellow('"hash"')} (example: ${chalk.yellow('"locationType": "hash"')}). Hit enter after modifying this property`,
		async validate(userInput) {
			let updatedDetails = await getAppDetails(appDetails.appDirectory);
			return updatedDetails.locationType.toLowerCase() === 'hash' || `Config property not yet set to ${chalk.yellow('"hash"')}, current value is ${chalk.yellow('"' + updatedDetails.locationType + '"')}`;
		}
	});
}