import { ReactNode } from "react";
import Navbar from "./Navbar";
import DataModeIndicator from "./DataModeIndicator";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

export function Layout({ children, showNavbar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "pt-16" : ""}>{children}</main>
      <DataModeIndicator />
    </div>
  );
}
