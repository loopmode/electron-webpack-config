# @loopmode/ewc-yarn-workspaces

## electron-webpack-config-yarn-workspaces

Adjustments for the renderer webpack configuration of an `electron-webpack` application that is part of a yarn workspace.

### Usage

```js
// packages/electron-app/webpack.renderer.config.js
const enableYarnWorkspaces = require("electron-webpack-config-yarn-workspaces")
module.exports = function(config) {
  config = enableYarnWorkspaces(config, {
    root: path.resolve(__dirname, "../.."),

    libAlias: "lib"
  })
  return config
}
```

### Options

#### root

`{string} [options.root]` - absolute path of the workspace root (required)

#### libAlias

`{string} [options.libAlias]` - relative path inside packages to include in alias target (optional)

If your packages transpile to their `lib` folders, you would normally have to type out that path when importing their modules:

```js
import Button from "@my/package/lib/components/Button"
```

When you provide a `libAlias: 'lib'` option, you can omit the aliased part from the import path:

```js
import Button from "@my/package/components/Button"
```

### Background

The scenario is a project using yarn workspaces and multiple apps sharing multiple modules.
One workspace package is an app built with `electron-webpack`.
Another package is an app built with `create-react-app`.
Any number of additional packages (utils, modules, anything) exist in the workspace, and they are watched and transpiled by some tool (e.g. babel or typescript). Each of those packages gets its `src/` folder transpiled to a consumable `dist/`.

Due to the nature of yarn workspaces, all workspace packages are symlinked into the project root's `node_modules` folder, and thus available to all other workspace packages.

#### Problem

The default setup of `electron-webpack` does not detect changes to files that are outside of its own directory.
When the `electron-webpack` app runs in development mode, and you change the code of some module from a workspace package, the app does not reload the changed modules.

This is because `electron-webpack` employs a custom [WatchFilterPlugin](https://github.com/electron-userland/electron-webpack/blob/master/packages/electron-webpack/src/plugins/WatchMatchPlugin.ts) and [uses it](https://github.com/electron-userland/electron-webpack/blob/master/packages/electron-webpack/src/targets/BaseTarget.ts#L144) for ignoring changes to files that aren't part of its app's sources.

#### Solution

The latest versions of `electron-webpack` allow us to modify the webpack configuration by providing a custom configuration module that exports a function. That function is invoked with the current webpack config object, and should return a final config object.

The `electron-webpack-config-yarn-workspaces` solution overrides the filter function and allows files from workspace packages to be watched for changes.
