/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone", // good for VPS deployments
  experimental: {
    workerThreads: false, // optional: reduce resource use
  },
  images: {
    domains: [
      "i.ibb.co",
      "i.ibb.co.com",
      "www.adaptiveus.com",
      "www.twintechsoft.com",
    ],
  },
};

export default nextConfig;
