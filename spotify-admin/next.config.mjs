/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath removed: NGINX rewrite-target strips /admin prefix before
  // requests reach this container, so Next.js always sees paths starting at /
};

export default nextConfig;
