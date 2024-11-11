import { CfnOutput } from "aws-cdk-lib";
import { IDistribution } from "aws-cdk-lib/aws-cloudfront";
import { ARecord, IHostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

export interface WebsiteDnsProps {
  hostedZone: IHostedZone;
  distribution: IDistribution;
}

export class WebsiteDns extends Construct {
  constructor(scope: Construct, id: string, props: WebsiteDnsProps) {
    super(scope, id);

    const { hostedZone, distribution } = props;
    const domainName = hostedZone.zoneName;

    new ARecord(this, "WebsiteAliasRecord", {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: domainName,
    });

    new ARecord(this, "WebsiteWWWAliasRecord", {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: `www.${domainName}`,
    });

    new CfnOutput(this, "WebsiteURL", {
      value: `https://${domainName}`,
    });
  }
}
