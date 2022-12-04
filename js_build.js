import { build } from "esbuild";
import { clr } from "./util.js";

/**
 *
 * @param {Array} jsFiles
 * @param {String} page
 * @param {import("esbuild").BuildOptions} esConfig
 * @returns {Boolean} success
 */
export async function jsbuild(jsFiles, page, esConfig) {
	const buildObj = {
		entryPoints: jsFiles,
		bundle: true,
		splitting: true,
		format: "esm",
		outdir: "build/" + page,
	};
	const buildConfig = { ...buildObj, ...esConfig };

	await build(buildConfig).catch(() => process.exit(1));
	console.log(clr["yellow"], page + "/js build");
	return true;
}
