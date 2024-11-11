import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import path from "path";

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

    const certificate = new acm.DnsValidatedCertificate(this, "Certificate", {
      domainName: domainName,
      subjectAlternativeNames: [`www.${domainName}`],
      hostedZone,
      region: "us-east-1",
    });

    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
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

    const distribution = new cloudfront.Distribution(
      this,
      "WebsiteDistribution",
      {
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
          cachePolicy: new cloudfront.CachePolicy(this, "CachePolicy", {
            enableAcceptEncodingBrotli: true,
            enableAcceptEncodingGzip: true,
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
            defaultTtl: cdk.Duration.days(1),
            maxTtl: cdk.Duration.days(365),
          }),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          functionAssociations: [
            {
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
              function: new cloudfront.Function(this, "RedirectFunction", {
                code: cloudfront.FunctionCode.fromFile({
                  filePath: "src/cloudfront-redirect.js",
                }),
              }),
            },
          ],
        },
        domainNames: [domainName, `www.${domainName}`],
        certificate: certificate,
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 403,
            responsePagePath: "/403.html",
            ttl: cdk.Duration.minutes(1),
          },
          {
            httpStatus: 404,
            responseHttpStatus: 404,
            responsePagePath: "/404.html",
            ttl: cdk.Duration.minutes(1),
          },
        ],
        defaultRootObject: "index1.html",
      }
    );

    new route53.ARecord(this, "WebsiteAliasRecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
      recordName: domainName,
    });

    new route53.ARecord(this, "WebsiteWWWAliasRecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
      recordName: `www.${domainName}`,
    });

    new cdk.CfnOutput(this, "WebsiteURL", {
      value: `https://${domainName}`,
    });

    new cdk.CfnOutput(this, "WebsiteDistributionId", {
      value: distribution.distributionId,
    });
  }
}
