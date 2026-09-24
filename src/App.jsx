import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout/MainLayout";
import Home from "./pages/home/Home";
import StorageLayout from "./pages/storage/StorageLayout";
import StorageDashboard from "./pages/storage/StorageDashboard";
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

import SkuManagement from "./pages/storage/SkuManagement";
import LowStockAlerts from "./pages/storage/LowStockAlerts";
import InventorySearchFilter from "./pages/storage/InventorySearchFilter";
import StockAvailability from "./pages/storage/StockAvailability";
import ImportExportStock from "./pages/storage/ImportExportStock";
import StockAdjustment from "./pages/storage/StockAdjustment";
import InventoryHistory from "./pages/storage/InventoryHistory";
import InventoryStatistics from "./pages/storage/InventoryStatistics";
import InventoryTestingIntegration from "./pages/storage/InventoryTestingIntegration";

import StaffLayout from "./pages/staff/StaffLayout";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffList from "./pages/staff/StaffList";
import StaffOrders from "./pages/staff/StaffOrders";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
          <Route path="inventory/:variantId" element={<AdminInventoryDetail />} />
        </Route>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="members" element={<StaffList />} />
          <Route path="orders" element={<StaffOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
