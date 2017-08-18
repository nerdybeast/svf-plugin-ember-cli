import { join } from 'path';
import * as questions from './questions';
import { getPort } from './app-discovery';

//Have to export this class because we are using the --declaration flag to generate type files,
//otherwise, our default export throws a fit about the class being "private".
export class Plugin {

	async pageConfig(name?: string) {

		if(!name) name = await questions.getPageName();

		let appDirectory = await questions.getAppDirectory();
		let port = await getPort(appDirectory);
		
		//TODO: This can be overriden in Ember via the --output-path argument.
		let outputDirectory = join(appDirectory, 'dist');

		return { name, port, outputDirectory };
	}

	onFileChange(file: string) {
		console.info('file in plugin => ', file);
	}

}

export default new Plugin();