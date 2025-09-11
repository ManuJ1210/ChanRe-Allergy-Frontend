import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onHamburgerClick={() => setDrawerOpen(true)} />
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden cursor-pointer"
            style={{ background: 'transparent' }}
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <main className="flex-1 pt-16 md:ml-[18.5rem] transition-all duration-300">
          <div className="max-w-7xl mx-auto p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
