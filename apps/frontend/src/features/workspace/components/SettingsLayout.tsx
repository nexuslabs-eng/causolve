import { Outlet } from "react-router-dom";
import {
  SettingsNavigation,
  type SettingsScope,
} from "@/features/workspace/components/SettingsNavigation";

export const SettingsLayout = ({ scope }: { scope: SettingsScope }) => {
  return (
    <div className="@container/settings mx-0 min-w-0 w-full px-4 py-6 @[720px]:px-6 @[720px]:py-8">
      <div className="grid min-w-0 grid-cols-1 items-start gap-6 @[720px]/settings:grid-cols-[minmax(0,220px)_minmax(0,1fr)] @[720px]/settings:gap-8">
        <SettingsNavigation scope={scope} />

        <section className="min-w-0 self-start border-t border-border pt-6 @[720px]/settings:self-start @[720px]/settings:border-t-0 @[720px]/settings:border-l @[720px]/settings:pt-0 @[720px]/settings:pl-6">
          <Outlet />
        </section>
      </div>
    </div>
  );
};
