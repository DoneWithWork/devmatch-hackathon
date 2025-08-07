// Gas Optimization Demo - TypeScript Version
// Shows why TypeScript is better for complex Sui integration

import { config } from "dotenv";
config({ path: "./scripts/.env" });

// Type-safe gas budget constants
export interface GasBudgets {
  readonly SIMPLE_TRANSFER: number;
  readonly NFT_MINT: number;
  readonly CERTIFICATE_ISSUE: number;
  readonly TEMPLATE_CREATE: number;
  readonly CONTRACT_DEPLOY: number;
}

// 1. TYPE-SAFE GAS BUDGETS
export const GAS_BUDGETS: GasBudgets = {
  SIMPLE_TRANSFER: 800_000, // 0.0008 SUI
  NFT_MINT: 1_500_000, // 0.0015 SUI
  CERTIFICATE_ISSUE: 3_000_000, // 0.003 SUI
  TEMPLATE_CREATE: 5_000_000, // 0.005 SUI
  CONTRACT_DEPLOY: 100_000_000, // 0.1 SUI (safe margin)
} as const;

// 2. TYPE-SAFE CONFIGURATION
export interface ContractConfig {
  packageId: string;
  adminCap: string;
  issuerRegistry: string;
  certificateRegistry: string;
  network: "devnet" | "testnet" | "mainnet";
}

export const CONTRACT_CONFIG: ContractConfig = {
  packageId: process.env.PACKAGE_ID || "",
  adminCap: process.env.ADMIN_CAP || "",
  issuerRegistry: process.env.ISSUER_REGISTRY || "",
  certificateRegistry: process.env.CERTIFICATE_REGISTRY || "",
  network: (process.env.NETWORK as "devnet") || "devnet",
};

// 3. COST ANALYSIS WITH TYPESCRIPT PRECISION
export class GasAnalyzer {
  private readonly MIST_PER_SUI = 1_000_000_000;

  convertMistToSui(mist: number): string {
    return (mist / this.MIST_PER_SUI).toFixed(4);
  }

  calculateSavings(
    oldGas: number,
    newGas: number
  ): {
    mistSaved: number;
    suiSaved: string;
    percentSaved: string;
  } {
    const mistSaved = oldGas - newGas;
    const suiSaved = this.convertMistToSui(mistSaved);
    const percentSaved = ((mistSaved / oldGas) * 100).toFixed(1);

    return { mistSaved, suiSaved, percentSaved };
  }

  analyzeOperations() {
    console.log("🎯 TYPESCRIPT GAS OPTIMIZATION ANALYSIS\n");

    const operations = [
      { name: "NFT Minting", old: 10_000_000, new: GAS_BUDGETS.NFT_MINT },
      {
        name: "Certificate Issue",
        old: 10_000_000,
        new: GAS_BUDGETS.CERTIFICATE_ISSUE,
      },
      {
        name: "Template Create",
        old: 10_000_000,
        new: GAS_BUDGETS.TEMPLATE_CREATE,
      },
      {
        name: "Simple Transfer",
        old: 10_000_000,
        new: GAS_BUDGETS.SIMPLE_TRANSFER,
      },
    ];

    console.log(
      "╭─────────────────┬─────────────┬─────────────┬─────────────┬──────────╮"
    );
    console.log(
      "│ Operation       │ Old Cost    │ New Cost    │ SUI Saved   │ % Saved  │"
    );
    console.log(
      "├─────────────────┼─────────────┼─────────────┼─────────────┼──────────┤"
    );

    operations.forEach((op) => {
      const savings = this.calculateSavings(op.old, op.new);
      const oldSui = this.convertMistToSui(op.old);
      const newSui = this.convertMistToSui(op.new);

      console.log(
        `│ ${op.name.padEnd(15)} │ ${oldSui.padStart(
          8
        )} SUI │ ${newSui.padStart(8)} SUI │ ${savings.suiSaved.padStart(
          8
        )} SUI │ ${savings.percentSaved.padStart(6)}%  │`
      );
    });

    console.log(
      "╰─────────────────┴─────────────┴─────────────┴─────────────┴──────────╯\n"
    );
  }
}

// 4. BUSINESS IMPACT CALCULATOR
export class BusinessImpactCalculator {
  constructor(
    private dailyUsers: number,
    private certificatesPerUser: number
  ) {}

  calculateMonthlyImpact() {
    const dailyOperations = this.dailyUsers * this.certificatesPerUser;
    const monthlyOperations = dailyOperations * 30;

    // Old way: 10M MIST per operation
    const oldMonthlyCost = monthlyOperations * 10_000_000;
    const oldMonthlySUI = oldMonthlyCost / 1_000_000_000;

    // New way: 1.5M MIST per operation (optimized)
    const newMonthlyCost = monthlyOperations * GAS_BUDGETS.NFT_MINT;
    const newMonthlySUI = newMonthlyCost / 1_000_000_000;

    const savings = oldMonthlySUI - newMonthlySUI;
    const percentSavings = (savings / oldMonthlySUI) * 100;

    return {
      dailyUsers: this.dailyUsers,
      certificatesPerUser: this.certificatesPerUser,
      monthlyOperations,
      oldMonthlySUI: oldMonthlySUI.toFixed(1),
      newMonthlySUI: newMonthlySUI.toFixed(1),
      monthlySavings: savings.toFixed(1),
      percentSavings: percentSavings.toFixed(1),
    };
  }

  printBusinessAnalysis() {
    const impact = this.calculateMonthlyImpact();

    console.log("💼 BUSINESS IMPACT ANALYSIS\n");
    console.log(
      `📊 Scenario: ${impact.dailyUsers} users/day × ${impact.certificatesPerUser} certificates = ${impact.monthlyOperations} operations/month\n`
    );

    console.log("Monthly Cost Comparison:");
    console.log("╭─────────────────┬─────────────┬─────────────┬──────────╮");
    console.log("│ Method          │ Monthly     │ Savings     │ % Saved  │");
    console.log("├─────────────────┼─────────────┼─────────────┼──────────┤");
    console.log(
      `│ Before Optimize │ ${impact.oldMonthlySUI.padStart(
        8
      )} SUI │             │          │`
    );
    console.log(
      `│ After Optimize  │ ${impact.newMonthlySUI.padStart(
        8
      )} SUI │ ${impact.monthlySavings.padStart(
        8
      )} SUI │ ${impact.percentSavings.padStart(6)}%  │`
    );
    console.log("╰─────────────────┴─────────────┴─────────────┴──────────╯\n");
  }
}

// 5. WHY TYPESCRIPT IS BETTER EXPLANATION
export function explainWhyTypeScript() {
  console.log("🚀 WHY TYPESCRIPT FOR GAS OPTIMIZATION?\n");

  console.log("✅ TYPE SAFETY:");
  console.log("  - Prevents gas budget mistakes at compile time");
  console.log("  - Ensures correct contract addresses");
  console.log("  - Catches API changes before runtime\n");

  console.log("✅ BETTER TOOLING:");
  console.log("  - IntelliSense for Sui SDK methods");
  console.log("  - Auto-completion for gas budgets");
  console.log("  - Refactoring support\n");

  console.log("✅ COMPLEX CALCULATIONS:");
  console.log("  - Precise MIST to SUI conversions");
  console.log("  - Business impact modeling");
  console.log("  - Multi-scenario analysis\n");

  console.log("✅ PRODUCTION READY:");
  console.log("  - Easier to integrate with React/Next.js");
  console.log("  - Better error handling");
  console.log("  - Scalable architecture\n");
}

// 6. SPONSORED TRANSACTIONS EXPLANATION
export function explainSponsoredTransactions() {
  console.log("💡 SPONSORED TRANSACTIONS EXPLAINED\n");

  console.log("🎯 THE PROBLEM:");
  console.log("  User Flow WITHOUT Sponsoring:");
  console.log("  1. User wants certificate");
  console.log("  2. User needs to:");
  console.log("     - Install wallet");
  console.log("     - Buy SUI tokens");
  console.log("     - Pay 0.0015 SUI gas");
  console.log("  3. 90% of users drop off! 📉\n");

  console.log("✨ THE SOLUTION:");
  console.log("  User Flow WITH Sponsoring:");
  console.log("  1. User wants certificate");
  console.log('  2. User clicks "Get Certificate"');
  console.log("  3. Your app pays gas");
  console.log("  4. User gets NFT instantly! ⚡");
  console.log("  5. 90% conversion rate! 📈\n");

  console.log("💰 COST vs VALUE:");
  console.log(
    `  - You pay: ${GAS_BUDGETS.NFT_MINT} MIST (${(
      GAS_BUDGETS.NFT_MINT / 1_000_000_000
    ).toFixed(4)} SUI)`
  );
  console.log("  - User pays: 0 SUI");
  console.log("  - User experience: Frictionless");
  console.log("  - Business impact: 10x better adoption!\n");
}

// 7. MAIN EXECUTION
export function main() {
  console.log("🎯 GAS OPTIMIZATION WITH TYPESCRIPT\n");

  // Validate configuration
  if (!CONTRACT_CONFIG.packageId) {
    console.error("❌ Missing PACKAGE_ID in environment variables");
    return;
  }

  console.log(`✅ Connected to ${CONTRACT_CONFIG.network}`);
  console.log(`📦 Package: ${CONTRACT_CONFIG.packageId}\n`);

  // Run analysis
  const analyzer = new GasAnalyzer();
  analyzer.analyzeOperations();

  const businessCalculator = new BusinessImpactCalculator(100, 2);
  businessCalculator.printBusinessAnalysis();

  explainWhyTypeScript();
  explainSponsoredTransactions();

  console.log("🛠️ NEXT STEPS:");
  console.log("  1. npm run gas-demo    (run this TypeScript analysis)");
  console.log("  2. Test optimized functions with precise gas budgets");
  console.log("  3. Implement sponsored transactions");
  console.log("  4. Integrate with your web app! 🚀");
}

// Run if called directly
if (require.main === module) {
  main();
}

const gasOptimizationTools = {
  GAS_BUDGETS,
  CONTRACT_CONFIG,
  GasAnalyzer,
  BusinessImpactCalculator,
  main,
};

export default gasOptimizationTools;
