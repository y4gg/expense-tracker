"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserDropdown } from "@/components/dashboard/user-dropdown";
import {
  LayoutDashboard,
  List,
  Tag,
  Settings,
  Menu,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/dashboard/transactions", label: "Transactions", icon: <List className="h-5 w-5" /> },
  { href: "/dashboard/categories", label: "Categories", icon: <Tag className="h-5 w-5" /> },
  { href: "/dashboard/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

interface NavLinksProps {
  pathname: string;
  mobile?: boolean;
  onClose?: () => void;
}

function NavLinks({ pathname, mobile, onClose }: NavLinksProps) {
  return (
    <nav className="flex-1 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Button
            key={item.href}
            variant={isActive ? "default" : "ghost"}
            className={`w-full justify-start gap-3 ${mobile ? "text-left" : ""}`}
            asChild
            onClick={onClose}
          >
            <a href={item.href}>
              {item.icon}
              {item.label}
            </a>
          </Button>
        );
      })}
    </nav>
  );
}

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">Financial Tracker</h1>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <NavLinks pathname={pathname} />
          <div className="mt-auto border-t pt-4">
            <UserDropdown userName={userName} userEmail={userEmail} />
          </div>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">Financial Tracker</h1>
          </div>
          <div className="flex h-[calc(100vh-4rem)] flex-col p-4">
            <NavLinks pathname={pathname} mobile onClose={() => setOpen(false)} />
            <div className="mt-auto border-t pt-4">
              <UserDropdown userName={userName} userEmail={userEmail} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
