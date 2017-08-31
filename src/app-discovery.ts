import * as fs from 'fs-extra';
import { join } from 'path';
import * as rex from './regex';

export async function getMarkup(page) {

	let htmlFileContents = (await fs.readFile(join(page.outputDir, 'index.html'))).toString();
	
	htmlFileContents = removeUnneededTags(htmlFileContents);

	let metaTags = rex.search(rex.metaTagPattern, htmlFileContents);
	htmlFileContents = normalizeMetaTagEndings(htmlFileContents, metaTags);

	let linkAssetTags = rex.search(rex.assetLinkTagPattern, htmlFileContents);
	htmlFileContents = convertLinkTagsToStaticResource(htmlFileContents, linkAssetTags, page.name);

	let scriptAssetTags = rex.search(rex.assetScriptTagPattern, htmlFileContents);
	htmlFileContents = convertScriptTagsToStaticResource(htmlFileContents, scriptAssetTags, page.name);

	return htmlFileContents;
}

function removeUnneededTags(htmlContents: string) : string {
	htmlContents = removeLiveReloadScriptTag(htmlContents);
	htmlContents = removeDoctypeTag(htmlContents);
	return htmlContents;
}

function removeDoctypeTag(htmlContents: string) : string {
	return removeTags(htmlContents, rex.doctypeTagPattern, '\n');
}

function removeLiveReloadScriptTag(htmlContents: string) : string {
	return removeTags(htmlContents, rex.liveReloadScriptTagPattern, '\n');
}

function removeTags(htmlContents: string, pattern: RegExp, replacementText: string) {

	let tags = htmlContents.match(pattern) || [];
	
	tags.forEach(tag => htmlContents = htmlContents.replace(tag, replacementText));

	return htmlContents;
}

function normalizeMetaTagEndings(htmlContents: string, tags: string[]) {
	
	tags.forEach(tag => {
		let normalizedTag = tag.replace(/\s*\/\s*>/, '>').replace(/\<\s*\/\s*meta\s*>/, '').replace(/\>/, ' />');
		htmlContents = htmlContents.replace(tag, normalizedTag);
	});

	return htmlContents;
}

function convertLinkTagsToStaticResource(htmlContents: string, tags: string[], pageName: string) : string {

	tags.forEach(tag => {
		let href = /href="(.*)"/i.exec(tag)[1];
		let replacementTag = `<link href="{!URLFOR(IF(IsUnderDevelopment, SimpleVfPageConfig.TunnelUrl__c, $Resource.${pageName})) + '${href}'}" rel="stylesheet" />`;
		htmlContents = htmlContents.replace(tag, replacementTag);
	});

	return htmlContents;
}

function convertScriptTagsToStaticResource(htmlContents: string, tags: string[], pageName: string) : string {
	
	tags.forEach(tag => {
		let src = /src="(.*)"/i.exec(tag)[1];
		let replacementTag = `<script src="{!URLFOR(IF(IsUnderDevelopment, SimpleVfPageConfig.TunnelUrl__c, $Resource.${pageName})) + '${src}'}"></script>`;
		htmlContents = htmlContents.replace(tag, replacementTag);
	});

	return htmlContents;
}