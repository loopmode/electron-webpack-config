const merge = require("webpack-merge")

const utils = require("./utils")
const plugins = require("./plugins")

module.exports = function configureYarnWorkspaces(
  webpackConfig,
  { root, libAlias }
) {
  const workspacePackages = utils.getWorkspacePackagePaths(root)

  webpackConfig = merge(webpackConfig, {
    resolve: { alias: utils.createAliases(workspacePackages, libAlias) }
  })

  webpackConfig.plugins = webpackConfig.plugins
    .map(plugin => utils.overridePlugin(plugin, workspacePackages, plugins))
    .filter(Boolean)

  return webpackConfig
}
