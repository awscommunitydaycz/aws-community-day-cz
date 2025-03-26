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
  isLiveSite?: boolean;
}

export class WebsiteContent extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebsiteContentProps) {
    super(scope, id, props);

    const { appEnv, appName, isLiveSite } = props;
    const lookupEnv = isLiveSite ? appEnv : 'previews';

    const websiteBucketName = StringParameter.fromStringParameterAttributes(
      this,
      'WebsiteBucketNameParam',
      {
        parameterName: getWebsiteBucketParameterName(appName, lookupEnv),
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
        parameterName: getWebsiteDistributionIdParameterName(
          appName,
          lookupEnv
        ),
        forceDynamicReference: true,
      }
    ).stringValue;

    const websiteDistributionDomainName =
      StringParameter.fromStringParameterAttributes(
        this,
        'WebsiteDistributionDomainNameParam',
        {
          parameterName: getWebsiteDistributionIdParameterName(
            appName,
            lookupEnv
          ),
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

    // Not calendar year but the year of currently prepared event
    // Don't foget to update when next event is prepared
    // Don't ommmit underscore prefix
    const currentEvent = '_2025';
    let events = [currentEvent];
    if (isLiveSite) {
      events = readdirSync('website', { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
    }

    events.forEach((eventWithPrefix) => {
      const content_path = isLiveSite
        ? eventWithPrefix.replace('_', '')
        : appEnv;
      new BucketDeployment(this, `Deploy_${content_path}Website`, {
        sources: [
          Source.asset(path.join('website', eventWithPrefix, 'public')),
        ],
        destinationBucket: websiteBucket,
        destinationKeyPrefix: `${content_path}/`,
        distribution,
        distributionPaths: [`/${content_path}/*`],
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
