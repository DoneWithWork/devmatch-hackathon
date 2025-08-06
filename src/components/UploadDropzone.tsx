"use client";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { generateUploadDropzone } from "@uploadthing/react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
const UploadDropzoneCom = generateUploadDropzone<OurFileRouter>();

export const OurUploadDropzone = ({
  setFileUrls,
}: {
  setFileUrls: Dispatch<SetStateAction<string[]>>;
}) => (
  <UploadDropzoneCom
    endpoint={"imageUploader"}
    onClientUploadComplete={(res) => {
      // Do something with the response
      console.log("Files: ", res);
      const urls = res.map((file) => file.name);
      setFileUrls((prev) => [...prev, ...urls]);

      toast.success("Upload completed!");
    }}
    onUploadError={(error: Error) => {
      alert(`ERROR! ${error.message}`);
    }}
    onUploadBegin={(name) => {
      // Do something once upload begins
      console.log("Uploading: ", name);
    }}
    onDrop={(acceptedFiles) => {
      // Do something with the accepted files

      console.log("Accepted files: ", acceptedFiles);
    }}
  />
);
