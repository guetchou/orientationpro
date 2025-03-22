
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavListProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export function NavList({ className, children, ...props }: NavListProps) {
  return (
    <nav className={cn("grid gap-1", className)} {...props}>
      {children}
    </nav>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export function NavItem({ href, label, icon, active }: NavItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-primary/10",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground"
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
}
