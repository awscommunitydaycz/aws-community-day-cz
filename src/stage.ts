import { Website } from '@website/website.stack';

import { Aspects, Stage, StageProps, Tag } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface WebStageProps extends StageProps {
  domainName: string;
  hostedZoneId: string;
}

export class WebStage extends Stage {
  constructor(scope: Construct, id: string, props: WebStageProps) {
    super(scope, id, props);
    const { domainName, hostedZoneId } = props;

    new Website(this, 'web', {
      domainName,
      hostedZoneId,
    });

    Aspects.of(this).add(new Tag('env', this.stageName));
  }
}
