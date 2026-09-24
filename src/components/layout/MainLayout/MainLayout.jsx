import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import SearchModal from '../../common/SearchModal/SearchModal';
import CartDrawer from '../CartDrawer/CartDrawer';
import QuickViewModal from '../../common/QuickViewModal/QuickViewModal';

function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <SearchModal />
      <CartDrawer />
      <QuickViewModal />
    </>
  );
}

export default MainLayout;