//Edit html to add and remove link and script tag
import { platform } from "node:os";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { clr } from "./util.js";
const execute = promisify(exec);
const os = platform();

/**
   when copy page to build/page/html,
  old js/css file path need to remove.
  Command to remove page files url in build html 
*/
const removeFileCmd = {
	windows: (pageHTML) =>
		`type -i '/<script.*><\/script>$\|<link rel="stylesheet" href=".*" \/>$/d' ${pageHTML}`,
	darwin: (pageHTML) =>
		`sed -i '/<script.*><\\/script>$\\|<link rel="stylesheet" href=".*" \\/>$/d' ${pageHTML}`,
	linux: (pageHTML) =>
		`sed -i '/<script.*><\\/script>$\\|<link rel="stylesheet" href=".*" \\/>$/d' ${pageHTML}`,
};

/**
 *
 * @param {String} pageHTML
 * eg. popup/index.html
 * @returns {Boolean} success
 */
export async function removeFileTags(pageHTML) {
	const { stdout, stderr } = await execute(removeFileCmd[os](pageHTML));
	if (stderr) throw new Error(stderr);
	return true;
}

//Command to join all css files into one
const joinCssCmd = {
	windows: (cssFiles, page, filename) => `type ${cssFiles}  | tr -d " \t\n\r"  > build/${page}/${filename}`,
	darwin: (cssFiles, page, filename) => `cat ${cssFiles}  | tr -d " \t\n\r"  > build/${page}/${filename}`,
	linux: (cssFiles, page, filename) => `cat ${cssFiles}  | tr -d " \t\n\r"  > build/${page}/${filename}`,
};

/**
 *
 * @param {Array} cssPaths
 * @param {String} page
 * @param {String} [filename]
 * @returns {String} newcssFile
 */
export async function joinLinkCss(cssPaths, page, filename) {
	filename ??= page + ".css";
	const cssFiles = cssPaths.toString().replaceAll(",", " ");
	const { stdout, stderr } = await execute(joinCssCmd[os](cssFiles, page, filename));
	if (stderr) throw new Error(stderr);
	console.log(clr["blue"], page + "/css build");
	return filename;
}

//Command to add generated files url in build html
const insertLinkCmd = {
	windows: (nodeTag, pageHTML) => `type -i '8 i\\${nodeTag}' ${pageHTML}`,
	darwin: (nodeTag, pageHTML) => `sed -i '8 i\\${nodeTag}' ${pageHTML}`,
	linux: (nodeTag, pageHTML) => `sed -i '8 i\\${nodeTag}' ${pageHTML}`,
};

/**
 *
 * @param {String} filename
 * @param {String} page
 * @returns {Boolean} success
 */

export async function appendFileLink(filename, pageHTML) {
	let nodeTag;
	if (filename.endsWith(".css")) nodeTag = `<link rel="stylesheet" href="./${filename}" />`;
	else if (filename.endsWith(".js")) nodeTag = `<script type="module" src="./${filename}"></script>`;
	if (!nodeTag) return console.error("unknown file");

	const { stdout, stderr } = await execute(insertLinkCmd[os](nodeTag, "build/" + pageHTML));
	if (stderr) throw new Error(stderr);
	return true;
}

//Command to add generated files url in build html
const zipCmd = {
	windows: () => `tar.exe -a -c -f extension.zip build`,
	darwin: () => `zip extension.zip build`,
	linux: () => "zip -r ${PWD##*/}.zip  build",
};

export async function createZip() {
	const { stdout, stderr } = await execute(zipCmd[os]());
	if (stderr) throw new Error(stderr);
	console.log(clr["green"], "crx zip created");
	return true;
}
