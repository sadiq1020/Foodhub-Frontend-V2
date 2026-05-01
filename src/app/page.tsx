import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedMeals } from "@/components/home/FeaturedMeals";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
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
      <HowItWorks />
      {/* </Navbar> */}
      <TestimonialsSection />
      <TopProvidersSection />
      <StatsSection />
    </>
  );
}
