"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const Sidebar = ({ menuItems, isCollapsed = false }) => {
  return (
    <nav className="space-y-1">
      {menuItems.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          className="w-full justify-start"
          asChild
        >
          <Link href={item.link}>
            {item.icon}
            {!isCollapsed && <span className="ml-2">{item.label}</span>}
          </Link>
        </Button>
      ))}
    </nav>
  );
};

export default Sidebar;
