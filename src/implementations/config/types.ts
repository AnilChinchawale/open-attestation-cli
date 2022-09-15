import { OpenAttestationDocument } from "@govtechsg/open-attestation";
import { supportedNetwork } from "../../commands/networks";

type WalletEncryptedJson = {
  type: "ENCRYPTED_JSON";
  encryptedJson: string;
};

export type Dns = string | undefined;

export type Form = {
  name: string;
  type: "VERIFIABLE_DOCUMENT" | "TRANSFERABLE_RECORD";
  defaults: OpenAttestationDocument;
  schema: any;
  uiSchema?: any;
  attachments?: {
    allow: boolean;
    accept: string;
  };
  extension?: string;
  fileName?: string;
};

export interface ConfigFile {
  network: keyof typeof supportedNetwork;
  wallet: WalletEncryptedJson;
  forms: Form[];
  documentStorage?: {
    apiKey?: string;
    url: string;
  };
}
