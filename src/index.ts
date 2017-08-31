import { join } from 'path';
import * as fs from 'fs-extra';
import * as questions from './questions';
import { getPort, getMarkup } from './app-discovery';
import { pageUpdate } from './vf-page-update';
import getAppDetails from './app-details';

const debug = require('debug')('plugin-ember-cli:info index');

//Have to export this class because we are using the --declaration flag to generate type files,
//otherwise, our default export throws a fit about the class being "private".
export class Plugin {

	async pageConfig(name?: string) {

		let appDirectory = await questions.getAppDirectory();

		let appDetails = await getAppDetails(appDirectory);

		await questions.ensureLocationTypeSet(appDetails);
		await questions.ensureAppHasBeenBuilt(appDetails);

		name = await questions.getPageName(appDetails.name);

		let port = await getPort(appDirectory);
		
		//TODO: This can be overriden in Ember via the --output-path argument.
		let outputDirectory = join(appDirectory, 'dist');

		return { name, port, outputDirectory };
	}

	getHtmlMarkup(page) {
		return getMarkup(page);
	}

	onFileChange(org, page, file: string) {
		debug(`file in plugin => ${file}`);
		pageUpdate(org, page, file);
	}

}

export default new Plugin();