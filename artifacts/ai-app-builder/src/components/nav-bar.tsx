import { Link, useLocation } from "wouter";
import { Cpu, LayoutDashboard, Library } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavBar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Generator", icon: Cpu },
    { href: "/blueprints", label: "Library", icon: Library },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <div className="bg-primary/20 p-2 rounded-md">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <span className="hidden font-bold sm:inline-block font-mono tracking-tight text-lg">
            ARCHITECT<span className="text-primary">.AI</span>
          </span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-primary relative py-2",
                  isActive ? "text-foreground" : "text-foreground/60"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
