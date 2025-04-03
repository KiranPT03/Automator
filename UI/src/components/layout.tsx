
import { Sidebar } from "./sidebar";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <main className="flex-1 overflow-auto p-5 bg-background">
        <Outlet />
      </main>
    </div>
  );
}
