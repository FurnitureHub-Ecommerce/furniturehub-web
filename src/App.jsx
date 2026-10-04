import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ShopProvider } from "./context/ShopContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";

// =========== LAYOUTS & PAGES (CUSTOMER) ===========
import CustomerLayout from "./components/layout/MainLayout/MainLayout";
import Home from "./pages/home/Home";
import ProductListPage from "./pages/customer/ProductListPage";
import ProductDetailPage from "./pages/customer/ProductDetailPage";
import {
  CategoryPage,
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

// =========== STAFF PAGES (Lazy load) ===========
const StaffLayout = lazy(() => import("./pages/staff/StaffLayout"));
const StaffOrders = lazy(() => import("./pages/staff/StaffOrders"));

// =========== ADMIN PAGES (Lazy load) ===========
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(
  () => import("./pages/admin/dashboard/AdminDashboard"),
);
const AdminUsers = lazy(() => import("./pages/admin/users/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/analytics/AdminAnalytics"));
const AdminCatalog = lazy(() => import("./pages/admin/catalog/AdminCatalog"));
const AdminVariants = lazy(() => import("./pages/admin/variants/AdminVariants"));
const AdminCategories = lazy(() => import("./pages/admin/categories/AdminCategories"));
const AdminBrands = lazy(() => import("./pages/admin/brands/AdminBrands"));
const AdminMonitoring = lazy(() => import("./pages/admin/monitoring/AdminMonitoring"));
const AdminOrderDetail = lazy(() => import("./pages/admin/orders/AdminOrderDetail"));
const AdminInventoryDetail = lazy(() => import("./pages/admin/inventory/AdminInventoryDetail"),
);
const AdminRoles = lazy(() => import("./pages/admin/roles/AdminRoles"));

function App() {
  return (
    <AuthProvider>
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
                <CustomerLayout>
                  <Home />
                </CustomerLayout>
              }
            />
            <Route
              path="/products"
              element={
                <CustomerLayout>
                  <ProductListPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/collections"
              element={
                <CustomerLayout>
                  <CollectionsPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/category/:id"
              element={
                <CustomerLayout>
                  <CategoryPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/product/:slug"
              element={
                <CustomerLayout>
                  <ProductDetailPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <CustomerLayout>
                  <CartPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/wishlist"
              element={
                <CustomerLayout>
                  <WishlistPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/checkout"
              element={
                <CustomerLayout>
                  <CheckoutPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/lookbook"
              element={
                <CustomerLayout>
                  <LookbookPage />
                </CustomerLayout>
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
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="roles" element={<AdminRoles />} />
                <Route path="catalog" element={<AdminCatalog />} />
                <Route path="variants" element={<AdminVariants />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="brands" element={<AdminBrands />} />
                <Route path="monitoring" element={<AdminMonitoring />} />
                <Route path="orders/:orderId" element={<AdminOrderDetail />} />
                <Route
                  path="inventory/:variantId"
                  element={<AdminInventoryDetail />}
                />
              </Route>
            </Route>

            {/* ================= STORAGE / KHO ROUTES (STORAGE, ADMIN, MANAGER) ================= */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "STORAGE",
                    "STORAGE_MANAGER",
                    "ADMIN",
                    "MANAGER",
                  ]}
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
              </Route>
            </Route>

            {/* ================= STAFF ROUTES (STAFF, ADMIN, MANAGER) ================= */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["STAFF", "ADMIN", "MANAGER"]} />
              }
            >
              <Route path="/staff" element={<StaffLayout />}>
                <Route index element={<StaffOrders />} />
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
    </AuthProvider>
  );
}

export default App;
