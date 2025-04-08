/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: [
      "i.ibb.co",
      "i.ibb.co.com",
      "www.adaptiveus.com",
      "www.twintechsoft.com",
    ], // Add the domain to the allowed list
  },
};

export default nextConfig;
