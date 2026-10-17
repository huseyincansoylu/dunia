import { AppTabs } from "@/components/atlas/app-tabs";

/** The signed-in app: each tab's page, with the tab bar fixed at the bottom. */
export default function AtlasLayout({ children }: LayoutProps<"/atlas">) {
  return (
    <>
      {/* Bottom padding keeps content clear of the tab bar. */}
      <div className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))]">{children}</div>
      <AppTabs />
    </>
  );
}
