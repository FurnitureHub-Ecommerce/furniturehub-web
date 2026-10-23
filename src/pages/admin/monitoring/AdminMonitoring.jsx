import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  Banknote,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Package,
  RefreshCw,
  Truck,
  Warehouse,
  History,
  TrendingDown,
  LockKeyhole,
  Ruler,
  Layers,
  ShieldCheck,
  Banknote as BanknoteIcon
} from "lucide-react";
import {
  getInventoryMonitoring,
  getOrderMonitoring,
} from "../../../services/admin/monitoring.service.js";
import { getInventoryDetail } from "../../../services/admin/inventoryDetail.service.js";
import { LowStockPanel, TransactionHistoryPanel } from "../inventory/InventoryReadSections.jsx";
import "./AdminMonitoring.css";

const displayNumber = (value) =>
  typeof value === "number" ? new Intl.NumberFormat("vi-VN").format(value) : "Chưa có dữ liệu";

const money = (value) =>
  typeof value === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value)
    : "Chưa có dữ liệu";

const dateTime = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const ORDER_STATUS_OPTIONS = [
  { id: "", label: "Tất cả đơn hàng" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "delivered", label: "Đã giao" },
  { id: "rejected", label: "Đã từ chối" },
  { id: "cancelled", label: "Đã hủy" },
];

function getOrderStatusLabel(status) {
  return ORDER_STATUS_OPTIONS.find((option) => option.id === status)?.label ?? status;
}

function getStockStatus(row) {
  if (row.isLowStock === null) return "Chưa có dữ liệu";
  return row.isLowStock ? "Chạm ngưỡng thấp" : "Trên ngưỡng";
}

function getVariantLabel(row) {
  return row.sku || row.variantId || "Chưa có dữ liệu SKU";
}

function getAttributes(row) {
  const values = [row.material, row.color, row.size].filter(Boolean);
  return values.length ? values.join(" · ") : "Chưa có dữ liệu thuộc tính";
}

export default function AdminMonitoring() {
  const [activeTab, setActiveTab] = useState("orders");

  const [orderQuery, setOrderQuery] = useState({ page: 1, limit: 10, status: "" });
  const [orderState, setOrderState] = useState({ data: null, loading: true, error: "" });
  const [orderRetry, setOrderRetry] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [inventoryState, setInventoryState] = useState({ data: null, loading: true, error: "" });
  const [inventoryQuery, setInventoryQuery] = useState({ page: 1, limit: 10 });
  const [inventoryRetry, setInventoryRetry] = useState(0);

  // State quản lý Modal chi tiết sản phẩm / SKU
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [detailModalState, setDetailModalState] = useState({ loading: false, data: null, error: "" });

  useEffect(() => {
    let cancelled = false;
    getOrderMonitoring(orderQuery)
      .then((data) => { if (!cancelled) setOrderState({ data, loading: false, error: "" }); })
      .catch((error) => {
        if (!cancelled) setOrderState({ data: null, loading: false, error: error?.message || "Không thể tải dữ liệu Order." });
      });
    return () => { cancelled = true; };
  }, [orderQuery, orderRetry]);

  useEffect(() => {
    let cancelled = false;
    getInventoryMonitoring(inventoryQuery)
      .then((data) => { if (!cancelled) setInventoryState({ data, loading: false, error: "" }); })
      .catch((error) => {
        if (!cancelled) setInventoryState({ data: null, loading: false, error: error?.message || "Không thể tải dữ liệu Inventory." });
      });
    return () => { cancelled = true; };
  }, [inventoryQuery, inventoryRetry]);

  // Gọi API chi tiết SKU khi người dùng bấm "Xem chi tiết"
  useEffect(() => {
    if (!selectedVariantId) return;
    let cancelled = false;
    setDetailModalState({ loading: true, data: null, error: "" });
    
    getInventoryDetail(selectedVariantId)
      .then((data) => {
        if (!cancelled) setDetailModalState({ loading: false, data, error: "" });
      })
      .catch((err) => {
        if (!cancelled) setDetailModalState({ loading: false, data: null, error: err?.message || "Không thể tải chi tiết." });
      });

    return () => { cancelled = true; };
  }, [selectedVariantId]);

  function retryInventory() {
    setInventoryState((current) => ({ ...current, loading: true, error: "" }));
    setInventoryRetry((value) => value + 1);
  }

  function retryOrders() {
    setOrderState((current) => ({ ...current, loading: true, error: "" }));
    setOrderRetry((value) => value + 1);
  }

  const rows = inventoryState.data?.rows ?? [];
  const orders = orderState.data?.orders ?? [];
  const orderPagination = orderState.data?.pagination;
  const inventoryPagination = inventoryState.data?.pagination;

  const detailData = detailModalState.data ?? {};
  const detailVariant = detailData.variant;
  const detailProduct = detailData.product;
  const detailInventory = detailData.inventory;
  const productImage = Array.isArray(detailProduct?.images)
    ? detailProduct.images.find((image) => typeof image === "string" && image.trim())
    : null;

  return (
    <div className="lm-page">
      <div className="lm-hero">
        <p className="lm-eyebrow">
          TRUNG TÂM KIỂM SOÁT
          <span> • HỆ THỐNG VẬN HÀNH</span>
        </p>
        <section className="lm-heading">
          <div>
            <h1>Giám Sát Vận Hành Toàn Hệ Thống</h1>
            <p>Quản lý và theo dõi tập trung đơn hàng, kho bãi và biến động tồn kho chi tiết.</p>
          </div>
        </section>
      </div>

      {/* THANH TAB ĐIỀU HƯỚNG CHÍNH */}
      <div className="lm-main-tabs" role="tablist" aria-label="Phân loại giám sát">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "orders"}
          className={activeTab === "orders" ? "lm-main-tab-active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          <Truck size={16} /> Giám sát Đơn hàng
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "snapshot"}
          className={activeTab === "snapshot" ? "lm-main-tab-active" : ""}
          onClick={() => setActiveTab("snapshot")}
        >
          <Warehouse size={16} /> Hàng tồn kho
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "lowstock"}
          className={activeTab === "lowstock" ? "lm-main-tab-active" : ""}
          onClick={() => setActiveTab("lowstock")}
        >
          <TrendingDown size={16} /> Tồn kho chạm ngưỡng thấp
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "transactions"}
          className={activeTab === "transactions" ? "lm-main-tab-active" : ""}
          onClick={() => setActiveTab("transactions")}
        >
          <History size={16} /> Lịch sử biến động tồn kho
        </button>
      </div>

      {/* --- TAB 1: GIÁM SÁT ĐƠN HÀNG --- */}
      {activeTab === "orders" && (
        <div className="lm-tab-content">
          <section className="lm-kpis" aria-label="Tổng quan đơn hàng">
            <article className="lm-card">
              <div className="lm-kpi-label">TỔNG ĐƠN HÀNG <Banknote size={20} /></div>
              <strong>{orderState.loading ? "…" : orderState.error ? "0" : displayNumber(orderPagination?.totalItems)}</strong>
              <p>Tổng số đơn theo trạng thái đang chọn.</p>
            </article>
            <article className="lm-card">
              <div className="lm-kpi-label">ĐƠN TRÊN TRANG HIỆN TẠI <Award size={20} /></div>
              <strong>{orderState.loading || orderState.error ? "0" : displayNumber(orders.length)}</strong>
              <p>Số đơn hiển thị trên trang {orderPagination?.page ?? 1}.</p>
            </article>
          </section>
          
          <section className="lm-orders" aria-labelledby="lm-orders-title">
            <header className="lm-section-heading">
              <h2 id="lm-orders-title"><Truck size={21} /> Danh Sách Đơn Hàng</h2>
            </header>
            <div className="lm-tabs" role="group">
              {ORDER_STATUS_OPTIONS.map((option) => (
                <button
                  key={option.id || "all"}
                  type="button"
                  className={orderQuery.status === option.id ? "lm-active" : ""}
                  disabled={orderState.loading}
                  onClick={() => {
                    setExpandedOrderId(null);
                    setOrderState(c => ({ ...c, loading: true }));
                    setOrderQuery(c => ({ ...c, page: 1, status: option.id }));
                  }}
                >
                  {option.label}
                  {option.id === orderQuery.status && orderPagination ? <b>{orderPagination.totalItems}</b> : null}
                </button>
              ))}
            </div>
            <div className="lm-order-box">
              {orderState.loading ? (
                <div className="lm-state" role="status">
                  <RefreshCw className="lm-loading-icon" size={24} />
                  <h3 style={{ fontFamily: "Be Vietnam Pro, Segoe UI, sans-serif" }}>Đang tải đơn hàng…</h3>
                  <div className="lm-skeleton" />
                </div>
              ) : orderState.error ? (
                <div className="lm-state" role="alert">
                  <AlertTriangle size={28} />
                  <h3 style={{ fontFamily: "Be Vietnam Pro, Segoe UI, sans-serif" }}>Không thể tải dữ liệu đơn hàng</h3>
                  <p>{orderState.error}</p>
                  <button className="lm-button" onClick={retryOrders}>Thử lại</button>
                </div>
              ) : orders.length === 0 ? (
                <div className="lm-state" role="status">
                  <Package size={28} />
                  <h3 style={{ fontFamily: "Be Vietnam Pro, Segoe UI, sans-serif" }}>Không có đơn hàng phù hợp</h3>
                </div>
              ) : (
                <div className="lm-table-scroll" tabIndex={0}>
                  <table className="lm-table lm-order-table">
                    <thead>
                      <tr>
                        <th scope="col">Mã Order / Thời gian</th>
                        <th scope="col">Người nhận</th>
                        <th scope="col">Sản phẩm</th>
                        <th scope="col">Tổng giá trị</th>
                        <th scope="col">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => {
                        const isExpanded = expandedOrderId === order.orderId;
                        return (
                          <tr key={order.orderId} style={{ "--lm-row-index": Math.min(index, 7) }}>
                            <td>
                              <strong className="lm-order-id">#{order.orderId}</strong>
                              <small>{dateTime(order.createdAt)}</small>
                            </td>
                            <td>
                              <div className="lm-customer">
                                <div>
                                  <strong>{order.shippingAddress.receiverName || "Chưa có tên"}</strong>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="lm-item-snapshot">
                                <div className="lm-item-content">
                                  {order.items.length ? (
                                    <ul className="lm-item-list">
                                      {order.items.map((item) => (
                                        <li key={item.itemId}>
                                          <div className="lm-item-summary">
                                            <strong>{item.productName || "Sản phẩm"}</strong>
                                            <span>× {displayNumber(item.quantity)}</span>
                                          </div>
                                          <small>{item.sku ? `SKU: ${item.sku}` : ""}</small>
                                          {isExpanded && (
                                            <div className="lm-item-history">
                                              <small>Đơn giá: {money(item.unitPrice)}</small>
                                              <small>Thành tiền: {money(item.itemSubtotal)}</small>
                                            </div>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : <span>Không có sản phẩm</span>}
                                  {order.items.length > 1 && (
                                    <button
                                      type="button"
                                      className="lm-item-toggle"
                                      onClick={() => setExpandedOrderId(current => current === order.orderId ? null : order.orderId)}
                                    >
                                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                      {isExpanded ? "Thu gọn" : `Xem thêm (${order.items.length - 1} món)`}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="lm-money">
                              {money(order.totalAmount)}
                            </td>
                            <td>
                              <span className={"lm-status lm-status-" + order.status}>
                                {getOrderStatusLabel(order.status)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <footer className="lm-order-footer">
                <span>{orderPagination ? `Trang ${orderPagination.page} / ${Math.max(orderPagination.totalPages, 1)} · Tổng ${orderPagination.totalItems} đơn hàng` : ""}</span>
                <label>
                  Dòng mỗi trang:
                  <select
                    value={orderQuery.limit}
                    disabled={orderState.loading}
                    onChange={(e) => {
                      setExpandedOrderId(null);
                      setOrderState(c => ({ ...c, loading: true }));
                      setOrderQuery(c => ({ ...c, page: 1, limit: Number(e.target.value) }));
                    }}
                    style={{marginLeft: "3px "}}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </label>
                <nav>
                  <button
                    type="button"
                    disabled={orderState.loading || !orderPagination || orderPagination.page <= 1}
                    onClick={() => {
                      setExpandedOrderId(null);
                      setOrderState(c => ({ ...c, loading: true }));
                      setOrderQuery(c => ({ ...c, page: orderPagination.page - 1 }));
                    }}
                  >Trước</button>
                  <button
                    type="button"
                    disabled={orderState.loading || !orderPagination || orderPagination.page >= orderPagination.totalPages}
                    onClick={() => {
                      setExpandedOrderId(null);
                      setOrderState(c => ({ ...c, loading: true }));
                      setOrderQuery(c => ({ ...c, page: orderPagination.page + 1 }));
                    }}
                  >Sau</button>
                </nav>
              </footer>
            </div>
          </section>
        </div>
      )}

      {/* --- TAB 2: INVENTORY SNAPSHOT --- */}
      {activeTab === "snapshot" && (
        <section className="lm-card lm-watchlist">
          <header>
            <div className="lm-watchlist-title">
              <span><ClipboardCheck size={24} /></span>
              <div>
                <h2>Hàng tồn kho</h2>
                <p>Số lượng tồn, ngưỡng an toàn và trạng thái của từng SKU.</p>
              </div>
            </div>
            <span className="lm-pill">{inventoryPagination ? `${inventoryPagination.totalItems} INVENTORY` : "TỒN KHO"}</span>
          </header>

          {inventoryState.loading ? (
            <div className="lm-state" role="status">
              <RefreshCw className="lm-loading-icon" size={24} />
              <h3>Đang tải tồn kho…</h3>
              <div className="lm-skeleton" />
            </div>
          ) : inventoryState.error ? (
            <div className="lm-state" role="alert">
              <AlertTriangle size={28} />
              <h3>Không thể tải dữ liệu Inventory</h3>
              <p>{inventoryState.error}</p>
              <button className="lm-button" onClick={retryInventory}>Thử lại</button>
            </div>
          ) : rows.length === 0 ? (
            <div className="lm-state" role="status"><Package size={28} /><h3>Không có bản ghi</h3></div>
          ) : (
            <div className="lm-table-scroll" tabIndex={0}>
              <table className="lm-table lm-material-table">
                <thead>
                  <tr>
                    <th scope="col">Biến thể</th>
                    <th scope="col">Số lượng tồn</th>
                    <th scope="col">Ngưỡng</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.inventoryId} style={{ "--lm-row-index": Math.min(index, 7) }}>
                      <td>
                        <div className="lm-material-name">
                          <div>
                            <strong>{getVariantLabel(row)}</strong>
                            <small>{row.productName || "Sản phẩm"}</small>
                            <small>{getAttributes(row)}</small>
                          </div>
                        </div>
                      </td>
                      <td style={{textAlign: "center"}}><strong>{displayNumber(row.quantity)}</strong></td>
                      <td style={{textAlign: "center"}}><strong>{displayNumber(row.lowStockThreshold)}</strong></td>
                      <td>
                        <span className={"lm-stock-badge " + (row.isLowStock ? "lm-stock-alert" : "")}>
                          {getStockStatus(row)}
                        </span>
                      </td>
                      <td>
                        {row.variantId ? (
                          <button
                            type="button"
                            className="lm-detail-link-btn"
                            onClick={() => setSelectedVariantId(row.variantId)}
                          >
                            Xem chi tiết
                          </button>
                        ) : <span className="lm-muted">Không khả dụng</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <footer className="lm-order-footer">
            <span>{inventoryPagination ? `Trang ${inventoryPagination.page} / ${inventoryPagination.totalPages} · Tổng ${inventoryPagination.totalItems} mục` : ""}</span>
            <label>
              Dòng:
              <select
                value={inventoryQuery.limit}
                disabled={inventoryState.loading}
                onChange={(e) => {
                  setInventoryState(c => ({ ...c, loading: true }));
                  setInventoryQuery({ page: 1, limit: Number(e.target.value) });
                }}
                style={{marginLeft: "3px "}}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
            <nav>
              <button
                type="button"
                disabled={inventoryState.loading || !inventoryPagination || inventoryPagination.page <= 1}
                onClick={() => {
                  setInventoryState(c => ({ ...c, loading: true }));
                  setInventoryQuery(c => ({ ...c, page: inventoryPagination.page - 1 }));
                }}
              >Trước</button>
              <button
                type="button"
                disabled={inventoryState.loading || !inventoryPagination || inventoryPagination.page >= inventoryPagination.totalPages}
                onClick={() => {
                  setInventoryState(c => ({ ...c, loading: true }));
                  setInventoryQuery(c => ({ ...c, page: inventoryPagination.page + 1 }));
                }}
              >Sau</button>
            </nav>
          </footer>
        </section>
      )}

      {/* --- TAB 3: TỒN KHO CHẠM NGƯỠNG THẤP --- */}
      {activeTab === "lowstock" && (
        <div className="lm-tab-content">
          <LowStockPanel />
        </div>
      )}

      {/* --- TAB 4: LỊCH SỬ BIẾN ĐỘNG TỒN KHO --- */}
      {activeTab === "transactions" && (
        <div className="lm-tab-content">
          <TransactionHistoryPanel />
        </div>
      )}

      
     {/* --- FORM MODAL CHI TIẾT SKU HIỆN ĐẠI, SẠCH SẼ --- */}
      {selectedVariantId && (
        <div className="lm-modal-overlay" onClick={() => setSelectedVariantId(null)}>
          <div className="lm-modal-content lm-clean-detail-modal" onClick={(e) => e.stopPropagation()}>
            <header className="lm-modal-header">
              <div>
                <span className="lm-modal-eyebrow">CHI TIẾT SKU & TỒN KHO</span>
                <h3>{detailProduct?.name || "Thông tin biến thể"}</h3>
              </div>
              <button type="button" className="lm-modal-close-btn" onClick={() => setSelectedVariantId(null)}>✕</button>
            </header>

            <div className="lm-modal-body">
              {detailModalState.loading ? (
                <div className="lm-state" style={{ padding: "50px 0" }}>
                  <RefreshCw className="lm-loading-icon" size={28} />
                  <p>Đang tải thông tin chi tiết…</p>
                </div>
              ) : detailModalState.error ? (
                <div className="lm-state" role="alert">
                  <AlertTriangle size={24} />
                  <p>{detailModalState.error}</p>
                </div>
              ) : detailVariant ? (
                <>
                  {/* Khối thông tin tổng quan SKU */}
                  <div className="lm-clean-summary">
                    <div className="lm-clean-sku-badge">MÃ SKU: {detailVariant.sku || "Chưa có"}</div>
                    <h4>{detailProduct?.name ?? "Chưa có tên sản phẩm"}</h4>
                    <p>{detailVariant.size || "Chưa có kích thước"} · {detailVariant.material || "Chưa có vật liệu"} · {detailVariant.color || "Chưa có màu sắc"}</p>
                  </div>

                  {/* Lưới các chỉ số (KPIs) */}
                  <div className="lm-clean-kpis">
                    <div className="lm-clean-kpi-card">
                      <span>Tồn kho</span>
                      <strong>{detailInventory ? displayNumber(detailInventory.quantity) : "0"} sản phẩm</strong>
                    </div>
                    <div className="lm-clean-kpi-card">
                      <span>Gía niêm yết</span>
                      <strong style={{ color: "#8a6341" }}>{money(detailVariant.price)}</strong>
                    </div>
                    <div className="lm-clean-kpi-card">
                      <span>Ngưỡng tối thiểu</span>
                      <strong>{displayNumber(detailInventory?.lowStockThreshold)}</strong>
                    </div>
                  </div>

                  {/* Phần hình ảnh và thông số kỹ thuật */}
                  <div className="lm-clean-details-grid">
                    <div className="lm-clean-photo-box">
                      <span>Hình ảnh sản phẩm</span>
                      <div className="lm-clean-img-wrapper">
                        {productImage ? (
                          <img src={productImage} alt="" />
                        ) : (
                          <Package size={36} color="#94a3b8" />
                        )}
                      </div>
                    </div>

                    <div className="lm-clean-specs-box">
                      <span>Thông số kỹ thuật chi tiết</span>
                      <div className="lm-clean-specs-list">
                        <div>
                          <strong>Kích thước:</strong> {detailVariant.size || "Chưa có"}
                        </div>
                        <div>
                          <strong>Vật liệu:</strong> {detailVariant.material || "Chưa có"}
                        </div>
                        <div>
                          <strong>Màu sắc:</strong> {detailVariant.color || "Chưa có"}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <footer className="lm-modal-footer">
              <button type="button" className="lm-modal-btn-primary" onClick={() => setSelectedVariantId(null)}>Đóng</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}