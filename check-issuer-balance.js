const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");

const client = new SuiClient({ url: getFullnodeUrl("devnet") });

async function checkIssuerBalance() {
  try {
    console.log("💰 Checking issuer wallet balance and gas coins...");

    const issuerAddress =
      "0x4bf1977b1e44b76afdeac4e5190c8da91a6a95a108c5026cbde02123e1afdb0b";

    // Check total balance
    const balance = await client.getBalance({
      owner: issuerAddress,
    });

    console.log(`📊 Issuer Balance:`);
    console.log(
      `   Total: ${balance.totalBalance} MIST (${
        parseInt(balance.totalBalance) / 1_000_000_000
      } SUI)`
    );
    console.log(`   Coin Count: ${balance.coinObjectCount}`);

    // Get all SUI coins
    const coins = await client.getCoins({
      owner: issuerAddress,
      coinType: "0x2::sui::SUI",
    });

    console.log(`\n🪙 SUI Coins owned by issuer:`);
    console.log(`   Total coins: ${coins.data.length}`);

    for (const coin of coins.data.slice(0, 5)) {
      // Show first 5 coins
      console.log(`   - ${coin.coinObjectId}: ${coin.balance} MIST`);
    }

    if (coins.data.length > 5) {
      console.log(`   ... and ${coins.data.length - 5} more coins`);
    }

    // Check if there are any large enough coins for gas
    const gasNeeded = 15_000_000; // 15M MIST
    const suitableCoins = coins.data.filter(
      (coin) => parseInt(coin.balance) >= gasNeeded
    );

    console.log(`\n⛽ Gas Analysis:`);
    console.log(`   Gas needed: ${gasNeeded} MIST`);
    console.log(`   Suitable coins: ${suitableCoins.length}`);

    if (suitableCoins.length === 0) {
      console.log("❌ No coins large enough for gas!");
      console.log("💡 Solution: Merge smaller coins or get more SUI");

      // Show how to merge coins
      if (coins.data.length > 1) {
        console.log("\n🔧 Coin merge suggestion:");
        console.log(
          `   Primary coin: ${coins.data[0].coinObjectId} (${coins.data[0].balance} MIST)`
        );
        console.log(
          `   Merge with: ${coins.data
            .slice(1, 4)
            .map((c) => `${c.coinObjectId} (${c.balance})`)
            .join(", ")}`
        );
      }
    } else {
      console.log("✅ Issuer has sufficient gas coins");
    }
  } catch (error) {
    console.error("❌ Error checking balance:", error);
  }
}

checkIssuerBalance();
