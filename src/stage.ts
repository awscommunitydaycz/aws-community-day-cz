import { Aspects, Stage, StageProps, Tag } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GitHubDeploy } from '@deploy/github-deploy.stack';
import { WebsiteInfra } from '@website/website-infra.stack';

interface WebStageProps extends StageProps {
  appName: string;
  domainName: string;
  hostedZoneId: string;
}

export class WebStage extends Stage {
  constructor(scope: Construct, id: string, props: WebStageProps) {
    super(scope, id, props);
    const { domainName, hostedZoneId, appName } = props;

    const ghaEnabledEnvs = ['dev', 'prod'];
    if (ghaEnabledEnvs.includes(this.stageName)) {
      const repository =
        this.stageName === 'dev'
          ? 'Malanius/aws-community-day-cz'
          : 'awscommunitydaycz/aws-community-day-cz';

      new GitHubDeploy(this, 'github-deploy', {
        stackName: `${this.stageName}-${appName}-github-deploy`,
        repository,
      });
    }

    new WebsiteInfra(this, 'web-infra', {
      appName,
      appEnv: this.stageName,
      stackName: `${this.stageName}-${appName}-web-infra`,
      domainName,
      hostedZoneId,
    });

    Aspects.of(this).add(new Tag('env', this.stageName));
  }
}
