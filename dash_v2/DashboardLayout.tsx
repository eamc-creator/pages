import { cn } from "@/lib/utils";
import { BarChart3, LayoutDashboard, Map, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Visão Geral", href: "/" },
    { icon: BarChart3, label: "Análise Detalhada", href: "/analise" },
    { icon: Map, label: "Mapa Estadual", href: "/mapa" },
    { icon: FileText, label: "Relatórios", href: "/relatorios" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tighter">i-Gov TI</h1>
          <p className="text-xs text-muted-foreground mt-1">Governança em TI - SC</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors cursor-pointer",
                  location === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <p>Fonte: TCE/SC</p>
            <p className="mt-1">Atualizado: 2023</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="container py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
