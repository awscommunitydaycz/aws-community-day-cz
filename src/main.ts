import * as cdk from 'aws-cdk-lib';
import { WebStage } from './stage';

const appName = 'awscdcz';
const app = new cdk.App();

new WebStage(app, 'dev', {
  appName,
  domainName: 'awscd.malanius.dev',
  hostedZoneId: 'Z0029338IRRURSH915ND',
});

new WebStage(app, 'prod', {
  appName,
  domainName: 'awscommunityday.cz',
  hostedZoneId: 'Z104115017VTV7WC2805D',
});

cdk.Tags.of(app).add('project', appName);

app.synth();
