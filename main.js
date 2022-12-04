//@ts-check
import { jsbuild } from "./js_build.js";
import { HTMLBuild } from "./html_build.js";
import { crxZip } from "./zip.js";
import { joinLinkCss } from "./command.js";
import { basename } from "node:path";
import { mkdir } from "node:fs/promises";

const crxBuild = {
	manifest: (await import(process.env.INIT_CWD + "/manifest.json", { assert: { type: "json" } })).default,
	/** @type {import("esbuild").BuildOptions}*/
	esConfig: {},
	runTimeScripts: null,
	version: null,

	async build() {
		//Build background page
		const background = this.manifest.background.service_worker;
		background && jsbuild([background], "background", this.esConfig);

		// Build content_scripts
		this.manifest.content_scripts &&
			// @ts-ignore
			(await this.buildInjectedScripts(this.manifest.content_scripts, "contents"));

		//Build runTimeScripts
		this.runTimeScripts && (await this.buildInjectedScripts(this.runTimeScripts, "scripts"));

		//Build html pages e.g pop,options and iframe
		await this.buildHTMLPages();

		const { writeFile } = await import("node:fs/promises");
		writeFile("build/manifest.json", JSON.stringify(this.manifest));

		//create zip if new version is provided
		this.version && crxZip(this.version);
	},

	/**
	 *
	 * @param {[
	 * {
	 *  js:[String]
	 *  css:[String]
	 * }
	 * ]} injected_scripts
	 * @param {String} page
	 */

	async buildInjectedScripts(injected_scripts, page) {
		const buildContentJs = async (jsFiles, idx) => {
			await jsbuild(jsFiles, page, this.esConfig);
			page === "contents" && (this.manifest.content_scripts[idx].js = jsFiles[0]);
		};

		const buildContentCss = async (cssFiles, idx) => {
			await mkdir("build/" + page, { recursive: true }).catch((err) => console.error(err));
			await joinLinkCss(cssFiles, page, basename(cssFiles[0]));
			page === "contents" && (this.manifest.content_scripts[idx].css = cssFiles[0]);
		};

		const count = injected_scripts.length;
		for (let i = 0; i < count; i++) {
			const scripts = injected_scripts[i];
			scripts.js && (await buildContentJs(scripts.js, i));
			scripts.css && (await buildContentCss(scripts.css, i));
		}
	},

	buildHTMLPages() {
		//Build popup page
		const popupHTML = this.manifest.action.default_popup;
		popupHTML && new HTMLBuild(popupHTML, this.esConfig);

		//Build options page
		const optionsHTML = this.manifest.options_page;
		optionsHTML && new HTMLBuild(optionsHTML, this.esConfig);

		//Find html file in web_accessible_resources that may be injected as iframe.
		const injectResources = this.manifest.web_accessible_resources;
		if (injectResources) {
			for (const resource of injectResources) {
				const injectedHTML = resource.resources.find((filePath) => filePath.endsWith(".html"));
				injectedHTML && new HTMLBuild(injectedHTML, this.esConfig);
			}
		}
	},
};

export default crxBuild;
export { jsbuild, HTMLBuild, crxZip };
