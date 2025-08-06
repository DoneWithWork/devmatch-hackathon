import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

export function getSuiClient() {
    const suiClient = new SuiClient({ url: getFullnodeUrl('devnet') });
    return suiClient;
}