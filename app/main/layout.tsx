"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LineChart,
  Wallet,
  PieChart,
  Plus,
  Gamepad2,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Inicio",
    href: "/main/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Puzzle IA",
    href: "/main/game",
    icon: <Gamepad2 className="h-5 w-5" />,
  },
  { label: "Movimientos", href: "#", icon: <LineChart className="h-5 w-5" /> },
  {
    label: "Presupuesto",
    href: "/main/budget",
    icon: <Wallet className="h-5 w-5" />,
  },
  { label: "Reportes", href: "#", icon: <PieChart className="h-5 w-5" /> },
];

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-neutral-200 bg-white/80 backdrop-blur">
        <div className="px-5 pt-6 pb-4">
          <div className="text-lg font-semibold tracking-tight">
            Gestión de Gastos
          </div>
          <div className="text-xs text-neutral-500">para estudiantes</div>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-neutral-700 hover:bg-blue-50"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <Link
            href="/main/add-expense-income"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white shadow-lg shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </Link>
        </div>
      </aside>

      {/* Main content area with responsive paddings */}
      <main className="md:pl-64 pb-24 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-3xl grid grid-cols-5 items-end gap-1 px-4 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          {navItems.slice(0, 3).map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-md px-3 py-2 text-xs ${
                  active ? "text-blue-600" : "text-neutral-500"
                }`}
              >
                <span className="[&>svg]:h-6 [&>svg]:w-6">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          <div className="relative flex items-center justify-center">
            <Link
              href="/main/add-expense-income"
              className="-translate-y-6 rounded-full bg-blue-600 p-4 text-white shadow-xl shadow-blue-600/30"
            >
              <Plus className="h-6 w-6" />
            </Link>
          </div>

          {navItems.slice(3).map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-md px-3 py-2 text-xs ${
                  active ? "text-blue-600" : "text-neutral-500"
                }`}
              >
                <span className="[&>svg]:h-6 [&>svg]:w-6">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
