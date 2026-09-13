import Header from '../layout/Header';
import Footer from '../layout/Footer';

/**
 * MainLayout
 *
 * Wraps every page with the shared Header and Footer.
 * The <main> element grows to fill remaining vertical space,
 * keeping Footer pinned to the bottom even on short pages.
 *
 * Usage:
 *   <MainLayout>
 *     <SomePage />
 *   </MainLayout>
 */
function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </>
  );
}

export default MainLayout;
