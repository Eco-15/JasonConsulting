import { JasonNavbar } from "@/components/ui/jason-navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JasonNavbar />
      <main className="overflow-x-hidden">{children}</main>
    </>
  );
}
