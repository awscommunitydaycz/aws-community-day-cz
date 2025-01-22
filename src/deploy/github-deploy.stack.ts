import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface GitHubDeployProps extends cdk.StackProps {
  repository: string;
  branch?: string;
}

export class GitHubDeploy extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GitHubDeployProps) {
    super(scope, id, props);

    const { repository, branch } = props;
    const branchPath = branch ? `ref:refs/heads/${branch}` : '*';

    const githubProvider = new iam.OpenIdConnectProvider(
      this,
      'GitHubProvider',
      {
        url: 'https://token.actions.githubusercontent.com',
        clientIds: ['sts.amazonaws.com'],
      }
    );

    new iam.Role(this, 'CdkDeployRole', {
      assumedBy: new iam.FederatedPrincipal(
        githubProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:sub': `repo:${repository}:${branchPath}`,
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),

      inlinePolicies: {
        allowCdkAssume: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['sts:AssumeRole'],
              resources: ['arn:aws:iam::*:role/cdk-*'],
            }),
          ],
        }),
      },
    });
  }
}
