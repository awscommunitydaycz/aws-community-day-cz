import path from 'path';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface WebsiteCloudFrontProps {
  appEnv: string;
  websiteBucket: Bucket;
  hostedZone: IHostedZone;
  sslCertificate: ICertificate;
}

export class WebsiteCloudFront extends Construct {
  public readonly distribution: cloudfront.Distribution;
  constructor(scope: Construct, id: string, props: WebsiteCloudFrontProps) {
    super(scope, id);

    const {
      appEnv,
      websiteBucket,
      hostedZone,
      sslCertificate: certificate,
    } = props;
    const noPrefixDomainEnvs = ['dev', 'prod'];
    const domainName = noPrefixDomainEnvs.includes(appEnv)
      ? hostedZone.zoneName
      : `${appEnv}.${hostedZone.zoneName}`;

    this.distribution = new cloudfront.Distribution(
      this,
      'WebsiteDistribution',
      {
        domainNames: [domainName, `www.${domainName}`],
        certificate,
        defaultRootObject: 'index1.html',
        priceClass:
          appEnv === 'prod'
            ? cloudfront.PriceClass.PRICE_CLASS_ALL
            : cloudfront.PriceClass.PRICE_CLASS_100,
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessControl(websiteBucket),
          cachePolicy: new cloudfront.CachePolicy(this, 'CachePolicy', {
            enableAcceptEncodingBrotli: true,
            enableAcceptEncodingGzip: true,
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
            defaultTtl: Duration.days(1),
            maxTtl: Duration.days(365),
          }),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          functionAssociations: [
            {
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
              function: new cloudfront.Function(this, 'RedirectFunction', {
                code: cloudfront.FunctionCode.fromFile({
                  filePath: path.join(__dirname, 'cloudfront-redirect.js'),
                }),
              }),
            },
          ],
        },
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 403,
            responsePagePath: '/403.html',
            ttl: Duration.minutes(1),
          },
          {
            httpStatus: 404,
            responseHttpStatus: 404,
            responsePagePath: '/404.html',
            ttl: Duration.minutes(1),
          },
        ],
      }
    );

    new CfnOutput(this, 'WebsiteDistributionId', {
      value: this.distribution.distributionId,
    });
  }
}
