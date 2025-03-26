export const getWebsiteBucketParameterName = (
  appName: string,
  appEnv: string
) => `/${appEnv}/${appName}/website-bucket-name`;

export const getWebsiteDistributionIdParameterName = (
  appName: string,
  appEnv: string
) => `/${appEnv}/${appName}/website-distribution-id`;

export const getWebsiteDistributionDomainParameterName = (
  appName: string,
  appEnv: string
) => `/${appEnv}/${appName}/website-distribution-domain`;
