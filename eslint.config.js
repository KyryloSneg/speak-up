import skipFormatting from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";
import clientConfig from "./client/eslint.config";
import serverConfig from "./server/eslint.config";
import sharedConfig from "./shared/eslint.config";

// use some AI-slope for global linting

/**
 * @param {string} prefix
 * @param {unknown} configs
 * @returns {import("eslint").Linter.Config[]}
 */
function scopeConfigs(prefix, configs) {
  const configArray = configs;

  return configArray.map(config => {
    if (config.ignores && !config.files && Object.keys(config).length === 1) {
      return config;
    }

    const newConfig = { ...config };

    if (config.files) {
      const filesArray = Array.isArray(config.files)
        ? config.files
        : [config.files];

      newConfig.files = filesArray.map(p => {
        if (typeof p !== "string") return p;
        return p.startsWith("**/") ? p : `${prefix}/${p}`;
      });
    } else {
      newConfig.files = [`${prefix}/**/*`];
    }

    if (config.ignores) {
      const ignoresArray = Array.isArray(config.ignores)
        ? config.ignores
        : [config.ignores];

      newConfig.ignores = ignoresArray.map(p => {
        if (typeof p !== "string") return p;
        return p.startsWith("**/") ? p : `${prefix}/${p}`;
      });
    }

    return newConfig;
  });
}

export default defineConfig([
  ...scopeConfigs("client", clientConfig),
  ...scopeConfigs("server", serverConfig),
  ...scopeConfigs("shared", sharedConfig),

  skipFormatting,
]);
