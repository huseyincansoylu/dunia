import { Hero } from "@/components/landing/hero";
import { BioSection, Faq, FinalCta, HowItWorks, OurName, YourPage } from "@/components/landing/sections";
import { SiteFooter, SiteHeader } from "@/components/landing/site-chrome";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <BioSection />
        <HowItWorks />
        <YourPage />
        <OurName />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
