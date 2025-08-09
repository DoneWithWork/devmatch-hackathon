import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

export default function NewCertificateBtn() {
  return (
    <Button asChild>
      <Link
        href={"/dashboard/issuer/new"}
        className="hover:scale-105 duration-300 h-12 cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all hover:shadow-xl transform hover:scale-[101%]"
      >
        <Plus size={10} className="size-6" />
        <span>New Certificate</span>
      </Link>
    </Button>
  );
}
