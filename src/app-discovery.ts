import * as fs from 'fs-extra';
import { join } from 'path';
const stripComments = require('strip-json-comments');

export async function getPort(pathToApp: string) : Promise<number> {

	let defaultPort = 4200;

	try {
		let commandLineFileContents = (await fs.readFile(join(pathToApp, '.ember-cli'))).toString();
		let config = JSON.parse(stripComments(commandLineFileContents));
		return config.port || defaultPort;
	} catch (error) {
		console.log(error);
		return defaultPort;
	}
}