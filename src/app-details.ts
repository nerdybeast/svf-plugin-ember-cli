import * as fs from 'fs-extra';
import { join } from 'path';
import { AppDetails } from './interfaces/app-details';

const stripComments = require('strip-json-comments');
const debug = require('debug')('@svf/plugin-ember-cli app-details');
const tmpDir = join(__dirname, '../temp');

export default async function(appDirectory: string) : Promise<AppDetails> {

	let [packageJson, locationType, hasBeenBuilt, buildConfig] = await Promise.all([
		fs.readJson(join(appDirectory, 'package.json')),
		getLocationType(appDirectory),
		fs.pathExists(join(appDirectory, 'dist', 'index.html')),
		getBuildConfig(appDirectory)
	]);

	debug(`has been built yet => ${hasBeenBuilt}`);

	let name = <string>packageJson.name;
	debug(`app name from package.json => "${name}"`);

	let port = buildConfig.port || 4200;
	let outputPath = buildConfig.outputPath || 'dist';

	return { name, locationType, hasBeenBuilt, appDirectory, port, outputPath };
}

async function getLocationType(appDirectory: string) : Promise<string> {
	
	let envFilePath = join(appDirectory, 'config', 'environment.js');
	let modulePath = await copyEnvironmentModule(envFilePath);
	let envModule = await import(modulePath);
	
	let env = envModule();
	debug('ember app env => %o', env);

	return env.locationType;
}

async function ensureTempDir() : Promise<void> {

	try {
		
		await fs.ensureDir(tmpDir);
		await fs.emptyDir(tmpDir);

	} catch (error) {
		debug(`Error creating/emptying temp directory ${tmpDir} => %o`, error);
		throw error;
	}
}

async function copyEnvironmentModule(environmentJsPath: string) : Promise<string> {

	try {

		let timeStamp = (new Date()).getTime();
		let newEnvironmentJsPath = join(tmpDir, `environment-${timeStamp}.js`);

		await ensureTempDir();
		await fs.copy(environmentJsPath, newEnvironmentJsPath);

		debug(`new environment.js path => ${newEnvironmentJsPath}`);
		return newEnvironmentJsPath;

	} catch (error) {
		debug(`Error copying over the environment.js file to the temp directory => %o`, error);
		throw error;
	}
}

async function getBuildConfig(appDirectory: string) : Promise<any> {

	try {
		
		let commandLineFileContents = (await fs.readFile(join(appDirectory, '.ember-cli'))).toString();
		let config = JSON.parse(stripComments(commandLineFileContents));
		debug('.ember-cli build config => %o', config);

		return config;
		
	} catch (error) {
		debug('error retrieving the .ember-cli build config => %o', error);
		throw error;
	}
}