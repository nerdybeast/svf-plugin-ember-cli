const debug = require('debug')('@svf/plugin-ember-cli app-details');

import * as fs from 'fs-extra';
import * as jsforce from 'jsforce';

export function getDirectoryContents(dir: string) : Promise<string[]> {
	
	debug(`directory to read contents from => ${dir}`);

	const fileNames = () => {
		return new Promise((resolve, reject) => {
			fs.readdir(dir, (error, files) => {
				if(error) return reject(error);
				return resolve(files);
			});
		});
	};

	try {
		return (<Promise<string[]>>fileNames());
	} catch (error) {
		debug(`Error getting contents of ${dir} => %o`, error);
		throw error;
	}
}

export async function getVisualforceRecord(org, page) {

	try {

		let conn = getJsforceConnection(org);

		let visualforcePages = await conn.query(`Select Id, Markup From ApexPage Where Id = '${page.salesforceId}'`);

		return visualforcePages.records[0];

	} catch (error) {
		debug(`Error getting visualforce page record => %o`, error);
		throw error;
	}
}

export async function updateVisualforceRecord(org, record) {

	try {

		let conn = getJsforceConnection(org);
		let updateResult = await conn.sobject(record.attributes.type).update(record);

		if(!updateResult.success) {
			throw new Error(updateResult.errors.join(', '));
		}

	} catch (error) {
		debug(`Error updating visualforce page record => %o`, error);
		throw error;
	}
}

function getJsforceConnection(org) {
	return new jsforce.Connection({
		instanceUrl: org.instanceUrl,
		accessToken: org.accessToken
	});
}
