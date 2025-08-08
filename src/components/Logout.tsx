import { LogoutAction } from "@/app/actions/LogoutAction";
import { LogOut } from "lucide-react";
import { useActionState, useTransition } from "react";

export default function Logout() {
  const [, action] = useActionState(LogoutAction, {});
  const [, startTransition] = useTransition();
  function Logout() {
    startTransition(async () => {
      await action();
    });
  }
  return (
    <div>
      <button
        onClick={Logout}
        className="px-4 py-2 cursor-pointer rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <LogOut className="h-4 w-4 inline mr-2" />
        Logout
      </button>
    </div>
  );
}
