import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  Banknote,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Info,
  Package,
  RefreshCw,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  getInventoryMonitoring,
  getOrderMonitoring,
} from "../../../services/admin/monitoring.service.js";
import { LowStockPanel, TransactionHistoryPanel } from "../inventory/InventoryReadSections.jsx";
import "./AdminMonitoring.css";

const displayNumber = (value) =>
  typeof value === "number"
    ? new Intl.NumberFormat("vi-VN").format(value)
    : "Chưa có dữ liệu";

const money = (value) =>
  typeof value === "number"
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value)
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
  { id: "rejected", label: "Đã từ chối" },
  { id: "cancelled", label: "Đã hủy" },
];

function getOrderStatusLabel(status) {
  return (
    ORDER_STATUS_OPTIONS.find((option) => option.id === status)?.label ?? status
  );
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
  const [orderQuery, setOrderQuery] = useState({
    page: 1,
    limit: 10,
    status: "",
  });
  const [orderState, setOrderState] = useState({
    data: null,
    loading: true,
    error: "",
  });
  const [orderRetry, setOrderRetry] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [inventoryState, setInventoryState] = useState({
    data: null,
    loading: true,
    error: "",
  });
  const [inventoryQuery, setInventoryQuery] = useState({
    page: 1,
    limit: 10,
  });
  const [inventoryRetry, setInventoryRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getOrderMonitoring(orderQuery)
      .then((data) => {
        if (!cancelled) {
          setOrderState({ data, loading: false, error: "" });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setOrderState({
            data: null,
            loading: false,
            error:
              error?.message ||
              "Không thể tải dữ liệu Order. Vui lòng thử lại.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderQuery, orderRetry]);

  useEffect(() => {
    let cancelled = false;

    getInventoryMonitoring(inventoryQuery)
      .then((data) => {
        if (!cancelled) {
          setInventoryState({ data, loading: false, error: "" });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setInventoryState({
            data: null,
            loading: false,
            error:
              error?.message ||
              "Không thể tải dữ liệu Inventory. Vui lòng thử lại.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inventoryQuery, inventoryRetry]);

  function retryInventory() {
    setInventoryState((current) => ({ ...current, loading: true, error: "" }));
    setInventoryRetry((value) => value + 1);
  }

  function changeInventoryPage(page) {
    setInventoryState((current) => ({ ...current, loading: true, error: "" }));
    setInventoryQuery((current) => ({ ...current, page }));
  }

  function changeInventoryLimit(limit) {
    setInventoryState((current) => ({ ...current, loading: true, error: "" }));
    setInventoryQuery({ page: 1, limit });
  }

  function retryOrders() {
    setOrderState((current) => ({ ...current, loading: true, error: "" }));
    setOrderRetry((value) => value + 1);
  }

  function changeOrderStatus(status) {
    setExpandedOrderId(null);
    setOrderState((current) => ({ ...current, loading: true, error: "" }));
    setOrderQuery((current) => ({ ...current, page: 1, status }));
  }

  function changeOrderPage(page) {
    setExpandedOrderId(null);
    setOrderState((current) => ({ ...current, loading: true, error: "" }));
    setOrderQuery((current) => ({ ...current, page }));
  }

  function changeOrderLimit(limit) {
    setExpandedOrderId(null);
    setOrderState((current) => ({ ...current, loading: true, error: "" }));
    setOrderQuery((current) => ({ ...current, page: 1, limit }));
  }

  const rows = inventoryState.data?.rows ?? [];
  const orders = orderState.data?.orders ?? [];
  const orderPagination = orderState.data?.pagination;
  const inventoryPagination = inventoryState.data?.pagination;

  return (
    <div className="lm-page">
      <div className="lm-hero">
        <p className="lm-eyebrow">
          TRUNG TÂM KIỂM SOÁT
          <span>• ĐƠN HÀNG & TỒN KHO</span>
        </p>
        <section className="lm-heading">
        <div>
          <h1>Giám Sát Đơn Hàng & Tồn Kho Toàn Hệ Thống</h1>
          <p>Theo dõi đơn hàng và tồn kho trong chế độ chỉ đọc.</p>
        </div>
        </section>
      </div>

      <section className="lm-kpis" aria-label="Tổng quan giám sát">
        <article className="lm-card">
          <div className="lm-kpi-label">
            TỔNG ĐƠN HÀNG
            <Banknote size={22} />
          </div>
          <strong>
            {orderState.loading
              ? "…"
              : orderState.error
                ? "Chưa có dữ liệu"
                : orderPagination?.totalItems}
          </strong>
          <p>Tổng số đơn theo trạng thái đang chọn.</p>
        </article>
        <article className="lm-card">
          <div className="lm-kpi-label">
            ĐƠN TRÊN TRANG HIỆN TẠI
            <Award size={22} />
          </div>
          <strong>
            {orderState.loading || orderState.error
              ? "Chưa có dữ liệu"
              : orders.length}
          </strong>
          <p>Số đơn trên trang {orderPagination?.page ?? 1}.</p>
        </article>
      </section>

      <section className="lm-orders" aria-labelledby="lm-orders-title">
        <header className="lm-section-heading">
          <h2 id="lm-orders-title">
            <Truck size={23} />
            Danh Sách Đơn Hàng
          </h2>
          <span className="lm-pill">CHỈ XEM</span>
        </header>
        <div className="lm-tabs" role="group" aria-label="Lọc theo trạng thái Order">
          {ORDER_STATUS_OPTIONS.map((option) => (
            <button
              key={option.id || "all"}
              type="button"
              aria-pressed={orderQuery.status === option.id}
              className={orderQuery.status === option.id ? "lm-active" : ""}
              disabled={orderState.loading}
              onClick={() => changeOrderStatus(option.id)}
            >
              {option.label}
              {option.id === orderQuery.status && orderPagination ? (
                <b>{orderPagination.totalItems}</b>
              ) : null}
            </button>
          ))}
        </div>
        <div className="lm-order-box">
          {orderState.loading ? (
            <div className="lm-state" role="status">
              <RefreshCw className="lm-loading-icon" size={24} aria-hidden="true" />
              <h3>Đang tải đơn hàng</h3>
              <p>Đang cập nhật danh sách theo trạng thái đã chọn.</p>
              <div className="lm-skeleton" />
            </div>
          ) : orderState.error ? (
            <div className="lm-state" role="alert">
              <AlertTriangle size={30} />
              <h3>Không thể tải dữ liệu Order</h3>
              <p>{orderState.error}</p>
              <button className="lm-button" onClick={retryOrders}>
                Thử lại
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="lm-state" role="status">
              <Package size={30} />
              <h3>Không có Order phù hợp</h3>
              <p>Không có đơn hàng phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div
              className="lm-table-scroll"
              tabIndex={0}
              aria-label="Bảng giám sát Order, cuộn ngang khi cần"
            >
              <table className="lm-table lm-order-table">
                <thead>
                  <tr>
                    <th scope="col">MÃ ORDER / THỜI GIAN</th>
                    <th scope="col">NGƯỜI NHẬN</th>
                    <th scope="col">ITEM SNAPSHOT</th>
                    <th scope="col">TỔNG GIÁ TRỊ</th>
                    <th scope="col">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
                    const isExpanded = expandedOrderId === order.orderId;
                    const detailsId = `lm-order-items-${order.orderId}`;

                    return (
                      <tr key={order.orderId} style={{ "--lm-row-index": Math.min(index, 7) }}>
                        <td>
                          <strong className="lm-order-id">
                            #{order.orderId}
                          </strong>
                          <small>{dateTime(order.createdAt)}</small>
                        </td>
                        <td>
                          <div className="lm-customer">
                            <span aria-hidden="true">
                              {order.shippingAddress.receiverName
                                ?.split(" ")
                                .slice(0, 2)
                                .map((word) => word[0])
                                .join("") || "?"}
                            </span>
                            <div>
                              <strong>
                                {order.shippingAddress.receiverName ||
                                  "Chưa có dữ liệu người nhận"}
                              </strong>
                              <small>
                                User ID: {order.userId || "Chưa có dữ liệu"}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="lm-item-snapshot">
                            <span
                              className="lm-image-placeholder"
                              role="img"
                              aria-label="Item snapshot"
                            >
                              <Package size={22} />
                            </span>
                            <div className="lm-item-content">
                              {order.items.length ? (
                                <ul className="lm-item-list" id={detailsId}>
                                  {order.items.map((item) => {
                                    const attributes = [
                                      item.material,
                                      item.size,
                                      item.color,
                                    ].filter(Boolean);

                                    return (
                                      <li key={item.itemId}>
                                        <div className="lm-item-summary">
                                          <strong>
                                            {item.productName || "Chưa có tên sản phẩm"}
                                          </strong>
                                          <span>× {displayNumber(item.quantity)}</span>
                                        </div>
                                        <small>
                                          {item.sku ? `SKU: ${item.sku}` : "Chưa có SKU"}
                                        </small>
                                        {isExpanded ? (
                                          <div className="lm-item-history">
                                            {attributes.length ? (
                                              <small>{attributes.join(" · ")}</small>
                                            ) : null}
                                            <small>
                                              Đơn giá lịch sử: {money(item.unitPrice)}
                                            </small>
                                            <small>
                                              Thành tiền lịch sử: {money(item.itemSubtotal)}
                                            </small>
                                          </div>
                                        ) : null}
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <span>Chưa có item snapshot</span>
                              )}
                              {order.items.length ? (
                                <button
                                  type="button"
                                  className="lm-item-toggle"
                                  aria-expanded={isExpanded}
                                  aria-controls={detailsId}
                                  onClick={() =>
                                    setExpandedOrderId((current) =>
                                      current === order.orderId ? null : order.orderId,
                                    )
                                  }
                                >
                                  {isExpanded ? (
                                    <ChevronUp size={15} aria-hidden="true" />
                                  ) : (
                                    <ChevronDown size={15} aria-hidden="true" />
                                  )}
                                  {isExpanded ? "Thu gọn chi tiết" : "Xem chi tiết"}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="lm-money">
                          {money(order.totalAmount)}
                          <small>Subtotal: {money(order.subtotal)}</small>
                        </td>
                        <td>
                          <span
                            className={"lm-status lm-status-" + order.status}
                          >
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
            <span aria-live="polite">
              {orderPagination
                ? "Trang " +
                  orderPagination.page +
                  " / " +
                  Math.max(orderPagination.totalPages, 1) +
                  " · Tổng " +
                  orderPagination.totalItems +
                  " Order"
                : "Chưa có metadata phân trang"}
            </span>
            <label>
              Dòng mỗi trang:
              <select
                value={orderQuery.limit}
                disabled={orderState.loading}
                onChange={(event) =>
                  changeOrderLimit(Number(event.target.value))
                }
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
            <nav aria-label="Phân trang Order">
              <button
                type="button"
                disabled={
                  orderState.loading || !orderPagination || orderPagination.page <= 1
                }
                onClick={() => changeOrderPage(orderPagination.page - 1)}
              >
                Trước
              </button>
              <button
                type="button"
                disabled={
                  orderState.loading ||
                  !orderPagination ||
                  orderPagination.totalPages === 0 ||
                  orderPagination.page >= orderPagination.totalPages
                }
                onClick={() => changeOrderPage(orderPagination.page + 1)}
              >
                Sau
              </button>
            </nav>
          </footer>
        </div>
      </section>

      <section className="lm-inventory" aria-labelledby="lm-inventory-title">
        <header className="lm-section-heading">
          <h2 id="lm-inventory-title">
            <Warehouse size={23} />
            Giám Sát Tồn Kho
          </h2>
          <span className="lm-pill">CHỈ XEM</span>
        </header>
      </section>

      <section className="lm-card lm-watchlist" aria-labelledby="lm-snapshot-title">
        <header>
          <div className="lm-watchlist-title">
            <span>
              <ClipboardCheck size={26} />
            </span>
            <div>
              <h2 id="lm-snapshot-title">Inventory Snapshot</h2>
              <p>Số lượng tồn, ngưỡng an toàn và trạng thái của từng SKU.</p>
            </div>
          </div>
          <span className="lm-pill">
            {inventoryPagination
              ? `${inventoryPagination.totalItems} INVENTORY`
              : "DANH SÁCH TỒN KHO"}
          </span>
        </header>

        {inventoryState.loading ? (
          <div className="lm-state" role="status">
            <RefreshCw className="lm-loading-icon" size={24} aria-hidden="true" />
            <h3>Đang tải tồn kho</h3>
            <p>Vui lòng chờ trong giây lát.</p>
            <div className="lm-skeleton" />
          </div>
        ) : inventoryState.error ? (
          <div className="lm-state" role="alert">
            <AlertTriangle size={30} />
            <h3>Không thể tải dữ liệu Inventory</h3>
            <p>{inventoryState.error}</p>
            <button className="lm-button" onClick={retryInventory}>
              Thử lại
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="lm-state" role="status">
            <Package size={30} />
            <h3>Chưa có bản ghi Inventory</h3>
            <p>Chưa có dữ liệu tồn kho để hiển thị.</p>
          </div>
        ) : (
          <div
            className="lm-table-scroll"
            tabIndex={0}
            aria-label="Danh sách Inventory, cuộn ngang khi cần"
          >
            <table className="lm-table lm-material-table">
              <thead>
                <tr>
                  <th scope="col">SKU / VARIANT</th>
                  <th scope="col">SỐ LƯỢNG TỒN KHO</th>
                  <th scope="col">NGƯỠNG</th>
                  <th scope="col">TRẠNG THÁI</th>
                  <th scope="col">CHI TIẾT</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.inventoryId} style={{ "--lm-row-index": Math.min(index, 7) }}>
                    <td>
                      <div className="lm-material-name">
                        <Package size={24} />
                        <div>
                          <strong>{getVariantLabel(row)}</strong>
                          <small>
                            {row.productName || "Chưa có dữ liệu Product"}
                          </small>
                          <small>{getAttributes(row)}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{displayNumber(row.quantity)}</strong>
                      <small>Số lượng hiện có</small>
                    </td>
                    <td>
                      <strong>{displayNumber(row.lowStockThreshold)}</strong>
                      <small>Ngưỡng an toàn</small>
                    </td>
                    <td>
                      <span
                        className={
                          "lm-stock-badge " +
                          (row.isLowStock ? "lm-stock-alert" : "")
                        }
                      >
                        {getStockStatus(row)}
                      </span>
                    </td>
                    <td>
                      {row.variantId ? (
                        <Link
                          className="lm-order-id"
                          to={
                            "/admin/inventory/" +
                            encodeURIComponent(row.variantId) +
                            (row.productId ? `?productId=${encodeURIComponent(row.productId)}` : "")
                          }
                        >
                          Xem chi tiết
                        </Link>
                      ) : (
                        <span
                          className="lm-muted"
                          title="Bản ghi không có Variant ID hợp lệ"
                        >
                          Chưa khả dụng
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="lm-order-footer">
          <span aria-live="polite">
            {inventoryPagination
              ? "Trang " +
                inventoryPagination.page +
                " / " +
                inventoryPagination.totalPages +
                " · Hiển thị " +
                rows.length +
                " / tổng " +
                inventoryPagination.totalItems +
                " Inventory"
              : "Chưa có metadata phân trang"}
          </span>
          <label>
            Dòng mỗi trang:
            <select
              value={inventoryQuery.limit}
              disabled={inventoryState.loading}
              onChange={(event) =>
                changeInventoryLimit(Number(event.target.value))
              }
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
          <nav aria-label="Phân trang Inventory">
            <button
              type="button"
              disabled={
                inventoryState.loading ||
                !inventoryPagination ||
                inventoryPagination.page <= 1
              }
              onClick={() =>
                changeInventoryPage(inventoryPagination.page - 1)
              }
            >
              Trước
            </button>
            <button
              type="button"
              disabled={
                inventoryState.loading ||
                !inventoryPagination ||
                inventoryPagination.totalPages === 0 ||
                inventoryPagination.page >= inventoryPagination.totalPages
              }
              onClick={() =>
                changeInventoryPage(inventoryPagination.page + 1)
              }
            >
              Sau
            </button>
          </nav>
        </footer>

        <p className="lm-explanation">
          <Info size={13} />
          Trạng thái trong bảng áp dụng cho {rows.length} bản ghi trên trang hiện tại.
          Danh sách sắp hết hàng và lịch sử bên dưới có bộ lọc riêng.
        </p>
      </section>
      <LowStockPanel />
      <TransactionHistoryPanel />
    </div>
  );
}
