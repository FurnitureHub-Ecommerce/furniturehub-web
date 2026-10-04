import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import SearchModal from '../../common/SearchModal/SearchModal';
import CartDrawer from '../CartDrawer/CartDrawer';
import QuickViewModal from '../../common/QuickViewModal/QuickViewModal';

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      <SearchModal />
      <CartDrawer />
      <QuickViewModal />
    </div>
  );
}

export const CustomerLayout = MainLayout;
export default MainLayout;