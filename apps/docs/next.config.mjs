import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  basePath: '/docs',
  assetPrefix: '/docs',
  transpilePackages: ['better-blog']
};

export default withMDX(config);
