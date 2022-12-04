//@ts-check
import { dirname, resolve } from "node:path";
import { Parser } from "htmlparser2";
import { readFile, mkdir, copyFile } from "node:fs/promises";
import { appendFileLink, joinLinkCss, removeFileTags } from "./command.js";
import { basename } from "node:path";
import { jsbuild } from "./js_build.js";
import { clr } from "./util.js";

export class HTMLBuild {
	constructor(htmlFilePath, esConfig) {
		this.entryDir = dirname(htmlFilePath);
		this.htmlFilePath = htmlFilePath;
		this.esConfig = esConfig;
		this.startBuild();
	}

	async startBuild() {
		//Parese html to extract js and css files
		const { jsFiles, cssFiles } = await this.getFileUrls(this.entryDir);
		await mkdir("build/" + this.entryDir, { recursive: true }).catch((err) => console.error(err));
		await copyFile(this.htmlFilePath, "build/" + this.htmlFilePath).catch((err) => console.error(err));
		await removeFileTags("build/" + this.htmlFilePath);

		const cssFile = await joinLinkCss(cssFiles, this.entryDir);
		appendFileLink(cssFile, this.htmlFilePath);
		const success = await jsbuild(jsFiles, this.entryDir, this.esConfig);
		if (success) for (const file of jsFiles) appendFileLink(basename(file), this.htmlFilePath);
	}

	async getFileUrls(page) {
		const jsFiles = [];
		const cssFiles = [];
		const parser = new Parser({
			onopentag(name, attributes) {
				name === "script" && jsFiles.push(resolve(page, attributes.src));
				name === "link" && attributes.rel === "stylesheet" && cssFiles.push(resolve(page, attributes.href));
			},
		});
		try {
			const contents = await readFile(this.htmlFilePath, { encoding: "utf8" });
			parser.write(contents);
			parser.end();
		} catch (error) {
			console.error(clr["red"], error);
		}
		return { jsFiles, cssFiles };
	}
}
