import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    ignores: ["mobile/**", ".next/**", "node_modules/**", "prisma/**"],
  },
  {
    rules: {
      "no-console": "warn",
    },
  },
];

export default config;
