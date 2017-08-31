import * as jsforce from 'jsforce';
import * as fs from 'fs-extra';
import { metaConfigPattern, search } from './regex';
const debug = require('debug')('plugin-ember-cli:info vf-page-update');

export function pageUpdate(org, page, file: string) {

	file = file.trim();
	debug(`file => ${file}`);

    if(!file.endsWith('dist\\index.html')) return;

    let conn = new jsforce.Connection({
		instanceUrl: org.instanceUrl,
		accessToken: org.accessToken
	});

    Promise.all([
        fs.readFile(file),
        conn.query(`Select Id, Markup From ApexPage Where Id = '${page.salesforceId}'`)
	]).then(results => {

        let localFile = results[0].toString('utf8');
        let remoteFile = results[1].records[0].Markup;

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

        if(!hasChange) return Promise.resolve();

        debug(`new vf page markup => %o`, remoteFile);

        return conn.sobject('ApexPage').update({
            Id: page.salesforceId,
            Markup: remoteFile
        });

    }).then(result => {
        debug(`vf page update result => %o`, result);
    }).catch(err => {
        debug(`vf page update err => %o`, err);
    });

}