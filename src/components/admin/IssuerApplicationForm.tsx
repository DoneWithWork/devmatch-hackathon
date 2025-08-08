"use client";

import React, { useState } from "react";

interface IssuerApplication {
  organizationName: string;
  contactEmail: string;
  website?: string;
  description: string;
  walletAddress: string;
}

export function IssuerApplicationForm() {
  const [formData, setFormData] = useState<IssuerApplication>({
    organizationName: "",
    contactEmail: "",
    website: "",
    description: "",
    walletAddress: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("🚀 Submitting form data:", formData);

      // Submit to the API
      const response = await fetch("/api/admin/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      const result = await response.json();
      console.log("📡 Response data:", result);

      if (!response.ok) {
        const errorMessage = result.error || "Failed to submit application";
        throw new Error(errorMessage);
      }

      console.log("✅ Application submitted successfully:", result);
      setSubmitted(true);
    } catch (error) {
      console.error("❌ Error submitting application:", error);
      alert(
        `Failed to submit application: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-800 mb-2">
          Application Submitted Successfully!
        </h2>
        <p className="text-green-700">
          Thank you for your application. Our team will review it and get back
          to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="organizationName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Organization Name *
        </label>
        <input
          type="text"
          id="organizationName"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your organization name"
        />
      </div>

      <div>
        <label
          htmlFor="contactEmail"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Contact Email *
        </label>
        <input
          type="email"
          id="contactEmail"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="contact@yourorganization.com"
        />
      </div>

      <div>
        <label
          htmlFor="website"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Website (Optional)
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://yourorganization.com"
        />
      </div>

      <div>
        <label
          htmlFor="walletAddress"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Sui Wallet Address *
        </label>
        <input
          type="text"
          id="walletAddress"
          name="walletAddress"
          value={formData.walletAddress}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0x..."
          pattern="^0x[a-fA-F0-9]{64}$"
        />
        <p className="text-sm text-gray-500 mt-1">
          Your Sui wallet address for receiving issuer capabilities
        </p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Organization Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your organization and the types of certificates you plan to issue..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded-md font-medium ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white transition duration-200`}
      >
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
