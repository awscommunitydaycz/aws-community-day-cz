import * as cdk from "aws-cdk-lib";
import { Website } from "./website.stack";

const app = new cdk.App();

new Website(app, "dev-web", {
  stackName: "dev-community-day-web",
  domainName: "awscd.malanius.dev",
  hostedZoneId: "Z0029338IRRURSH915ND",
  tags: {
    env: "dev",
  },
});

cdk.Tags.of(app).add("project", "aws-community-day-cz");

app.synth();
