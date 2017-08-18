import * as inquirer from 'inquirer';

function ask(questions) {

	if(!Array.isArray(questions)) {
		questions = [questions];
	}

	return inquirer.prompt(questions);
}

export async function getPageName() {
	
	let answers = await ask({
		
		type: 'input',
		
		//TODO: Default to name of ember app
		name: 'pageName',

		message: 'Name of the new Visualforce page:'
	});

	return answers.pageName;
}

export async function getAppDirectory() {

	let answers = await ask({
		type: 'input',
		name: 'appDirectory',
		message: 'Path to the root directory of the ember app (the directory of the package.json file):'
	});

	return answers.appDirectory;
}