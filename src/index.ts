import { join } from 'path';
import * as fs from 'fs-extra';
import * as questions from './questions';
import { getMarkup, getAssetFileNames } from './app-discovery';
import { pageUpdate } from './vf-page-update';
import { getAppDetails, getPackageJson } from './app-details';
import { getVisualforceRecord } from './utils';

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
		pageUpdate(org, page, file);
	}

	async prepareForDevelopment(org, page) {

		//TODO: The cli needs to store the root app directory, not just the "dist" path, this is a hack...
		const appDirectory = join(page.outputDir, '..');

		let appDetails = await getAppDetails(appDirectory);
		await questions.ensureLocationTypeSet(appDetails);
		await questions.ensureAppHasBeenBuilt(appDetails);
		await questions.ensureStoreMetaInConfig(appDetails);

		let [appName, fileNames, visualforcePageRecord] = await Promise.all([
			getPackageJson(appDirectory),
			getAssetFileNames(appDirectory),
			getVisualforceRecord(org, page)
		]);

		let visualforcePage = visualforcePageRecord.Markup;
		let visualforcePageCopy = new String(visualforcePage);
		let prefix = `/assets/`;
		let vendorJsRegex = new RegExp(`${prefix}vendor.*\.js`, 'i');
		let vendorCssRegex = new RegExp(`${prefix}vendor.*\.css`, 'i');
		let appJsRegex = new RegExp(`${prefix}${appName}.*\.js`, 'i');
		let appCssRegex = new RegExp(`${prefix}${appName}.*\.css`, 'i');

		fileNames.forEach(fileName => {
			
			fileName = `${prefix}${fileName}`;
			
			if(vendorJsRegex.exec(fileName)) {
				visualforcePage = visualforcePage.replace(vendorJsRegex, fileName);
			}

			if(vendorCssRegex.exec(fileName)) {
				visualforcePage = visualforcePage.replace(vendorCssRegex, fileName);
			}

			if(appJsRegex.exec(fileName)) {
				visualforcePage = visualforcePage.replace(appJsRegex, fileName);
			}

			if(appCssRegex.exec(fileName)) {
				visualforcePage = visualforcePage.replace(appCssRegex, fileName);
			}

		});

		debug(`"updated" visualforce page markup => %o`, visualforcePage);
		debug(`visualforce page change detected => ${visualforcePage !== visualforcePageCopy}`);
	}

}

export default new Plugin();