/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  images: {
    domains: ["storage.ko-fi.com"],
  },

  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  output: "standalone", // ✅ Ensures proper deployment on Vercel
};

export default config;
