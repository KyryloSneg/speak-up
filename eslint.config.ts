import skipFormatting from "eslint-config-prettier/flat";
import clientConfig from "./client/eslint.config";

const eslintConfig = [...clientConfig, skipFormatting];

export default eslintConfig;
