export type ProviderOAuthCredential = {
  type: "oauth";
  access: string;
  refresh: string;
  expires: number;
  accountId?: string;
  enterpriseUrl?: string;
};

export type ProviderApiCredential = {
  type: "api";
  key: string;
};

export type ProviderWellKnownCredential = {
  type: "wellknown";
  key: string;
  token: string;
};

export type ProviderAwsProfileCredential = {
  type: "aws-profile";
  profile: string;
  region?: string;
};

export type ProviderAwsEnvChainCredential = {
  type: "aws-env-chain";
  region?: string;
};

export type ProviderAuthCredential =
  | ProviderApiCredential
  | ProviderOAuthCredential
  | ProviderWellKnownCredential
  | ProviderAwsProfileCredential
  | ProviderAwsEnvChainCredential;

export type LegacyCredentialType = "api-key" | "oauth" | "aws-profile";

export type GenerationRequestAuth =
  | { type: "api-key"; credential: string }
  | ProviderOAuthCredential
  | ProviderWellKnownCredential
  | ProviderAwsProfileCredential
  | ProviderAwsEnvChainCredential;

export function mapCredentialToLegacyType(
  credential: ProviderAuthCredential,
): LegacyCredentialType | "wellknown" | "aws-env-chain" {
  switch (credential.type) {
    case "api":
      return "api-key";
    case "oauth":
      return "oauth";
    case "aws-profile":
      return "aws-profile";
    case "wellknown":
      return "wellknown";
    case "aws-env-chain":
      return "aws-env-chain";
    default:
      return "api-key";
  }
}

export function credentialPrimarySecret(
  credential: ProviderAuthCredential,
): string {
  switch (credential.type) {
    case "api":
      return credential.key;
    case "oauth":
      return credential.refresh || credential.access;
    case "wellknown":
      return credential.token;
    case "aws-profile":
      return credential.profile;
    case "aws-env-chain":
      return credential.region ?? "aws-env-chain";
    default:
      return "";
  }
}
