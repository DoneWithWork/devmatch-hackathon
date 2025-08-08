"use client";
import { UploadButton } from "@/utils/uploadthing";
import React from "react";

export default function UploadBtnCertificates({
  onUploadComplete,
}: {
  onUploadComplete: (url: string) => void;
}) {
  return (
    <UploadButton
      endpoint="certificateUploader"
      onClientUploadComplete={(res) => {
        const uploadedUrl = res[0]?.ufsUrl;
        if (uploadedUrl) {
          onUploadComplete(uploadedUrl);
          alert("Upload Completed");
        }
      }}
      onUploadError={(error: Error) => {
        alert(`ERROR! ${error.message}`);
      }}
    />
  );
}
