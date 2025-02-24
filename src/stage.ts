import { GitHubDeploy } from '@deploy/github-deploy.stack';
import { Website } from '@website/website.stack';

import { Aspects, Stage, StageProps, Tag } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface WebStageProps extends StageProps {
  appName: string;
  domainName: string;
  hostedZoneId: string;
}

export class WebStage extends Stage {
  constructor(scope: Construct, id: string, props: WebStageProps) {
    super(scope, id, props);
    const { domainName, hostedZoneId, appName } = props;

    const repository =
      this.stageName === 'prod'
        ? 'awscommunitydaycz/aws-community-day-cz'
        : 'Malanius/aws-community-day-cz';
    const branch = this.stageName === 'prod' ? 'main' : undefined;

    new GitHubDeploy(this, 'github-deploy', {
      stackName: `${this.stageName}-${appName}-github-deploy`,
      repository,
      branch,
    });

    new Website(this, 'web', {
      stackName: `${this.stageName}-${appName}-website`,
      domainName,
      hostedZoneId,
    });

    Aspects.of(this).add(new Tag('env', this.stageName));
  }
}
