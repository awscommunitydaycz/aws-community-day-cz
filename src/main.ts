import * as cdk from 'aws-cdk-lib';
import { WebStage } from './stage';

const app = new cdk.App();

new WebStage(app, 'dev', {
  domainName: 'awscd.malanius.dev',
  hostedZoneId: 'Z0029338IRRURSH915ND',
});

cdk.Tags.of(app).add('project', 'aws-community-day-cz');

app.synth();
