import { redirect } from "next/navigation";

export default async function UserPage() {
  return redirect("/dashboard/certificates");
  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-between mb-5 px-4 py-3 z-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Welcome Friend
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Here are the certificates you’ve earned. Click on a certificate to
          view it in full size.
        </p>
      </div>
    </div>
  );
}
