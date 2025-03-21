export const getDomainInfo = (appEnv: string) => {
  switch (appEnv) {
    case 'dev':
      // DEV is used for Malanius' experiments over things
      return {
        domainName: 'awscd.malanius.dev',
        hostedZoneId: 'Z0029338IRRURSH915ND',
      };
    default:
      // PROD and every other preview environment runs on the same domain
      return {
        domainName: 'awscommunityday.cz',
        hostedZoneId: 'Z104115017VTV7WC2805D',
      };
  }
};
