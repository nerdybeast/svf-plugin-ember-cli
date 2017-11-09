import * as fs from 'fs-extra';
import { join } from 'path';
import { AppDetails } from './interfaces/app-details';

const stripComments = require('strip-json-comments');
const debug = require('debug')('@svf/plugin-ember-cli app-details');
const tmpDir = join(__dirname, '../temp');

export async function getAppDetails(appDirectory: string) : Promise<AppDetails> {

	let [packageJson, locationType, hasBeenBuilt, buildConfig, metaStoredInConfig] = await Promise.all([
		getPackageJson(appDirectory),
		getLocationType(appDirectory),
		fs.pathExists(join(appDirectory, 'dist', 'index.html')),
		getBuildConfig(appDirectory),
		getStoreMetaInConfig(appDirectory)
	]);

	debug(`has been built yet => ${hasBeenBuilt}`);

	let name = <string>packageJson.name;
	debug(`app name from package.json => "${name}"`);

	let port = buildConfig.port || 4200;
	let outputPath = buildConfig.outputPath || 'dist';

	return { 
		name, 
		locationType, 
		hasBeenBuilt, 
		appDirectory, 
		port, 
		outputPath,
		metaStoredInConfig
	};
}

export async function getPackageJson(appDirectory: string) : Promise<any> {

	const fileName = 'package.json';

	try {

		return fs.readJson(join(appDirectory, fileName));

	} catch (error) {
		debug(`Error reading ${fileName} from ${appDirectory} => %o`, error);
		throw error;
	}
}

export async function getStoreMetaInConfig(appDirectory: string) : Promise<boolean> {
	
	let filePath = join(appDirectory, 'ember-cli-build.js');
	let emberCliBuildFile;

	try {
		
		emberCliBuildFile = (await fs.readFile(filePath)).toString();
		let regex = new RegExp(`storeConfigInMeta\\s*:\\s*(true|false)`, 'i');
		let result = regex.exec(emberCliBuildFile);
	
		return result !== null && result[1] === 'false';

	} catch (error) {
		debug(`Error parsing ${filePath} => %o`, error);
		debug(`${filePath} contents => %o`, emberCliBuildFile);
		return false;
	}
	
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