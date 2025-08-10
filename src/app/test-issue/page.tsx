import { CertificateIssuanceForm } from "@/components/issuer/CertificateIssuanceForm";

export default function TestIssuePage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Test Certificate Issuance
          </h1>
          <p className="text-gray-600">
            Test the certificate issuance system without authentication
          </p>
        </div>
        <CertificateIssuanceForm />
      </div>
    </div>
  );
}
