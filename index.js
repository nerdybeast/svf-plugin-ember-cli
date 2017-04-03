'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const jsforce = require('jsforce');
const debug = require('debug')('simple-vf-plugin:ember-cli:info index');

module.exports = function(org, page, file) {

	file = file.trim();
	debug(`file => ${file}`);

    if(!file.endsWith('dist\\index.html')) return;

    let conn = new jsforce.Connection({
		instanceUrl: org.instanceUrl,
		accessToken: org.accessToken
	});

    Promise.props({
        localFile: fs.readFileAsync(file),
        vfPageRecord: conn.query(`Select Id, Markup From ApexPage Where Id = '${page.salesforceId}'`)
    }).then(hash => {

        let localFile = hash.localFile.toString('utf8');
        let remoteFile = hash.vfPageRecord.records[0].Markup;

        debug(`local file ${file} => %o`, localFile);
        debug(`remote file ${page.name} => %o`, remoteFile);

        const pattern = /\<\s*meta.*config\/environment.*(\/>|\>\s*\<\/\s*meta\s*\>)/;

        let localFileMeta = new RegExp(pattern, 'gi').exec(localFile) || [];
        let remoteFileMeta = new RegExp(pattern, 'gi').exec(remoteFile) || [];

        let hasChange = true;

        debug(`remote content => %o`, remoteFileMeta[0]);
        debug(`local meta => %o`, localFileMeta[0]);

        if(remoteFileMeta.length === 0) {
            //remote$('title').after(localMeta);
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