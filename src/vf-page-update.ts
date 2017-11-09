import * as jsforce from 'jsforce';
import * as fs from 'fs-extra';
import { join } from 'path';
import { metaConfigPattern, search } from './regex';
import { getVisualforceRecord, updateVisualforceRecord } from './utils';
import { getPackageJson } from './app-details';
import { getMarkup, getAssetFileNames, removeMetaTagConfig } from './app-discovery';

const debug = require('debug')('@svf/plugin-ember-cli:info vf-page-update');

export async function pageUpdate(org, page) {

	try {

		let visualforcePageRecord = await getVisualforceRecord(org, page);
		let markup = visualforcePageRecord.Markup;
		let markupCopy = new String(markup);

		markup = removeMetaTagConfig(markup);
		markup = await updateAssetTags(org, page, markup);

		if(markup !== markupCopy) {
			visualforcePageRecord.Markup = markup;
			await updateVisualforceRecord(org, visualforcePageRecord);
		}

	} catch (error) {
		debug(`vf page update error => %o`, error);
	}
}

async function updateAssetTags(org, page, markup: string) : Promise<string> {

	//TODO: The cli needs to store the root app directory, not just the "dist" path, this is a hack...
	const appDirectory = join(page.outputDir, '..');

	let [packageJson, fileNames] = await Promise.all([
		getPackageJson(appDirectory),
		getAssetFileNames(appDirectory)
	]);

	let prefix = `/assets/`;
	let vendorJsRegex = new RegExp(`${prefix}vendor.*\\.js`, 'i');
	let vendorCssRegex = new RegExp(`${prefix}vendor.*\\.css`, 'i');
	let appJsRegex = new RegExp(`${prefix}${packageJson.name}.*\\.js`, 'i');
	let appCssRegex = new RegExp(`${prefix}${packageJson.name}.*\\.css`, 'i');

	fileNames.forEach(fileName => {
		
		fileName = `${prefix}${fileName}`;
		
		if(vendorJsRegex.exec(fileName)) {
			markup = markup.replace(vendorJsRegex, fileName);
		}

		if(vendorCssRegex.exec(fileName)) {
			markup = markup.replace(vendorCssRegex, fileName);
		}

		if(appJsRegex.exec(fileName)) {
			markup = markup.replace(appJsRegex, fileName);
		}

		if(appCssRegex.exec(fileName)) {
			markup = markup.replace(appCssRegex, fileName);
		}

	});

	return markup;
}