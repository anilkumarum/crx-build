# Crx-build

# Install

> npm install -g crx-build

# Usage

```js
import crxBuild from "crx-build";
crxBuild.build();
```

**crx-build** use **esbuild: An extremely fast JavaScript bundler** under the hood.\
All esbuild configuration and work.\
Pass esbuild config at `crxBuild.esConfig();`\
example :

```js
import crxBuild from "crx-build";
crxBuild.esConfig({
	plugins: [esplugins],
	sourcemap: true,
});
crxBuild.build();
```

# API

**crxBuild.build()**\
Build all extension's page

**crxBuild.runTimeScripts = [{js:[jsfiles],css:[css files]}]**\
If you have injected js files or css files, pass here before build call.

**crxZip(version)**\
update version number in build manifest and create zip of build directory.

crx-build bundle everything on manifest e.g popup,background,\
contents and scripts,web-accessible-resources.\
If you can more than this, you can use this api

**jsbuild( [jsfiles], "root-directory", esbuild config object )**\
jsfiles: Array of js files which you want to bundle.\
esbuild-config (optional).

**HTMLBuild(htmlfilepath,esbuild config object)**\
htmlfilepath: html file relative to root directory\
e.g /popup/index.html
esbuild-config (optional).

# Related

[path-fixxer](https://www.npmjs.com/package/path-fixxer) - Add npm packages in chrome extension\
[crx-hotload](https://www.npmjs.com/package/crx-hotload) - Add HMR in your chrome extension

# License

crx-build is licensed under the MIT license.
