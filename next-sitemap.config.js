/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:
    process.env.SITE_URL ||
    process.env.VERCEL_URL ||
    "https://stablo-pro.web3templates.com",
  generateRobotsTxt: true // (optional)
  // ...other options
};
