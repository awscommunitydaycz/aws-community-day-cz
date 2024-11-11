import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import path from "path";

export interface WebsiteDeploymentsProps {
  websiteBucket: Bucket;
  distribution: Distribution;
}

export class WebsiteDeployemnts extends Construct {
  constructor(scope: Construct, id: string, props: WebsiteDeploymentsProps) {
    super(scope, id);

    const { websiteBucket, distribution } = props;

    new BucketDeployment(this, "DeployNextWebsite", {
      sources: [Source.asset(path.join("website", "next", "public"))],
      destinationBucket: websiteBucket,
      destinationKeyPrefix: "next/",
      distribution,
      distributionPaths: ["/next/*"],
    });

    new BucketDeployment(this, "Deploy4xxPages", {
      sources: [
        Source.asset(path.join("website"), {
          exclude: ["*", ".*", "!403.html", "!404.html"],
        }),
      ],
      destinationBucket: websiteBucket,
    });
  }
}
