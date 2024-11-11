import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import path from "path";
import { WebsiteCloudFront } from "./cloudfront";

export interface WebsiteProps extends cdk.StackProps {
  domainName: string;
  hostedZoneId: string;
}

export class Website extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebsiteProps) {
    super(scope, id, props);

    const { domainName, hostedZoneId } = props;

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      {
        hostedZoneId: hostedZoneId,
        zoneName: domainName,
      }
    );

    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });

    const cloudfront = new WebsiteCloudFront(this, "WebsiteCloudFront", {
      websiteBucket,
      hostedZone,
    });

    new s3deploy.BucketDeployment(this, "DeployNextWebsite", {
      sources: [s3deploy.Source.asset(path.join("website", "next", "public"))],
      destinationBucket: websiteBucket,
      destinationKeyPrefix: "next/",
    });

    new s3deploy.BucketDeployment(this, "Deploy4xxPages", {
      sources: [
        s3deploy.Source.asset(path.join("website"), {
          exclude: ["*", ".*", "!403.html", "!404.html"],
        }),
      ],
      destinationBucket: websiteBucket,
    });

    new route53.ARecord(this, "WebsiteAliasRecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(cloudfront.distribution)
      ),
      recordName: domainName,
    });

    new route53.ARecord(this, "WebsiteWWWAliasRecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(cloudfront.distribution)
      ),
      recordName: `www.${domainName}`,
    });

    new cdk.CfnOutput(this, "WebsiteURL", {
      value: `https://${domainName}`,
    });
  }
}
