import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withWorkflow(withSerwist(nextConfig));
