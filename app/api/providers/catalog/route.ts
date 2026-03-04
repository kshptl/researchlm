import { NextResponse } from "next/server"
import { getProviderCatalog, listProviderModels, sortProvidersForSelection } from "@/lib/providers/catalog"

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const forceRefresh = url.searchParams.get("refresh") === "1"
  const catalog = await getProviderCatalog({ forceRefresh })
  const providers = sortProvidersForSelection(Object.values(catalog)).map((provider) => ({
    id: provider.id,
    name: provider.name,
    apiBaseUrl: provider.apiBaseUrl,
    npmPackage: provider.npmPackage,
    envKeys: provider.envKeys,
    modelCount: Object.keys(provider.models).length,
    models: listProviderModels(provider).map((model) => ({
      id: model.id,
      name: model.name,
      apiId: model.apiId,
      apiBaseUrl: model.apiBaseUrl,
      npmPackage: model.npmPackage,
      supportsToolCall: model.supportsToolCall,
      supportsVision: model.supportsVision,
    })),
  }))

  return NextResponse.json({ providers })
}
