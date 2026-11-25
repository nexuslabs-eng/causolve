import { Outlet } from "react-router-dom";
import MarketingNavbar from "@/features/marketing/components/MarketingNavbar";
import MarketingFooter from "@/features/marketing/components/MarketingFooter";

const MarketingLayout = () => {
  return (
    <div className="relative">
      <div
        id="marketing-scroll-sentinel"
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-px w-px"
      />

      <MarketingNavbar />
      <Outlet />
      <MarketingFooter />
    </div>
  );
};

export default MarketingLayout;
