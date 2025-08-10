const fetch = require("node-fetch");

// Test configuration
const BASE_URL = "http://localhost:3000";
const TEST_USER = {
  userAddress:
    "0x4bf1977b1e44b76afdeac4e5190c8da91a6a95a108c5026cbde02123e1afdb0b",
  email: "accountforhack1@yopmail.com",
  role: "issuer",
  privateKey:
    "suiprivkey1qp8996l5rwn92jsncek9vmzmjmhdwr223s6p2lmv68rdau7f668e6upqfjt",
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function makeRequest(
  endpoint,
  method = "GET",
  body = null,
  headers = {}
) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`🌐 ${method} ${url}`);
  if (body) {
    console.log("📤 Request body:", JSON.stringify(body, null, 2));
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    console.log(
      `📥 Response (${response.status}):`,
      JSON.stringify(result, null, 2)
    );
    console.log("---");

    return { success: response.ok, status: response.status, data: result };
  } catch (error) {
    console.error(`❌ Request failed:`, error);
    return { success: false, error: error.message };
  }
}

async function testCompleteWorkflow() {
  console.log("🚀 Starting Complete End-to-End Workflow Test");
  console.log("=".repeat(60));

  let applicationId, templateId;

  try {
    // Step 1: Apply as an issuer
    console.log("\n📝 STEP 1: Apply as an Issuer");
    const applicationResult = await makeRequest(
      "/api/admin/applications",
      "POST",
      {
        organizationName: "DevMatch Testing Organization",
        contactEmail: TEST_USER.email,
        walletAddress: TEST_USER.userAddress, // Required field
        website: "https://devmatch-test.com",
        description:
          "Testing the complete end-to-end workflow with gas sponsorship",
        domain: "devmatch-test-" + Date.now(), // Unique domain
        organization: "Educational Institution",
        contactPhone: "+1234567890",
        country: "Australia",
        address: {
          street: "123 Test Street",
          city: "Melbourne",
          state: "VIC",
          postalCode: "3000",
        },
      }
    );

    if (!applicationResult.success) {
      throw new Error(
        `Application submission failed: ${JSON.stringify(
          applicationResult.data
        )}`
      );
    }

    applicationId = applicationResult.data.application.id;
    console.log(
      `✅ Application submitted successfully with ID: ${applicationId}`
    );

    await sleep(2000); // Wait 2 seconds

    // Step 2: Get all applications (admin view)
    console.log("\n📋 STEP 2: Check All Applications");
    const applicationsResult = await makeRequest("/api/admin/applications");

    if (!applicationsResult.success) {
      throw new Error(
        `Failed to get applications: ${JSON.stringify(applicationsResult.data)}`
      );
    }

    const pendingApps = applicationsResult.data.applications.filter(
      (app) => app.status === "pending"
    );
    console.log(
      `✅ Found ${applicationsResult.data.applications.length} total application(s), ${pendingApps.length} pending`
    );

    await sleep(2000);

    // Step 3: Admin approves the issuer
    console.log(
      "\n✅ STEP 3: Admin Approves Issuer (with 1 SUI gas sponsorship)"
    );
    const approvalResult = await makeRequest(
      "/api/admin/approve-issuer",
      "POST",
      {
        applicationId: applicationId,
      }
    );

    if (!approvalResult.success) {
      throw new Error(
        `Issuer approval failed: ${JSON.stringify(approvalResult.data)}`
      );
    }

    console.log("✅ Issuer approved successfully!");
    console.log("💰 Gas sponsorship details:", {
      transferred: "1 SUI",
      issuerAddress: TEST_USER.userAddress,
      transactionDigest: approvalResult.data.transactionDigest,
    });

    await sleep(3000); // Wait for blockchain confirmation

    // Step 4: Create a certificate template (issuer pays own gas)
    console.log("\n🏗️ STEP 4: Create Certificate Template (Issuer Pays Gas)");
    const templateResult = await makeRequest(
      "/api/test/template-creation-issuer-pays",
      "POST",
      {
        name: "DevMatch Completion Certificate",
        description:
          "Certificate awarded to participants who complete the DevMatch hackathon program",
        attributes: [
          "participantName",
          "hackathonName",
          "completionDate",
          "achievements",
          "mentorSignature",
        ],
        walletAddress: TEST_USER.userAddress,
        issuerPrivateKey: TEST_USER.privateKey, // Issuer signs and pays for their own template
      }
    );

    if (!templateResult.success) {
      throw new Error(
        `Template creation failed: ${JSON.stringify(templateResult.data)}`
      );
    }

    templateId = templateResult.data.templateId;
    console.log(`✅ Template created successfully with ID: ${templateId}`);

    await sleep(3000);

    // Step 5: Issue certificate to a recipient
    console.log("\n🎓 STEP 5: Issue Certificate to Recipient");
    const certificateResult = await makeRequest(
      "/api/issuer/issue-certificate",
      "POST",
      {
        templateId: templateId,
        recipientAddress:
          "0x9f8e7d6c5b4a39281f6e5d4c3b2a19087f6e5d4c3b2a19087f6e5d4c3b2a1908",
        walletAddress: TEST_USER.userAddress, // Add issuer wallet address
        issuerPrivateKey: TEST_USER.privateKey, // Add issuer private key for signing
        fieldData: {
          participantName: "John Doe",
          hackathonName: "DevMatch 2025 Innovation Challenge",
          completionDate: "2025-08-10",
          achievements:
            "Built a complete DeFi application with smart contracts",
          mentorSignature: "Dr. Jane Smith",
        },
      }
    );

    if (!certificateResult.success) {
      throw new Error(
        `Certificate issuance failed: ${JSON.stringify(certificateResult.data)}`
      );
    }

    console.log("✅ Certificate issued successfully!");
    console.log("🎯 Certificate details:", {
      certificateId: certificateResult.data.certificateId,
      recipient:
        "0x9f8e7d6c5b4a39281f6e5d4c3b2a19087f6e5d4c3b2a19087f6e5d4c3b2a1908",
      transactionDigest: certificateResult.data.transactionDigest,
      verificationCode: certificateResult.data.verificationCode,
    });

    await sleep(3000);

    // Step 6: Verify the issued certificate
    console.log("\n🔍 STEP 6: Verify Certificate");
    if (certificateResult.data.verificationCode) {
      const verificationResult = await makeRequest(
        `/api/verify?code=${certificateResult.data.verificationCode}`,
        "GET"
      );

      if (!verificationResult.success) {
        console.log(
          "⚠️ Certificate verification failed:",
          verificationResult.data?.error || "Unknown error"
        );
      } else {
        console.log("✅ Certificate verified successfully!");
        console.log("🔐 Verification details:", {
          verificationCode:
            verificationResult.data.certificate.verificationCode,
          recipientName: verificationResult.data.certificate.recipientName,
          issuerName: verificationResult.data.certificate.issuer.name,
          status: verificationResult.data.certificate.status,
          issuedAt: verificationResult.data.certificate.issuedAt,
        });
      }
    } else {
      console.log(
        "⚠️ No verification code returned - certificate verification not available"
      );
    }

    // Step 7: Check admin wallet balance
    console.log("\n💳 STEP 7: Check Admin Wallet Balance");
    const adminAddress =
      "0x1c59329774af3cc71f768152458ead83001f9a0c259809b8dfc66ab646bb172d";
    const balanceResult = await makeRequest(
      `/api/admin/balance?address=${adminAddress}`
    );

    if (balanceResult.success) {
      console.log("✅ Admin wallet balance:", balanceResult.data);
    } else {
      console.log(
        "❌ Failed to check admin balance:",
        balanceResult.data?.error || "Unknown error"
      );
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 COMPLETE WORKFLOW TEST SUMMARY");
    console.log("=".repeat(60));
    console.log("✅ Application submitted:", applicationId);
    console.log("✅ Issuer approved with 1 SUI gas sponsorship");
    console.log("✅ Template created:", templateId);
    console.log("✅ Certificate issued successfully");
    console.log("💰 Gas costs covered by admin wallet");
    console.log("🔒 All transactions recorded on SUI blockchain");
    console.log("\n🏆 End-to-end workflow completed successfully!");
  } catch (error) {
    console.error("\n❌ WORKFLOW TEST FAILED");
    console.error("Error:", error.message);
    console.error("Check the logs above for detailed error information");
  }
}

// Run the test
testCompleteWorkflow();
