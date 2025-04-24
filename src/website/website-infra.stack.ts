import * as cdk from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { WebsiteCloudFront } from './cloudfront';
import { WebsiteDns } from './dns';
import {
  getWebsiteBucketParameterName,
  getWebsiteDistributionDomainParameterName,
  getWebsiteDistributionIdParameterName,
} from './parameters';

export interface WebsiteInfraProps extends cdk.StackProps {
  appName: string;
  appEnv: string;
  domainName: string;
  hostedZoneId: string;
  sslCertificate: ICertificate;
}

export class WebsiteInfra extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebsiteInfraProps) {
    super(scope, id, props);

    const { appName, appEnv, domainName, hostedZoneId, sslCertificate } = props;

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'HostedZone',
      {
        hostedZoneId: hostedZoneId,
        zoneName: domainName,
      }
    );

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });

    new StringParameter(this, 'WebsiteBucketName', {
      parameterName: getWebsiteBucketParameterName(appName, appEnv),
      stringValue: websiteBucket.bucketName,
    });

    const cloudfront = new WebsiteCloudFront(this, 'WebsiteCloudFront', {
      appEnv,
      websiteBucket,
      hostedZone,
      sslCertificate,
    });

    new StringParameter(this, 'WebsiteDistributionId', {
      parameterName: getWebsiteDistributionIdParameterName(appName, appEnv),
      stringValue: cloudfront.distribution.distributionId,
    });

    new StringParameter(this, 'WebsiteDistributionDomainName', {
      parameterName: getWebsiteDistributionDomainParameterName(appName, appEnv),
      stringValue: cloudfront.distribution.domainName,
    });

    new WebsiteDns(this, 'WebsiteDns', {
      appEnv,
      hostedZone,
      distribution: cloudfront.distribution,
    });
  }
}
