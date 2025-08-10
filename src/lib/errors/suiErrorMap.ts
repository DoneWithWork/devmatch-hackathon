// Mapping of Move module error codes to human-readable messages for frontend display
// Keep in sync with issuer.move and certificate.move constants.

// Current devmatch_nft::certificate error code mapping (see certificate.move)
// 1  E_ISSUER_NOT_APPROVED
// 2  E_TEMPLATE_OWNERSHIP
// 3  E_TEMPLATE_INACTIVE
// 4  E_FIELD_MISMATCH
// 5  E_ALREADY_MINTED
// 6  E_NOT_RECIPIENT
// 7  E_TOO_MANY_FIELDS
// 8  E_EMPTY_FIELD_NAME
// 9  E_EMPTY_FIELD_VALUE
// 10 E_ALREADY_REVOKED
// 11 E_REVOKED_CANNOT_MINT
// 12 E_NOT_MINTED
// 13 E_LABEL_ALREADY_FINALIZED
export const CERTIFICATE_ERRORS: Record<number, string> = {
  1: "Issuer not approved",
  2: "Template ownership mismatch",
  3: "Template inactive",
  4: "Field name/value length mismatch",
  5: "Certificate already minted",
  6: "Sender not authorized (must match recipient)",
  7: "Too many fields provided",
  8: "Empty field name",
  9: "Empty field value",
  10: "Certificate already revoked",
  11: "Certificate revoked — cannot mint",
  12: "Certificate not yet minted",
  13: "Mint transaction label already finalized",
};

export const ISSUER_ERRORS: Record<number, string> = {
  100: "Name too long",
  101: "Email too long",
  102: "Organization too long",
};

export function decodeCertificateError(code: number): string {
  return CERTIFICATE_ERRORS[code] || `Unknown certificate error (${code})`;
}

export function decodeIssuerError(code: number): string {
  return ISSUER_ERRORS[code] || `Unknown issuer error (${code})`;
}
