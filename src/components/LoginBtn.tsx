"use client";
import { User } from "lucide-react";
import Link from "next/link";
export default function LoginBtn({ text }: { text: string }) {
  return (
    <div>
      <Link
        href={"/sign-in"}
        className="px-4 py-2 cursor-pointer rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <User className="h-4 w-4 inline mr-2" />
        {text}
      </Link>
    </div>
  );
}
