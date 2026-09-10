import HeroSection from './components/HeroSection';
import PromoGrid from './components/PromoGrid';
import ProductTabs from './components/ProductTabs';
import './Home.css';

/**
 * Home – assembles all homepage sections.
 * Sections are added step by step.
 */
function Home() {
  return (
    <>
      <HeroSection />
      <PromoGrid />
      <ProductTabs />
      {/* BestSeller, ProductColumns – coming next */}
    </>
  );
}

export default Home;
