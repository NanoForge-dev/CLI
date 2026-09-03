import eslintConfig from "@nanoforge-dev/utils-eslint-config";

export default [...eslintConfig, { ignores: ["src/libs/**/files/**/*"] }];
