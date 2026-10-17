import { AppTabs } from "@/components/atlas/app-tabs";

/** The signed-in app: each tab's page, with the tab bar fixed at the bottom. */
export default function AtlasLayout({ children }: LayoutProps<"/atlas">) {
  return (
    <>
      <div className="flex flex-1 flex-col">{children}</div>
      <AppTabs />
    </>
  );
}
