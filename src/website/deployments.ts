import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import path from 'path';
import { readdirSync } from 'fs';

export interface WebsiteDeploymentsProps {
  websiteBucket: Bucket;
  distribution: Distribution;
}

export class WebsiteDeployemnts extends Construct {
  constructor(scope: Construct, id: string, props: WebsiteDeploymentsProps) {
    super(scope, id);

    const { websiteBucket, distribution } = props;

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
