import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import { ProtectedRoute } from "../src/pages/auth/ProtectedRoute"; // Import bảo vệ route

// =========== LAYOUTS & PAGES (CUSTOMER) ===========
import MainLayout from "./components/layout/MainLayout/MainLayout";
import Home from "./pages/home/Home";
import {
  CategoryPage,
  ProductDetailPage,
  CartPage,
  WishlistPage,
  CheckoutPage,
  CollectionsPage,
  LookbookPage,
} from "./pages/customer/CustomerPages";

// =========== AUTH PAGES ===========
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// =========== STORAGE PAGES (Lazy load toàn bộ) ===========
const StorageLayout = lazy(() => import("./pages/storage/StorageLayout"));
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

// =========== STAFF PAGES (Lazy load) ===========
const StaffLayout = lazy(() => import("./pages/staff/StaffLayout"));
const StaffDashboard = lazy(() => import("./pages/staff/StaffDashboard"));
const StaffList = lazy(() => import("./pages/staff/StaffList"));
const StaffOrders = lazy(() => import("./pages/staff/StaffOrders"));

// =========== ADMIN PAGES (Lazy load) ===========
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(
  () => import("./pages/admin/dashboard/AdminDashboard"),
);
const AdminUsers = lazy(() => import("./pages/admin/users/AdminUsers"));

function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div
              style={{
                padding: "80px",
                textAlign: "center",
                fontSize: "1.1rem",
                color: "#666",
              }}
            >
              Đang tải hệ thống Lumora...
            </div>
          }
        >
          <Routes>
            {/* ================= PUBLIC / CUSTOMER ROUTES ================= */}
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
              path="/wishlist"
              element={
                <MainLayout>
                  <WishlistPage />
                </MainLayout>
              }
            />
            <Route
              path="/checkout"
              element={
                <MainLayout>
                  <CheckoutPage />
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

            {/* ================= AUTH ROUTES ================= */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ================= ADMIN ROUTES (Chỉ ADMIN hoặc MANAGER) ================= */}
            <Route
              element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]} />}
            >
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
            </Route>

            {/* ================= STORAGE / KHO ROUTES (STORAGE, ADMIN, MANAGER) ================= */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["STORAGE", "ADMIN", "MANAGER"]}
                />
              }
            >
              <Route path="/storage" element={<StorageLayout />}>
                <Route index element={<StorageDashboard />} />
                <Route path="skus" element={<SkuManagement />} />
                <Route path="alerts" element={<LowStockAlerts />} />
                <Route path="search" element={<InventorySearchFilter />} />
                <Route path="availability" element={<StockAvailability />} />
                <Route
                  path="inbound-outbound"
                  element={<ImportExportStock />}
                />
                <Route path="adjustment" element={<StockAdjustment />} />
                <Route path="history" element={<InventoryHistory />} />
                <Route path="statistics" element={<InventoryStatistics />} />
                <Route
                  path="testing"
                  element={<InventoryTestingIntegration />}
                />
              </Route>
            </Route>

            {/* ================= STAFF ROUTES (STAFF, ADMIN, MANAGER) ================= */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["STAFF", "ADMIN", "MANAGER"]} />
              }
            >
              <Route path="/staff" element={<StaffLayout />}>
                <Route index element={<StaffDashboard />} />
                <Route path="members" element={<StaffList />} />
                <Route path="orders" element={<StaffOrders />} />
              </Route>
            </Route>

            {/* ================= 404 FALLBACK ================= */}
            <Route
              path="*"
              element={
                <div style={{ textAlign: "center", padding: "100px" }}>
                  <h2>404 - Không tìm thấy trang</h2>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ShopProvider>
  );
}

export default App;
