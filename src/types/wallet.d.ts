// Global type definitions for SUI Wallet
declare global {
  interface Window {
    suiWallet?: {
      signTransactionBlock: (params: {
        transactionBlock: Uint8Array;
      }) => Promise<{
        transactionBlockBytes: Uint8Array;
        signature: string;
      }>;
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      getAccounts: () => Promise<string[]>;
    };
  }
}

export {};
