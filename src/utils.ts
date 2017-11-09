const debug = require('debug')('@svf/plugin-ember-cli app-details');

import * as fs from 'fs-extra';
import * as jsforce from 'jsforce';

export async function getDirectoryContents(appDirectory: string) : Promise<string[]> {
	
	const fileNames = () => {
		return new Promise((resolve, reject) => {
			fs.readdir(appDirectory, (error, files) => {
				if(error) return reject(error);
				return resolve(files);
			});
		});
	};

	try {
		return (<Promise<string[]>>fileNames());
	} catch (error) {
		debug(`Error getting contents of ${appDirectory} => %o`, error);
		throw error;
	}
}

export async function getVisualforceRecord(org, page) {

	try {

		let conn = new jsforce.Connection({
			instanceUrl: org.instanceUrl,
			accessToken: org.accessToken
		});

		let visualforcePages = await conn.query(`Select Id, Markup From ApexPage Where Id = '${page.salesforceId}'`);

		return visualforcePages.records[0];

	} catch (error) {
		debug(`Error getting visualforce page record => %o`, error);
		throw error;
	}
}