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

    new Website(this, 'web', {
      stackName: `${this.stageName}-${appName}-website`,
      domainName,
      hostedZoneId,
    });

    Aspects.of(this).add(new Tag('env', this.stageName));
  }
}
