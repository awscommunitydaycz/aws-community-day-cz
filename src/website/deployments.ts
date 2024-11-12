import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import path from 'path';

export interface WebsiteDeploymentsProps {
  websiteBucket: Bucket;
  distribution: Distribution;
}

export class WebsiteDeployemnts extends Construct {
  constructor(scope: Construct, id: string, props: WebsiteDeploymentsProps) {
    super(scope, id);

    const { websiteBucket, distribution } = props;

    const years = ['2025'];

    years.forEach((year) => {
      new BucketDeployment(this, `Deploy${year}Website`, {
        sources: [Source.asset(path.join('website', year, 'public'))],
        destinationBucket: websiteBucket,
        destinationKeyPrefix: '2025/',
        distribution,
        distributionPaths: ['/2025/*'],
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
