import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withWorkflow(withSerwist(nextConfig));
