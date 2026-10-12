import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  Banknote,
  ClipboardCheck,
  Clock,
  Download,
  Info,
  Network,
  Package,
  Plane,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  getInventoryMonitoring,
  getOrderMonitoring,
} from "../../../services/admin/monitoring.service.js";
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

function Pending({ children, reason, dark = false }) {
  return (
    <span className="lm-pending" tabIndex={0} aria-label={reason}>
      <button
        type="button"
        disabled
        className={"lm-button " + (dark ? "lm-dark" : "")}
      >
        {children}
      </button>
      <span role="tooltip">{reason}</span>
    </span>
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
    setOrderState((current) => ({ ...current, loading: true, error: "" }));
    setOrderQuery((current) => ({ ...current, page: 1, status }));
  }

  function changeOrderPage(page) {
    setOrderState((current) => ({ ...current, loading: true, error: "" }));
    setOrderQuery((current) => ({ ...current, page }));
  }

  function changeOrderLimit(limit) {
    setOrderState((current) => ({ ...current, loading: true, error: "" }));
    setOrderQuery((current) => ({ ...current, page: 1, limit }));
  }

  const rows = inventoryState.data?.rows ?? [];
  const orders = orderState.data?.orders ?? [];
  const orderPagination = orderState.data?.pagination;
  const inventoryPagination = inventoryState.data?.pagination;

  return (
    <div className="lm-page">
      <p className="lm-eyebrow">
        TRUNG TÂM KIỂM SOÁT
        <span>• ĐƠN HÀNG & TỒN KHO</span>
      </p>

      <section className="lm-heading">
        <div>
          <h1>Giám Sát Đơn Hàng & Tồn Kho Toàn Hệ Thống</h1>
          <p>
            Theo dõi Order và Inventory từ Backend trong chế độ chỉ đọc, với
            trạng thái request độc lập cho từng domain.
          </p>
        </div>
        <div className="lm-toolbar">
          <label title="Bộ lọc này thuộc dữ liệu đơn hàng và chưa được tích hợp">
            <Clock size={15} />
            Kỳ đơn hàng:
            <select disabled aria-label="Kỳ đơn hàng chưa tích hợp">
              <option>Chưa tích hợp</option>
            </select>
          </label>
          <Pending reason="Chưa có nguồn và định nghĩa báo cáo SLA">
            <Download size={15} />
            Tải báo cáo kiểm soát SLA
          </Pending>
          <span className="lm-incident">
            Cảnh báo sự cố: Chưa tích hợp
          </span>
        </div>
      </section>

      <p className="lm-demo-note">
        <b>Dữ liệu Backend</b>
        Order và Inventory được tải từ hai API độc lập. Realtime, Payment, SLA
        và đồng bộ kho liên Hub chưa được tích hợp.
      </p>

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
          <p>Tổng số Order do Backend cung cấp theo bộ lọc trạng thái hiện tại.</p>
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
          <p>Trang {orderPagination?.page ?? 1}, không dùng làm tổng hệ thống.</p>
        </article>
        <article className="lm-card">
          <div className="lm-kpi-label">
            TUÂN THỦ VẬN CHUYỂN
            <Plane size={22} />
          </div>
          <strong className="lm-unknown">Chưa tích hợp</strong>
          <p>Chưa có thời hạn cam kết và dữ liệu SLA.</p>
        </article>
        <article className="lm-card lm-capacity">
          <div className="lm-kpi-label">
            TẢI KHO TRUNG CHUYỂN
            <Network size={22} />
          </div>
          <strong className="lm-unknown">Chưa tích hợp</strong>
          <p>Chưa có contract sức chứa hoặc mức sử dụng kho.</p>
        </article>
      </section>

      <section className="lm-orders">
        <header className="lm-section-heading">
          <h2>
            <Truck size={23} />
            Live Order Monitoring Deck
          </h2>
          <span className="lm-pill">REAL ORDER API</span>
        </header>
        <p className="lm-explanation">
          Bộ lọc trạng thái và phân trang được xử lý tại Backend. Payment,
          warehouse, staff và SLA chưa được tích hợp.
        </p>
        <div className="lm-tabs" role="group" aria-label="Trạng thái Order">
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
              Đang tải dữ liệu Order…
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
              <p>Backend trả về danh sách rỗng cho trang và trạng thái đã chọn.</p>
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
                    <th scope="col">THANH TOÁN / ĐIỀU PHỐI</th>
                    <th scope="col">CHI TIẾT</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const firstItem = order.items[0];
                    const attributes = firstItem
                      ? [
                          firstItem.color,
                          firstItem.size,
                          firstItem.material,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : "";

                    return (
                      <tr key={order.orderId}>
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
                          <div className="lm-item">
                            <span
                              className="lm-image-placeholder"
                              role="img"
                              aria-label="Item snapshot"
                            >
                              <Package size={22} />
                            </span>
                            <div>
                              {firstItem?.productName ||
                                "Chưa có item snapshot"}
                              <small>
                                {order.items.length} item
                                {firstItem?.sku ? " · SKU: " + firstItem.sku : ""}
                              </small>
                              {firstItem ? (
                                <small>
                                  {attributes || "Chưa có thuộc tính"} · Giá lịch
                                  sử: {money(firstItem.unitPrice)}
                                </small>
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
                        <td>
                          <span className="lm-note">Payment: Chưa tích hợp</span>
                          <small>Warehouse / Staff / SLA: Chưa tích hợp</small>
                        </td>
                        <td>
                          <span
                            className="lm-muted"
                            title="GET /api/orders/:id không cho phép Admin"
                          >
                            Chi tiết chưa khả dụng cho Admin
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

      <section className="lm-inventory">
        <header className="lm-section-heading">
          <h2>
            <Warehouse size={23} />
            Global Multi-Hub Inventory Monitoring
          </h2>
          <span className="lm-pill">REAL INVENTORY API</span>
        </header>
        <p className="lm-explanation">
          Phân bổ kho, vị trí, sức chứa và mức sử dụng chưa có contract được xác
          minh.
        </p>
        <div className="lm-card lm-state" role="status">
          <Warehouse size={30} />
          <h3>Phân bổ đa kho chưa tích hợp</h3>
          <p>Không suy diễn warehouse hoặc location từ Inventory ID.</p>
        </div>
      </section>

      <section className="lm-card lm-watchlist">
        <header>
          <div className="lm-watchlist-title">
            <span>
              <ClipboardCheck size={26} />
            </span>
            <div>
              <h2>Inventory Snapshot</h2>
              <p>
                Quantity, availableStock và threshold được giữ theo field API
                riêng biệt.
              </p>
            </div>
          </div>
          <span className="lm-pill">
            {inventoryPagination
              ? `${inventoryPagination.totalItems} INVENTORY`
              : "SERVER PAGINATION"}
          </span>
        </header>

        {inventoryState.loading ? (
          <div className="lm-state" role="status">
            Đang tải dữ liệu Inventory…
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
            <p>API trả về một danh sách hợp lệ nhưng không có dữ liệu.</p>
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
                  <th scope="col">AVAILABLE STOCK</th>
                  <th scope="col">NGƯỠNG</th>
                  <th scope="col">TRẠNG THÁI</th>
                  <th scope="col">CHI TIẾT</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.inventoryId}>
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
                      <small>Inventory.quantity</small>
                    </td>
                    <td>
                      <div className="lm-stock-values">
                        <strong>
                          Inventory: {displayNumber(row.inventoryAvailableStock)}
                        </strong>
                      </div>
                      <small>
                        Variant: {displayNumber(row.variantAvailableStock)}
                      </small>
                    </td>
                    <td>
                      <strong>{displayNumber(row.lowStockThreshold)}</strong>
                      <small>Inventory.lowStockThreshold</small>
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
                            encodeURIComponent(row.variantId)
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
          Low-stock chỉ được suy ra cho {rows.length} row trên trang hiện tại khi
          cả quantity và threshold đều là số. Bộ lọc cục bộ không được áp dụng
          trên tập Inventory toàn hệ thống. Endpoint low-stock và transactions
          chưa được tích hợp do chưa xác minh envelope.
        </p>
      </section>
    </div>
  );
}
