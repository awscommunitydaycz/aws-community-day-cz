import { awscdk } from "projen";
import { NodePackageManager } from "projen/lib/javascript";
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: "2.166.0",
  defaultReleaseBranch: "main",
  name: "aws-community-day-cz",
  projenrcTs: true,
  packageManager: NodePackageManager.PNPM,

  github: false, // TODO: check if this can help us or not

});
project.synth();
