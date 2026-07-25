import { createSerwistRoute } from "@serwist/turbopack";

const handler = createSerwistRoute({
  swSrc: "src/app/sw.ts",
});

export const GET = async (req: any, ctx: any) => {
  const resolvedCtx = { ...ctx, params: await ctx.params };
  if (Array.isArray(resolvedCtx.params.path)) {
    resolvedCtx.params.path = resolvedCtx.params.path.join("/");
  }
  return handler.GET(req, resolvedCtx);
};

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;
export const generateStaticParams = async () => {
  const params = await handler.generateStaticParams();
  return params.map((p: any) => ({
    path: [p.path],
  }));
};

