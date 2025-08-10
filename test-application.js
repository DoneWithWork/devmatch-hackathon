const fetch = require("node-fetch");

async function testApplication() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/admin/applications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationName: "Test Fixed Org",
          contactEmail: "test@fixedorg.com",
          website: "https://fixedorg.com",
          description: "Testing the fixed private key parsing",
        }),
      }
    );

    const result = await response.json();
    console.log("Application response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error submitting application:", error);
  }
}

testApplication();
