import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ShopProvider } from "./context/ShopContext";

import MainLayout from "./components/layout/MainLayout/MainLayout";
import Home from "./pages/home/Home";

import {
  CategoryPage,
  ProductDetailPage,
  CartPage,
  CollectionsPage,
  LookbookPage,
} from "./pages/customer/CustomerPages";

// =========== AUTH PAGES ===========

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// =========== STORAGE PAGES ===========

import StorageLayout from "./pages/storage/StorageLayout";

const StorageDashboard = lazy(() => import("./pages/storage/StorageDashboard"));
const SkuManagement = lazy(() => import("./pages/storage/SkuManagement"));
const LowStockAlerts = lazy(() => import("./pages/storage/LowStockAlerts"));
const InventorySearchFilter = lazy(
  () => import("./pages/storage/InventorySearchFilter"),
);
const StockAvailability = lazy(
  () => import("./pages/storage/StockAvailability"),
);
const ImportExportStock = lazy(
  () => import("./pages/storage/ImportExportStock"),
);
const StockAdjustment = lazy(() => import("./pages/storage/StockAdjustment"));
const InventoryHistory = lazy(() => import("./pages/storage/InventoryHistory"));
const InventoryStatistics = lazy(
  () => import("./pages/storage/InventoryStatistics"),
);
const InventoryTestingIntegration = lazy(
  () => import("./pages/storage/InventoryTestingIntegration"),
);

// =========== STAFF PAGES ===========

import StaffLayout from "./pages/staff/StaffLayout";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffList from "./pages/staff/StaffList";
import StaffOrders from "./pages/staff/StaffOrders";

// =========== ADMIN PAGES ===========

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import AdminUsers from "./pages/admin/users/AdminUsers";
import AdminCatalog from "./pages/admin/catalog/AdminCatalog";
import AdminMonitoring from "./pages/admin/monitoring/AdminMonitoring";
import AdminAnalytics from "./pages/admin/analytics/AdminAnalytics";
import AdminRoles from "./pages/admin/roles/AdminRoles";
import AdminVariants from "./pages/admin/variants/AdminVariants";
import AdminCategories from "./pages/admin/categories/AdminCategories";
import AdminBrands from "./pages/admin/brands/AdminBrands";
import AdminOrderDetail from "./pages/admin/orders/AdminOrderDetail";
import AdminInventoryDetail from "./pages/admin/inventory/AdminInventoryDetail";

function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div style={{ padding: "40px", textAlign: "center" }}>
              Đang tải trang...
            </div>
          }
        >
          <Routes>
            {/* =========== ADMIN =========== */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="catalog" element={<AdminCatalog />} />
              <Route path="monitoring" element={<AdminMonitoring />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="variants" element={<AdminVariants />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="orders/:orderId" element={<AdminOrderDetail />} />
              <Route
                path="inventory/:variantId"
                element={<AdminInventoryDetail />}
              />
            </Route>

            {/* =========== CUSTOMER =========== */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />

            <Route
              path="/collections"
              element={
                <MainLayout>
                  <CollectionsPage />
                </MainLayout>
              }
            />

            <Route
              path="/category/:id"
              element={
                <MainLayout>
                  <CategoryPage />
                </MainLayout>
              }
            />

            <Route
              path="/product/:slug"
              element={
                <MainLayout>
                  <ProductDetailPage />
                </MainLayout>
              }
            />

            <Route
              path="/cart"
              element={
                <MainLayout>
                  <CartPage />
                </MainLayout>
              }
            />

            <Route
              path="/lookbook"
              element={
                <MainLayout>
                  <LookbookPage />
                </MainLayout>
              }
            />

            {/* =========== AUTH =========== */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* =========== STORAGE =========== */}
            <Route path="/storage" element={<StorageLayout />}>
              <Route index element={<StorageDashboard />} />
              <Route path="skus" element={<SkuManagement />} />
              <Route path="alerts" element={<LowStockAlerts />} />
              <Route path="search" element={<InventorySearchFilter />} />
              <Route path="availability" element={<StockAvailability />} />
              <Route path="inbound-outbound" element={<ImportExportStock />} />
              <Route path="adjustment" element={<StockAdjustment />} />
              <Route path="history" element={<InventoryHistory />} />
              <Route path="statistics" element={<InventoryStatistics />} />
              <Route path="testing" element={<InventoryTestingIntegration />} />
            </Route>

            {/* =========== STAFF =========== */}
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="members" element={<StaffList />} />
              <Route path="orders" element={<StaffOrders />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ShopProvider>
  );
}

export default App;
