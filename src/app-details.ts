import * as fs from 'fs-extra';
import { join } from 'path';
import { AppDetails } from './interfaces/app-details';

const debug = require('debug')('@svf/plugin-ember-cli app-details');

export default async function(appDirectory: string) : Promise<AppDetails> {

	let [packageJson, locationType, hasBeenBuilt] = await Promise.all([
		fs.readJson(join(appDirectory, 'package.json')),
		getLocationType(appDirectory),
		fs.pathExists(join(appDirectory, 'dist', 'index.html'))
	]);

	debug(`has been built yet => ${hasBeenBuilt}`);

	let name = <string>packageJson.name;
	debug(`app name from package.json => "${name}"`);

	return { name, locationType, hasBeenBuilt, appDirectory };
}

async function getLocationType(appDirectory: string) : Promise<string> {
	let envFilePath = join(appDirectory, 'config', 'environment.js');
	let contents = (await fs.readFile(envFilePath)).toString();
	let locationType = /locationType\s*\:\s*(\`|\'|\")(.*)(\`|\'|\")/i.exec(contents)[2];
	debug(`locationType of ${envFilePath} => "${locationType}"`);
	return locationType;
}