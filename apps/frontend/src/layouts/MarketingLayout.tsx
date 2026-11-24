import { Outlet } from "react-router-dom";
import MarketingNavbar from "@/features/marketing/components/MarketingNavbar";
import MarketingFooter from "@/features/marketing/components/MarketingFooter";

const MarketingLayout = () => {
  return (
    <>
      <MarketingNavbar />
      <Outlet />
      <MarketingFooter />
    </>
  );
};

export default MarketingLayout;
