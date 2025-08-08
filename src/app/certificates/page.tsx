import { UserCertificatesDashboard } from "@/components/user/UserCertificatesDashboard";
import AuthLayout from "@/components/layouts/AuthLayout";

export default function CertificatesPage() {
  return (
    <AuthLayout>
      <div className="container mx-auto py-8">
        <UserCertificatesDashboard />
      </div>
    </AuthLayout>
  );
}
