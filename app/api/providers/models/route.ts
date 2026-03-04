import { NextResponse } from "next/server"
import { z } from "zod"
import { discoverProviderModels } from "@/lib/providers/model-discovery"

const requestSchema = z.object({
  providers: z
    .array(
      z.object({
        providerId: z.string().min(1),
        auth: z.discriminatedUnion("type", [
          z.object({ type: z.literal("api"), key: z.string().min(1) }),
          z.object({
            type: z.literal("oauth"),
            access: z.string().min(1),
            refresh: z.string().min(1),
            expires: z.number(),
            accountId: z.string().optional(),
            enterpriseUrl: z.string().optional(),
          }),
          z.object({ type: z.literal("wellknown"), key: z.string().min(1), token: z.string().min(1) }),
          z.object({ type: z.literal("aws-profile"), profile: z.string().min(1), region: z.string().optional() }),
          z.object({ type: z.literal("aws-env-chain"), region: z.string().optional() }),
        ]),
      }),
    )
    .min(1),
})

export async function POST(request: Request): Promise<Response> {
  try {
    const body = requestSchema.parse(await request.json())
    const results = await Promise.all(
      body.providers.map((provider) =>
        discoverProviderModels({
          providerId: provider.providerId,
          auth: provider.auth,
        }),
      ),
    )

    return NextResponse.json({
      providers: results,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request"
    return NextResponse.json(
      {
        message,
      },
      { status: 400 },
    )
  }
}
