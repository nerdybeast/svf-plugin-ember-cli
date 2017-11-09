import { join } from 'path';
import * as fs from 'fs-extra';
import * as questions from './questions';
import { getMarkup, getAssetFileNames } from './app-discovery';
import { pageUpdate } from './vf-page-update';
import { getAppDetails, getPackageJson } from './app-details';
import { getVisualforceRecord, updateVisualforceRecord } from './utils';

const debug = require('debug')('@svf/plugin-ember-cli:info index');

//Have to export this class because we are using the --declaration flag to generate type files,
//otherwise, our default export throws a fit about the class being "private".
export class Plugin {

	async pageConfig() {

		let appDirectory = await questions.getAppDirectory();

		let appDetails = await getAppDetails(appDirectory);
		let name = await questions.getPageName(appDetails.name);

		await questions.ensureLocationTypeSet(appDetails);
		await questions.ensureAppHasBeenBuilt(appDetails);
		await questions.ensureStoreMetaInConfig(appDetails);
		
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
		pageUpdate(org, page);
	}

	async prepareForDevelopment(org, page) {

		//TODO: The cli needs to store the root app directory, not just the "dist" path, this is a hack...
		const appDirectory = join(page.outputDir, '..');

		let appDetails = await getAppDetails(appDirectory);
		await questions.ensureLocationTypeSet(appDetails);
		await questions.ensureAppHasBeenBuilt(appDetails);
		await questions.ensureStoreMetaInConfig(appDetails);

		pageUpdate(org, page);
	}

}

export default new Plugin();