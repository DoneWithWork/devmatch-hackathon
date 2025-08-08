import NewCertificateForm from "@/components/issuer/NewCertForm";
import React from "react";

export default function NewIssuer() {
  return (
    <div className="w-full px-2 py-4">
      <h1 className="text-3xl mt-4 font-semibold mb-4 text-center">
        New Certificate
      </h1>

      <NewCertificateForm />
    </div>
  );
}
