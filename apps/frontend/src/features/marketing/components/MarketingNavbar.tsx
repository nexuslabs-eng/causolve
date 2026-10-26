import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useUiStore } from "@/stores/use-ui-store";
import { ResolutionNode } from "@/components/brand/ResolutionNode";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why Causolve", href: "#why-causolve" },
  { label: "Security", href: "#security" },
];

const MarketingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  const navigate = useNavigate();


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full pt-3 sm:pt-4">
      <div className="mx-auto w-full max-w-310 px-4 sm:px-8">
        <div
          className={cn(
            "rounded-xl border transition-[background-color,border-color,box-shadow] duration-300",
            scrolled
              ? "border-border-strong bg-surface/85 shadow-(--shadow-panel) backdrop-blur-xl"
              : "border-border bg-surface/55 backdrop-blur-md",
          )}
        >
          <div className="flex h-14 items-center gap-6 px-3 pr-2 sm:px-4 sm:pr-3">
            <a href="#top" className="flex shrink-0 items-center gap-2.5 text-primary-bright">
              <ResolutionNode className="h-6" title="Causolve" />
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
                Causolve
              </span>
            </a>

            <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center gap-0.5 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="ml-auto hidden items-center gap-1.5 md:flex">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/login")}
              >
                Sign in
              </Button>
              <Button size="sm" variant="default" onClick={() => navigate("/signup/account")}>
                Request Access
              </Button>
            </div>

            <ThemeToggle />

            <Button
              type="button"
              size="icon"
              variant="subtle"
              onClick={toggleMobileNav}
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground md:hidden cursor-pointer"
            >
              {mobileNavOpen 
                ? <X className="h-4 w-4" /> 
                : <Menu className="h-4 w-4" />
              }
            </Button>
          </div>

          {mobileNavOpen && (
            <div className="border-t border-border md:hidden">
              <nav aria-label="Mobile" className="flex flex-col p-3">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-md px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setMobileNavOpen(false);
                    navigate("/login");
                  }}>
                    Sign in
                  </Button>
                  <Button variant="brand" size="sm" onClick={() => {
                    setMobileNavOpen(false);
                    navigate("/signup/account");
                  }}>
                    Request Access
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default MarketingNavbar;
