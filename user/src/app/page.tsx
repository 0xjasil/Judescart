import Navbar from "@/components/Navbar";
import CategoryStories from "@/components/CategoryStories";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import NewArrivals from "@/components/NewArrivals";
import BenefitsSection from "@/components/BenefitsSection";
import LuckyDrawPoster from "@/components/LuckyDrawPoster";
import RecentlyViewed from "@/components/RecentlyViewed";
import Winners from "@/components/Winners";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 pb-10 sm:pb-14">
        <CategoryStories />
        <Hero />
        <div className="mt-4 sm:mt-5 md:mt-6">
          <Categories />
        </div>
        <div className="mt-6 sm:mt-8 md:mt-10">
          <NewArrivals />
        </div>
        <div className="mt-6 sm:mt-8 md:mt-10">
          <BenefitsSection />
        </div>
        <div className="mt-6 sm:mt-8 md:mt-10">
          <LuckyDrawPoster />
        </div>
        <div className="mt-6 sm:mt-8 md:mt-10">
          <RecentlyViewed />
        </div>
        <div className="mt-6 sm:mt-8 md:mt-10">
          <Winners />
        </div>
      </main>
      <Footer />
    </div>
  );
}
