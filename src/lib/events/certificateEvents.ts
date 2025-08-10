// Helpers to parse on-chain certificate events (partial implementation)
// Integrate with indexer or subscription for production.

export interface CertificateIssuedEvent {
  certificate_id: string;
  template_id: string;
  issuer: string;
  recipient: string;
  certificate_type: string;
  client_provided_id: string;
  timestamp: string | number;
}

export interface CertificateMintedEvent {
  certificate_id: string;
  nft_id: string;
  recipient: string;
  mint_transaction_id: string;
  timestamp: string | number;
}

export interface UpdateMintTxIdEvent {
  certificate_id: string;
  nft_id: string;
  new_label: string;
  timestamp: string | number;
}

export type AnyCertEvent =
  | { type: "issued"; data: CertificateIssuedEvent }
  | { type: "minted"; data: CertificateMintedEvent }
  | { type: "mint_tx_updated"; data: UpdateMintTxIdEvent };

export function mapRawEvent(e: unknown): AnyCertEvent | null {
  if (!e || typeof e !== "object") return null;
  const anyEvent = e as Record<string, unknown>;
  const type = typeof anyEvent.type === "string" ? anyEvent.type : "";
  const parsedJson = anyEvent.parsedJson as Record<string, unknown> | undefined;
  if (!parsedJson) return null;
  if (
    type.includes("CertificateIssuedEvent") &&
    "certificate_id" in parsedJson
  ) {
    return {
      type: "issued",
      data: parsedJson as unknown as CertificateIssuedEvent,
    };
  }
  if (type.includes("CertificateMintedEvent") && "nft_id" in parsedJson) {
    return {
      type: "minted",
      data: parsedJson as unknown as CertificateMintedEvent,
    };
  }
  if (type.includes("UpdateMintTxIdEvent") && "new_label" in parsedJson) {
    return {
      type: "mint_tx_updated",
      data: parsedJson as unknown as UpdateMintTxIdEvent,
    };
  }
  return null;
}
