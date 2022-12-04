//@ts-check

import { createZip } from "./command.js";

/**
 *
 * @param {String} version
 */
export async function crxZip(version) {
	const manifest = (await import(process.env.INIT_CWD + "/manifest.json", { assert: { type: "json" } }))
		.default;
	if (!version) throw new Error("version number required for zip");

	const { writeFile, access } = await import("node:fs/promises");
	access("build").catch((err) => {
		throw new Error("build directory doesn't exist");
	});
	manifest.version = version;
	writeFile("build/manifest.json", JSON.stringify(manifest));
	createZip();
}
