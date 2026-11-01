import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ShopProvider } from "./context/ShopContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";

// =========== LAYOUTS & PAGES (CUSTOMER - Lazy Loaded để tối ưu tốc độ chuyển trang) ===========
import CustomerLayout from "./components/layout/MainLayout/MainLayout";

const Home = lazy(() => import("./pages/home/Home"));
const ProductListPage = lazy(() => import("./pages/customer/ProductListPage"));
const ProductDetailPage = lazy(() => import("./pages/customer/ProductDetailPage"));

const CategoryPage = lazy(() => import("./pages/customer/CustomerPages").then(module => ({ default: module.CategoryPage })));
const CartPage = lazy(() => import("./pages/customer/CustomerPages").then(module => ({ default: module.CartPage })));
const WishlistPage = lazy(() => import("./pages/customer/CustomerPages").then(module => ({ default: module.WishlistPage })));
const CheckoutPage = lazy(() => import("./pages/customer/CustomerPages").then(module => ({ default: module.CheckoutPage })));
const PaymentSuccessPage = lazy(() => import("./pages/customer/CustomerPages").then(module => ({ default: module.PaymentSuccessPage })));
const PaymentFailedPage = lazy(() => import("./pages/customer/CustomerPages").then(module => ({ default: module.PaymentFailedPage })));
const CustomerProfilePage = lazy(() => import("./pages/customer/CustomerPages").then(module => ({ default: module.CustomerProfilePage })));
const AddressManagementPage = lazy(() => import("./pages/customer/CustomerPages").then(module => ({ default: module.AddressManagementPage })));
const CustomerOrdersPage = lazy(() => import("./pages/customer/CustomerPages").then(module => ({ default: module.CustomerOrdersPage })));
const CollectionsPage = lazy(() => import("./pages/customer/CustomerPages").then(module => ({ default: module.CollectionsPage })));

// =========== AUTH PAGES ===========
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const StaffProfile = lazy(() => import("./pages/staff/StaffProfile"));
const StaffDashboard = lazy(() => import("./pages/staff/StaffDashboard"));

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
const StorageProfile = lazy(() => import('./pages/storage/StorageProfile')); 

// =========== STAFF PAGES (Lazy load) ===========
const StaffLayout = lazy(() => import("./pages/staff/StaffLayout"));
const StaffOrders = lazy(() => import("./pages/staff/StaffOrders"));

// =========== ADMIN PAGES (Lazy load) ===========
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(
  () => import("./pages/admin/dashboard/AdminDashboard"),
);
const AdminUsers = lazy(() => import("./pages/admin/users/AdminUsers"));
const AdminCatalog = lazy(() => import("./pages/admin/catalog/AdminCatalog"));
const AdminVariants = lazy(() => import("./pages/admin/variants/AdminVariants"));
const AdminCategories = lazy(() => import("./pages/admin/categories/AdminCategories"));
const AdminBrands = lazy(() => import("./pages/admin/brands/AdminBrands"));
const AdminMonitoring = lazy(() => import("./pages/admin/monitoring/AdminMonitoring"));
const AdminInventoryDetail = lazy(() => import("./pages/admin/inventory/AdminInventoryDetail"));

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div
                style={{
                  padding: "100px 0",
                  textAlign: "center",
                  fontSize: "1rem",
                  color: "#8A6A48",
                  fontFamily: "var(--font-serif, 'Playfair Display', serif)",
                }}
              >
                Đang tải không gian LUMORA...
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
                path="/payment-success"
                element={
                  <CustomerLayout>
                    <PaymentSuccessPage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/payment-success/:orderId?"
                element={
                  <CustomerLayout>
                    <PaymentSuccessPage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/checkout/success"
                element={
                  <CustomerLayout>
                    <PaymentSuccessPage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/order/success/:orderId?"
                element={
                  <CustomerLayout>
                    <PaymentSuccessPage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/payment-failed"
                element={
                  <CustomerLayout>
                    <PaymentFailedPage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/payment-failed/:orderId?"
                element={
                  <CustomerLayout>
                    <PaymentFailedPage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/checkout/failed"
                element={
                  <CustomerLayout>
                    <PaymentFailedPage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/order/failed/:orderId?"
                element={
                  <CustomerLayout>
                    <PaymentFailedPage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/profile"
                element={
                  <CustomerLayout>
                    <CustomerProfilePage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/account"
                element={
                  <CustomerLayout>
                    <CustomerProfilePage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/addresses"
                element={
                  <CustomerLayout>
                    <AddressManagementPage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/orders"
                element={
                  <CustomerLayout>
                    <CustomerOrdersPage />
                  </CustomerLayout>
                }
              />
              <Route
                path="/orders/:orderId"
                element={
                  <CustomerLayout>
                    <CustomerOrdersPage />
                  </CustomerLayout>
                }
              />

              {/* ================= AUTH ROUTES ================= */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ================= ADMIN ROUTES ================= */}
              <Route
                element={<ProtectedRoute allowedRoles={["ADMIN"]} />}
              >
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="catalog" element={<AdminCatalog />} />
                  <Route path="variants" element={<AdminVariants />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="brands" element={<AdminBrands />} />
                  <Route path="monitoring" element={<AdminMonitoring />} />
                  <Route
                    path="inventory/:variantId"
                    element={<AdminInventoryDetail />}
                  />
                </Route>
              </Route>

              {/* ================= STORAGE ROUTES ================= */}
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
                  <Route path="profile" element={<StorageProfile />} />
                </Route>
              </Route>

              {/* ================= STAFF ROUTES ================= */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["STAFF", "ADMIN", "MANAGER"]} />
                }
              >
                <Route path="/staff" element={<StaffLayout />}>
                  <Route index element={<StaffOrders />} />
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="profile" element={<StaffProfile />} />
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