import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout/MainLayout";
import Home from "./pages/home/Home";
import StorageLayout from "./pages/storage/StorageLayout";
import StorageDashboard from "./pages/storage/StorageDashboard";
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
