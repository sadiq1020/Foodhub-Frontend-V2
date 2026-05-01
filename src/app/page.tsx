import { CategoriesSection } from "@/components/home/CategoriesSection";
import { CTASection } from "@/components/home/CTASection";
import { FAQSection } from "@/components/home/FAQSection";
import { FeaturedMeals } from "@/components/home/FeaturedMeals";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { NewMealsSection } from "@/components/home/NewMealsSection";
import { StatsSection } from "@/components/home/StatsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TopProvidersSection } from "@/components/home/TopProvidersSection";

export default function Home() {
  return (
    <>
      {/* <Navbar> */}
      <HeroSection />
      <CategoriesSection />
      {/* <Suspense fallback={<FeaturedMealsSkeleton />}> */}
      <FeaturedMeals />
      {/* </Suspense> */}
      <NewMealsSection />
      <HowItWorks />
      {/* </Navbar> */}
      <TestimonialsSection />
      <TopProvidersSection />
      <StatsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
