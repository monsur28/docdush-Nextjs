"use client";

import { createContext, useContext, useState } from "react";

const SidebarContext = createContext({
  isOpen: true,
  toggleSidebar: () => {},
});

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function UseSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("UseSidebar must be used within a SidebarProvider");
  }
  return context;
}
