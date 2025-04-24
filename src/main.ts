import { env } from 'process';
import * as cdk from 'aws-cdk-lib';
import { WebStage } from './stage';
import { getDomainInfo } from '@domain-config';

const appName = 'awscdcz';
const app = new cdk.App();
const appEnv = env.APP_ENV || 'dev';
const region = appEnv === 'prod' ? 'eu-central-1' : 'eu-west-1';

new WebStage(app, appEnv, {
  appName,
  env: {
    region,
  },
  ...getDomainInfo(appEnv),
});

cdk.Tags.of(app).add('project', appName);

app.synth();
