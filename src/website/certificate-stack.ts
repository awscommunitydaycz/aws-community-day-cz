import { Stack, StackProps } from 'aws-cdk-lib';
import {
  Certificate,
  CertificateValidation,
  KeyAlgorithm,
} from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface CertificateStackProps extends StackProps {
  appEnv: string;
  hostedZoneId: string;
  domainName: string;
}

export class CloudFrontCertificateStack extends Stack {
  public readonly certificate: Certificate;
  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const { appEnv, hostedZoneId, domainName } = props;
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: hostedZoneId,
      zoneName: domainName,
    });

    const noPrefixDomainEnvs = ['dev', 'prod'];
    const dnsName = noPrefixDomainEnvs.includes(appEnv)
      ? hostedZone.zoneName
      : `${appEnv}.${hostedZone.zoneName}`;

    this.certificate = new Certificate(this, 'Certificate', {
      domainName: dnsName,
      subjectAlternativeNames: [`www.${dnsName}`],
      keyAlgorithm: KeyAlgorithm.EC_PRIME256V1,
      validation: CertificateValidation.fromDns(hostedZone),
    });
  }
}
