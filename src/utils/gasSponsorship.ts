import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromBase64 } from "@mysten/sui/utils";

const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });

export async function sponsorGasForIssuer(
  issuerAddress: string
): Promise<boolean> {
  try {
    const sponsorPrivateKey = process.env.ADMIN_PRIVATE_KEY!;

    if (!sponsorPrivateKey) {
      console.error("❌ No sponsor private key available");
      return false;
    }

    // Parse sponsor keypair
    let sponsorKeypair: Ed25519Keypair;

    try {
      if (sponsorPrivateKey.startsWith("suiprivkey1")) {
        const fullDecoded = fromBase64(sponsorPrivateKey.slice(11));
        if (fullDecoded.length === 33 && fullDecoded[0] === 0) {
          sponsorKeypair = Ed25519Keypair.fromSecretKey(fullDecoded.slice(1));
        } else {
          const decoded = fromBase64(sponsorPrivateKey.slice(11));
          if (decoded.length >= 32) {
            sponsorKeypair = Ed25519Keypair.fromSecretKey(decoded.slice(0, 32));
          } else {
            throw new Error("Invalid key length");
          }
        }
      } else {
        sponsorKeypair = Ed25519Keypair.fromSecretKey(
          fromBase64(sponsorPrivateKey)
        );
      }
    } catch (error) {
      console.error("❌ Failed to parse sponsor private key:", error);
      return false;
    }

    const sponsorAddress = sponsorKeypair.getPublicKey().toSuiAddress();

    // Check issuer's current balance
    const issuerBalance = await client.getBalance({ owner: issuerAddress });
    console.log(
      `💰 Issuer ${issuerAddress} balance:`,
      issuerBalance.totalBalance
    );

    // If issuer has less than 0.05 SUI, send them 0.1 SUI for gas
    const minBalance = 50000000; // 0.05 SUI in MIST
    const transferAmount = 100000000; // 0.1 SUI in MIST

    if (parseInt(issuerBalance.totalBalance) < minBalance) {
      console.log(
        `💰 Sponsoring ${transferAmount} MIST gas for issuer ${issuerAddress}`
      );

      // Check sponsor balance
      const sponsorBalance = await client.getBalance({ owner: sponsorAddress });
      if (parseInt(sponsorBalance.totalBalance) < transferAmount + 10000000) {
        // Need extra for transaction fee
        console.error("❌ Sponsor has insufficient balance for gas transfer");
        return false;
      }

      // Create gas transfer transaction
      const txb = new Transaction();
      const [coin] = txb.splitCoins(txb.gas, [transferAmount]);
      txb.transferObjects([coin], issuerAddress);
      txb.setGasBudget(10000000); // 10M MIST for gas transfer

      const result = await client.signAndExecuteTransaction({
        transaction: txb,
        signer: sponsorKeypair,
        options: {
          showEffects: true,
        },
      });

      if (result.effects?.status?.status === "success") {
        console.log(
          `✅ Successfully transferred gas to issuer ${issuerAddress}`
        );
        console.log(`📜 Transaction digest: ${result.digest}`);
        return true;
      } else {
        console.error("❌ Gas transfer transaction failed");
        return false;
      }
    } else {
      console.log(`✅ Issuer ${issuerAddress} has sufficient gas balance`);
      return true;
    }
  } catch (error) {
    console.error("❌ Error in gas sponsorship:", error);
    return false;
  }
}

export async function executeWithIssuerGas<T>(
  issuerAddress: string,
  transactionBuilder: () => Transaction,
  description: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    console.log(`🏗️ Creating transaction with issuer gas: ${description}`);
    console.log(`💰 Issuer address: ${issuerAddress}`);

    // Check issuer's balance first
    const issuerBalance = await client.getBalance({ owner: issuerAddress });
    const balanceNumber = parseInt(issuerBalance.totalBalance);

    console.log(`💰 Issuer ${issuerAddress} balance: ${balanceNumber} MIST`);

    // Minimum required: 100M MIST (0.1 SUI) for gas
    if (balanceNumber < 100000000) {
      console.error(
        `⚠️ Issuer has insufficient gas (${balanceNumber} MIST), minimum required: 100M MIST`
      );
      return {
        success: false,
        error: `Insufficient gas balance. Current: ${(
          balanceNumber / 1000000000
        ).toFixed(
          2
        )} SUI, Required: 0.1 SUI minimum. Please contact admin for gas sponsorship.`,
      };
    }

    console.log(
      `✅ Issuer has sufficient gas balance: ${(
        balanceNumber / 1000000000
      ).toFixed(2)} SUI`
    );

    // Handle Sui private key format - Use the same robust parsing as approve-issuer
    const sponsorPrivateKey = process.env.ADMIN_PRIVATE_KEY!;
    let sponsorKeypair: Ed25519Keypair;

    if (sponsorPrivateKey.startsWith("suiprivkey1")) {
      try {
        // Method 1: Try using the SDK's direct import
        sponsorKeypair = Ed25519Keypair.fromSecretKey(sponsorPrivateKey);
        console.log("✅ SDK direct import worked");
      } catch (sdkError) {
        console.log("❌ SDK direct import failed:", sdkError);
        try {
          // Method 2: Try decoding and using as-is
          const fullDecoded = fromBase64(sponsorPrivateKey.slice(11));
          sponsorKeypair = Ed25519Keypair.fromSecretKey(fullDecoded);
          console.log("✅ Full decoded import worked");
        } catch (fullError) {
          console.log("❌ Full decoded import failed:", fullError);
          // Method 3: Manual parsing (current approach)
          const decoded = fromBase64(sponsorPrivateKey.slice(11));
          const privateKeyBytes = decoded.slice(1, 33); // Skip flag, take 32 bytes
          sponsorKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
          console.log("✅ Using manual parsing as fallback");
        }
      }

      const derivedAddress = sponsorKeypair.getPublicKey().toSuiAddress();
      console.log("🔍 Admin address verification:");
      console.log("  Expected:", process.env.ADMIN_ADDRESS);
      console.log("  Derived: ", derivedAddress);
      console.log("  Match:   ", derivedAddress === process.env.ADMIN_ADDRESS);
    } else {
      sponsorKeypair = Ed25519Keypair.fromSecretKey(
        fromBase64(sponsorPrivateKey)
      );
    }

    // Get admin address for gas coin selection
    const adminAddress = sponsorKeypair.toSuiAddress();

    // Get gas coins for the admin wallet (since we're executing as admin)
    const gasCoins = await client.getCoins({
      owner: adminAddress,
      coinType: "0x2::sui::SUI",
    });

    if (!gasCoins.data || gasCoins.data.length === 0) {
      console.error(`❌ No gas coins found for admin wallet: ${adminAddress}`);
      return {
        success: false,
        error:
          "Admin wallet has no gas coins available for transaction execution",
      };
    }

    // Build and execute the transaction
    const txb = transactionBuilder();

    // Set a reasonable gas budget
    txb.setGasBudget(100000000); // 100M MIST

    // Set gas payment using the first available admin gas coin
    txb.setGasPayment([
      {
        objectId: gasCoins.data[0].coinObjectId,
        version: gasCoins.data[0].version,
        digest: gasCoins.data[0].digest,
      },
    ]);

    console.log(`🏗️ Executing transaction: ${description}`);
    console.log(
      `💡 Admin executing transaction, issuer has sufficient balance to cover costs`
    );
    console.log(
      `⛽ Using admin gas coin: ${gasCoins.data[0].coinObjectId} with balance: ${gasCoins.data[0].balance} MIST`
    );

    const result = await client.signAndExecuteTransaction({
      transaction: txb,
      signer: sponsorKeypair,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    if (result.effects?.status?.status === "success") {
      console.log(`✅ Transaction successful: ${description}`);
      console.log(
        `⛽ Gas used: ${
          result.effects.gasUsed?.computationCost || "unknown"
        } MIST`
      );
      console.log(
        `💡 Conceptually charged to issuer (they have sufficient sponsored SUI)`
      );
      return { success: true, data: result as T };
    } else {
      console.error(`❌ Transaction failed: ${description}`);
      console.error("Transaction effects:", result.effects);
      return { success: false, error: "Transaction execution failed" };
    }
  } catch (error) {
    console.error(`❌ Error in transaction execution: ${description}`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function executeWithGasSponsorship<T>(
  issuerAddress: string,
  transactionBuilder: () => Transaction,
  description: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    // Check issuer's current balance
    const issuerBalance = await client.getBalance({ owner: issuerAddress });
    const balanceNumber = parseInt(issuerBalance.totalBalance);

    console.log(`💰 Issuer ${issuerAddress} balance: ${balanceNumber} MIST`);

    // Check if issuer has sufficient gas (at least 100M MIST for transaction)
    if (balanceNumber < 100000000) {
      console.log(
        `⚠️ Issuer has insufficient gas (${balanceNumber} MIST), minimum required: 100M MIST`
      );
      return {
        success: false,
        error: `Insufficient gas balance. Current: ${(
          balanceNumber / 1000000000
        ).toFixed(
          2
        )} SUI, Required: 0.1 SUI minimum. Please contact admin for gas sponsorship.`,
      };
    }

    console.log(
      `✅ Issuer has sufficient gas balance: ${(
        balanceNumber / 1000000000
      ).toFixed(2)} SUI`
    );

    // Since this is a server-side operation and we don't have the issuer's private key,
    // we'll use the admin to execute the transaction on behalf of the issuer
    // The gas cost will conceptually be "charged" to the issuer

    // Handle Sui private key format - Use the same robust parsing as approve-issuer
    const sponsorPrivateKey = process.env.ADMIN_PRIVATE_KEY!;
    let sponsorKeypair: Ed25519Keypair;

    if (sponsorPrivateKey.startsWith("suiprivkey1")) {
      try {
        // Method 1: Try using the SDK's direct import
        sponsorKeypair = Ed25519Keypair.fromSecretKey(sponsorPrivateKey);
        console.log("✅ SDK direct import worked");
      } catch (sdkError) {
        console.log("❌ SDK direct import failed:", sdkError);
        try {
          // Method 2: Try decoding and using as-is
          const fullDecoded = fromBase64(sponsorPrivateKey.slice(11));
          sponsorKeypair = Ed25519Keypair.fromSecretKey(fullDecoded);
          console.log("✅ Full decoded import worked");
        } catch (fullError) {
          console.log("❌ Full decoded import failed:", fullError);
          // Method 3: Manual parsing (current approach)
          const decoded = fromBase64(sponsorPrivateKey.slice(11));
          const privateKeyBytes = decoded.slice(1, 33); // Skip flag, take 32 bytes
          sponsorKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
          console.log("✅ Using manual parsing as fallback");
        }
      }

      const derivedAddress = sponsorKeypair.getPublicKey().toSuiAddress();
      console.log("🔍 Admin address verification:");
      console.log("  Expected:", process.env.ADMIN_ADDRESS);
      console.log("  Derived: ", derivedAddress);
      console.log("  Match:   ", derivedAddress === process.env.ADMIN_ADDRESS);
    } else {
      sponsorKeypair = Ed25519Keypair.fromSecretKey(
        fromBase64(sponsorPrivateKey)
      );
    }

    // Get admin address for gas coin selection
    const adminAddress = sponsorKeypair.toSuiAddress();

    // Get gas coins for the admin wallet
    const gasCoins = await client.getCoins({
      owner: adminAddress,
      coinType: "0x2::sui::SUI",
    });

    if (!gasCoins.data || gasCoins.data.length === 0) {
      console.error(`❌ No gas coins found for admin wallet: ${adminAddress}`);
      return {
        success: false,
        error: "Admin wallet has no gas coins available for transaction",
      };
    }

    // Build and execute the transaction
    const txb = transactionBuilder();

    // Set a reasonable gas budget
    txb.setGasBudget(100000000); // 100M MIST

    // Set gas payment using the first available gas coin
    txb.setGasPayment([
      {
        objectId: gasCoins.data[0].coinObjectId,
        version: gasCoins.data[0].version,
        digest: gasCoins.data[0].digest,
      },
    ]);

    console.log(`🏗️ Executing transaction: ${description}`);
    console.log(
      `💡 Admin executing on behalf of issuer (server-side operation)`
    );
    console.log(
      `⛽ Using gas coin: ${gasCoins.data[0].coinObjectId} with balance: ${gasCoins.data[0].balance} MIST`
    );

    const result = await client.signAndExecuteTransaction({
      transaction: txb,
      signer: sponsorKeypair,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    if (result.effects?.status?.status === "success") {
      console.log(`✅ Transaction successful: ${description}`);
      console.log(
        `⛽ Gas used: ${
          result.effects.gasUsed?.computationCost || "unknown"
        } MIST`
      );
      return { success: true, data: result as T };
    } else {
      console.error(`❌ Transaction failed: ${description}`);
      console.error("Transaction effects:", result.effects);
      return { success: false, error: "Transaction execution failed" };
    }
  } catch (error) {
    console.error(`❌ Error in transaction execution: ${description}`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
