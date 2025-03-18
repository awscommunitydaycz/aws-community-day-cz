import { awscdk } from "projen";
import { NodePackageManager, TrailingComma } from "projen/lib/javascript";
import { ReleaseTrigger } from "projen/lib/release";

const cdkVersion = "2.166.0";

const project = new awscdk.AwsCdkTypeScriptApp({
  name: "aws-community-day-cz",

  cdkVersion,
  cdkVersionPinning: true,

  release: true,
  // majorVersion: 1,
  defaultReleaseBranch: "main",
  releaseTrigger: ReleaseTrigger.manual(),
  github: false, // TODO: check if this can help us or not

  packageManager: NodePackageManager.PNPM,

  scripts: {
    precommit: "lint-staged",
    prepare: "husky install",
  },

  projenrcTs: true,
  tsconfig: {
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "@*": ["src/*"],
      },
    },
  },

  prettier: true,
  prettierOptions: {
    yaml: true,
    settings: {
      singleQuote: true,
      bracketSpacing: true,
      trailingComma: TrailingComma.ES5,
    },
    ignoreFileOptions: {
      ignorePatterns: ["cdk.out"],
    },
  },

  devDeps: [
    "@commitlint/cli",
    "@commitlint/config-conventional",
    "cz-conventional-changelog",
    "husky",
    "lint-staged",
    "tsconfig-paths",
  ],
});

// There is no way to directly register modules in in projen
// So having to use escape hatch to add tsconfig-paths/register
const cdkJson = project.tryFindObjectFile("cdk.json");
cdkJson?.addOverride(
  "app",
  "npx ts-node -r tsconfig-paths/register --prefer-ts-exts src/main.ts"
);

project.synth();
