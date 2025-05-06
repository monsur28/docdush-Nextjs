const nextConfig = {
  reactStrictMode: false,
  experimental: {
    workerThreads: false,
  },
  images: {
    domains: [
      "i.ibb.co",
      "i.ibb.co.com",
      "www.adaptiveus.com",
      "www.twintechsoft.com",
      "res.cloudinary.com",
    ],
  },
};

export default nextConfig;
