export const metaConfigPattern: RegExp = /\<\s*meta.*config\/environment.*(\/>|\>\s*\<\/\s*meta\s*\>)/gi;
export const metaTagPattern: RegExp = /\<\s*meta.*(\>|\/>|\>\s*\<\/\s*meta\s*\>)/gi;
export const titleTagPattern: RegExp = /\<\s*title.*(\>|\/>|\>\s*\<\/\s*title\s*\>)/gi;
export const assetLinkTagPattern: RegExp = /\<\s*link.*assets.*(\>|\/>|\>\s*\<\/\s*link\s*\>)/gi;
export const assetScriptTagPattern: RegExp = /\<\s*script.*assets.*(\>|\/>|\>\s*\<\/\s*script\s*\>)/gi;
export const liveReloadScriptTagPattern: RegExp = /\<\s*script.*ember-cli-live-reload.*(\>|\/>|\>\s*\<\/\s*script\s*\>)/gi;
export const doctypeTagPattern: RegExp = /\<\s*\!\s*doctype.*\>/gi;

export function search(pattern: RegExp, content: string) : string[] {
	return content.match(pattern) || [];
}