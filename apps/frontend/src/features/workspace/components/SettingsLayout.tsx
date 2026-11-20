import { Outlet } from "react-router-dom";
import {
  SettingsNavigation,
  type SettingsScope,
} from "@/features/workspace/components/SettingsNavigation";

export const SettingsLayout = ({ scope }: { scope: SettingsScope }) => {
  return (
    <div className="@container mx-auto w-full max-w-5xl px-4 py-6 lg:px-10 lg:py-8">
      <div className="grid grid-cols-1 gap-6 @[650px]:grid-cols-[220px_minmax(0,1fr)] @[650px]:gap-10">
        <SettingsNavigation scope={scope} />

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
};
