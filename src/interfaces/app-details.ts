export interface AppDetails {
	name: string;
	locationType: string;
	hasBeenBuilt: boolean;
	appDirectory: string;
	port: number;
	outputPath: string;

	//Used to remove the config <meta> tag from the index.html file, this has to be transfered to the visualforce page by regexing
	//the dist/index.html file for this tag and then updating the visualforce page which is not ideal.
	//See: https://ember-cli.com/user-guide/#application-configuration
	metaStoredInConfig: boolean;
}