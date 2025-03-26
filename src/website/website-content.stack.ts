import { readdirSync } from 'fs';
import path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import {
  getWebsiteBucketParameterName,
  getWebsiteDistributionIdParameterName,
} from './parameters';

export interface WebsiteContentProps extends cdk.StackProps {
  appName: string;
  appEnv: string;
}

export class WebsiteContent extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebsiteContentProps) {
    super(scope, id, props);

    const { appEnv, appName } = props;

    const websiteBucketName = StringParameter.fromStringParameterAttributes(
      this,
      'WebsiteBucketNameParam',
      {
        parameterName: getWebsiteBucketParameterName(appName, appEnv),
        forceDynamicReference: true,
      }
    ).stringValue;

    const websiteBucket = Bucket.fromBucketName(
      this,
      'WebsiteBucket',
      websiteBucketName
    );

    const websiteDistributionId = StringParameter.fromStringParameterAttributes(
      this,
      'WebsiteDistributionIdParam',
      {
        parameterName: getWebsiteDistributionIdParameterName(appName, appEnv),
        forceDynamicReference: true,
      }
    ).stringValue;

    const websiteDistributionDomainName =
      StringParameter.fromStringParameterAttributes(
        this,
        'WebsiteDistributionDomainNameParam',
        {
          parameterName: getWebsiteDistributionIdParameterName(appName, appEnv),
          forceDynamicReference: true,
        }
      ).stringValue;

    const distribution = Distribution.fromDistributionAttributes(
      this,
      'WebsiteDistribution',
      {
        distributionId: websiteDistributionId,
        domainName: websiteDistributionDomainName,
      }
    );

    const years = readdirSync('website', { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    years.forEach((yearWithPrefix) => {
      const year = yearWithPrefix.replace('_', '');
      new BucketDeployment(this, `Deploy${year}Website`, {
        sources: [Source.asset(path.join('website', yearWithPrefix, 'public'))],
        destinationBucket: websiteBucket,
        destinationKeyPrefix: `${year}/`,
        distribution,
        distributionPaths: [`/${year}/*`],
      });
    });

    new BucketDeployment(this, 'Deploy4xxPages', {
      sources: [
        Source.asset(path.join('website'), {
          exclude: ['*', '.*', '!403.html', '!404.html'],
        }),
      ],
      destinationBucket: websiteBucket,
    });
  }
}
