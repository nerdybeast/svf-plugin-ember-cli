import { join } from 'path';
import * as fs from 'fs-extra';
import * as questions from './questions';
import { getMarkup } from './app-discovery';
import { pageUpdate } from './vf-page-update';
import getAppDetails from './app-details';

const debug = require('debug')('@svf/plugin-ember-cli:info index');

//Have to export this class because we are using the --declaration flag to generate type files,
//otherwise, our default export throws a fit about the class being "private".
export class Plugin {

	async pageConfig(name?: string) {

		let appDirectory = await questions.getAppDirectory();

		let appDetails = await getAppDetails(appDirectory);
		name = await questions.getPageName(appDetails.name);

		await questions.ensureLocationTypeSet(appDetails);
		await questions.ensureAppHasBeenBuilt(appDetails);
		
		let outputDirectory = join(appDirectory, appDetails.outputPath);

		return { 
			name, 
			port: appDetails.port, 
			outputDirectory
		};
	}

	getHtmlMarkup(page) {
		return getMarkup(page);
	}

	async onFileChange(org, page, file: string) {
		
		debug(`file in plugin => ${file}`);

		if(!file.endsWith('index.html')) return;

		pageUpdate(org, page, file);
	}

}

export default new Plugin();