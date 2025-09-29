import ContactSection from "@/components/home/contact";
import Features from "@/components/home/features";
import FooterHome from "@/components/home/footer";
import { HeroHeader } from "@/components/home/header";
import HeroSection from "@/components/home/hero-section";

export default function HomePage() {
  return (
    <main>
      <HeroHeader />
      <HeroSection />
      <Features />
      <ContactSection />
      <FooterHome />
    </main>
  );
}
