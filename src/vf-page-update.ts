import * as jsforce from 'jsforce';
import * as fs from 'fs-extra';
import { metaConfigPattern, search } from './regex';
const debug = require('debug')('@svf/plugin-ember-cli:info vf-page-update');

export async function pageUpdate(org, page, file: string) {

	try {

		file = file.trim();
		debug(`file => ${file}`);
	
		let conn = new jsforce.Connection({
			instanceUrl: org.instanceUrl,
			accessToken: org.accessToken
		});
	
		let [localFileRaw, apexPageQueryResult] = await Promise.all([
			fs.readFile(file),
			conn.query(`Select Id, Markup From ApexPage Where Id = '${page.salesforceId}'`)
		]);
	
		let localFile = localFileRaw.toString('utf8');
		let remoteFile = apexPageQueryResult.records[0].Markup;
	
		debug(`local file ${file} => %o`, localFile);
		debug(`remote file ${page.name} => %o`, remoteFile);
	
		let localFileMeta = search(metaConfigPattern, localFile);
		let remoteFileMeta = search(metaConfigPattern, remoteFile);
	
		let hasChange = true;
	
		debug(`remote content => %o`, remoteFileMeta[0]);
		debug(`local meta => %o`, localFileMeta[0]);
	
		if(remoteFileMeta.length === 0) {
			hasChange = false;
		} else if(remoteFileMeta[0] !== localFileMeta[0]) {
			remoteFile = remoteFile.replace(remoteFileMeta[0], localFileMeta[0]);
		} else {
			hasChange = false;
		}
	
		if(!hasChange) return;
	
		debug(`new vf page markup => %o`, remoteFile);
	
		let pageUpdate = await conn.sobject('ApexPage').update({
			Id: page.salesforceId,
			Markup: remoteFile
		});
	
		debug(`vf page update result => %o`, pageUpdate);

	} catch (error) {
		debug(`vf page update error => %o`, error);
	}
}