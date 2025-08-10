const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");

const client = new SuiClient({ url: getFullnodeUrl("devnet") });

async function checkAdminBalance() {
  try {
    console.log("💰 Checking admin wallet balance and gas coins...");

    const adminAddress =
      "0x7e7994f5eb50e7cc88283432907a167236c4bffed5b0fa375cbd1dc1373c1798";

    // Check total balance
    const balance = await client.getBalance({
      owner: adminAddress,
    });

    console.log(`📊 Admin Balance:`);
    console.log(
      `   Total: ${balance.totalBalance} MIST (${
        parseInt(balance.totalBalance) / 1_000_000_000
      } SUI)`
    );
    console.log(`   Coin Count: ${balance.coinObjectCount}`);

    // Get all SUI coins
    const coins = await client.getCoins({
      owner: adminAddress,
      coinType: "0x2::sui::SUI",
    });

    console.log(`\n🪙 SUI Coins owned by admin:`);
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

    if (suitableCoins.length > 0) {
      console.log("✅ Admin has sufficient gas coins");
      suitableCoins.forEach((coin, i) => {
        console.log(
          `   Coin ${i + 1}: ${coin.coinObjectId} (${coin.balance} MIST)`
        );
      });
    } else {
      console.log("❌ Admin does not have sufficient gas coins");
      console.log(
        "💡 Consider funding the admin address or using a different address"
      );
    }
  } catch (error) {
    console.error("❌ Error checking admin balance:", error);
  }
}

checkAdminBalance();
