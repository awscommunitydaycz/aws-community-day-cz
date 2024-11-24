import * as cdk from 'aws-cdk-lib';
import { WebStage } from './stage';

const appName = 'awscdcz';
const app = new cdk.App();

new WebStage(app, 'dev', {
  appName,
  domainName: 'awscd.malanius.dev',
  hostedZoneId: 'Z0029338IRRURSH915ND',
});

cdk.Tags.of(app).add('project', appName);

app.synth();
