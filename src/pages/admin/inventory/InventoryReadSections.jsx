import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminLowStock,
  getAdminTransactions,
} from "../../../services/admin/inventory.service.js";
import { getApiErrorMessage } from "../../../services/api.js";
import "./InventoryReadSections.css";

const validId = (value) =>
  typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

const TRANSACTION_TYPE_LABELS = {
  IMPORT: "Nhập kho",
  EXPORT: "Xuất kho",
  ADJUSTMENT: "Điều chỉnh kho",
  DEDUCTION: "Trừ kho",
  RESTORE: "Khôi phục",
};

const types = ["IMPORT", "EXPORT", "ADJUSTMENT", "DEDUCTION", "RESTORE"];
const text = (value) =>
  typeof value === "string" && value.trim() ? value : "Chưa có dữ liệu";
const number = (value) =>
  typeof value === "number"
    ? new Intl.NumberFormat("vi-VN").format(value)
    : "Chưa có dữ liệu";
const timestamp = (value) =>
  typeof value === "string" && Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(value))
    : "Chưa có dữ liệu";
const variantIdOf = (value) => (typeof value === "string" ? value : value?._id);

function Pagination({
  label,
  meta,
  count,
  page,
  limit,
  loading,
  onPage,
  onLimit,
}) {
  return (
    <footer className="lir-pagination">
      <span aria-live="polite">
        {meta
          ? `Trang ${meta.page} / ${meta.totalPages} · Hiển thị ${count} / tổng ${meta.totalItems}`
          : "Chưa có metadata phân trang"}
      </span>
      <label>
        Dòng mỗi trang{" "}
        <select
          value={limit}
          disabled={loading}
          onChange={(event) => onLimit(Number(event.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </label>
      <nav aria-label={`Phân trang ${label}`}>
        <button
          type="button"
          disabled={loading || !meta || page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Trước
        </button>
        <button
          type="button"
          disabled={
            loading || !meta || meta.totalPages === 0 || page >= meta.totalPages
          }
          onClick={() => onPage(page + 1)}
        >
          Sau
        </button>
      </nav>
    </footer>
  );
}

function RequestState({ loading, error, empty, retry, children, emptyText }) {
  if (loading)
    return (
      <div className="lir-state" role="status">
        Đang tải dữ liệu. Vui lòng chờ trong giây lát ...
      </div>
    );
  if (error)
    return (
      <div className="lir-state" role="alert">
        <p>{error}</p>
        <button type="button" onClick={retry}>
          Thử lại
        </button>
      </div>
    );
  if (empty)
    return (
      <div className="lir-state" role="status">
        {emptyText}
      </div>
    );
  return children;
}

export function LowStockPanel() {
  const [draft, setDraft] = useState({ variantId: "", sku: "" });
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    variantId: "",
    sku: "",
  });
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => {
    let cancelled = false;
    getAdminLowStock(query)
      .then((data) => {
        if (!cancelled) setState({ loading: false, data, error: "" });
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            loading: false,
            data: null,
            error: getApiErrorMessage(error, "Không thể tải Low Stock."),
          });
      });
    return () => {
      cancelled = true;
    };
  }, [query, revision]);
  function retry() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    setRevision((value) => value + 1);
  }
  function apply(event) {
    event.preventDefault();
    const selectedId = variantId || draft.variantId.trim();
    try {
      const from = isoLocal(draft.from);
      const to = isoLocal(draft.to);
      if (from && to && Date.parse(from) > Date.parse(to))
        throw new Error("Mốc bắt đầu phải trước hoặc bằng mốc kết thúc.");
      setState((current) => ({ ...current, loading: true, error: "" }));
      setQuery((current) => ({
        ...current,
        page: 1,
        variantId: selectedId,
        type: draft.type, // <--- Thêm dòng này để truyền loại biến động lên API
        from,
        to,
      }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    }
  }
  const rows = state.data?.rows ?? [];
  return (
    <section
      className="lir-panel"
      id="admin-low-stock"
      aria-labelledby="lir-low-title"
    >
      <header>
        <h2 id="lir-low-title">Tồn kho chạm ngưỡng thấp</h2>
      </header>
      <form className="lir-filters" onSubmit={apply}>
        <label>
          Variant ID
          <input
            value={draft.variantId}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                variantId: event.target.value,
              }))
            }
            placeholder="Nhập mã ID"
          />
        </label>
        <label>
          SKU chính xác
          <input
            value={draft.sku}
            onChange={(event) =>
              setDraft((current) => ({ ...current, sku: event.target.value }))
            }
            maxLength={200}
          />
        </label>
        <button type="submit" disabled={state.loading}>
          Lọc
        </button>
      </form>
      <RequestState
        loading={state.loading}
        error={state.error}
        empty={rows.length === 0}
        retry={retry}
        emptyText="Không có hàng tồn kho thấp."
      >
        <div
          className="lir-scroll"
          tabIndex={0}
          aria-label="Bảng Low Stock, cuộn ngang khi cần"
        >
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>SẢN PHẨM</th>
                <th>SỐ LƯỢNG</th>
                <th>NGƯỠNG</th>
                <th>CHI TIẾT</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const variant = row.variantId;
                const id = variantIdOf(variant);
                return (
                  <tr key={row._id ?? index}>
                    <td>
                      {text(variant?.sku)}
                      <small>{text(id)}</small>
                    </td>
                    <td>{text(variant?.productId?.name)}</td>
                    <td className="lir-quantity">{number(row.quantity)}</td>
                    <td>{number(row.lowStockThreshold)}</td>
                    <td>
                      {validId(id) ? (
                        <Link
                          to={`/admin/inventory/${encodeURIComponent(id)}${validId(variant?.productId?._id) ? `?productId=${encodeURIComponent(variant.productId._id)}` : ""}`}
                        >
                          Xem chi tiết
                        </Link>
                      ) : (
                        "Chưa có Variant ID hợp lệ"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </RequestState>
      <Pagination
        label="Low Stock"
        meta={state.data?.pagination}
        count={rows.length}
        page={query.page}
        limit={query.limit}
        loading={state.loading}
        onPage={(page) => {
          setState((current) => ({ ...current, loading: true }));
          setQuery((current) => ({ ...current, page }));
        }}
        onLimit={(limit) => {
          setState((current) => ({ ...current, loading: true }));
          setQuery((current) => ({ ...current, page: 1, limit }));
        }}
      />
    </section>
  );
}

function isoLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()))
    throw new Error("Thời gian không hợp lệ.");
  return date.toISOString();
}

export function TransactionHistoryPanel({ variantId = "", compact = false }) {
  const [draft, setDraft] = useState({
    variantId: variantId || "",
    type: "",
    from: "",
    to: "",
  });
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    variantId: variantId || "",
    type: "",
    from: "",
    to: "",
  });
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ loading: true, data: null, error: "" });

  // State quản lý dòng đang được chọn để hiển thị Form Modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getAdminTransactions(query)
      .then((data) => {
        if (!cancelled) setState({ loading: false, data, error: "" });
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            loading: false,
            data: null,
            error: getApiErrorMessage(error, "Không thể tải lịch sử kho."),
          });
      });
    return () => {
      cancelled = true;
    };
  }, [query, revision]);

  function retry() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    setRevision((value) => value + 1);
  }

  function apply(event) {
    event.preventDefault();
    const selectedId = variantId || draft.variantId.trim();
    try {
      const from = isoLocal(draft.from);
      const to = isoLocal(draft.to);
      if (from && to && Date.parse(from) > Date.parse(to))
        throw new Error("Mốc bắt đầu phải trước hoặc bằng mốc kết thúc.");
      setState((current) => ({ ...current, loading: true, error: "" }));
      setQuery((current) => ({
        ...current,
        page: 1,
        variantId: selectedId,
        type: draft.type,
        from,
        to,
      }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    }
  }

  const rows = state.data?.rows ?? [];
  return (
    <section
      className={`lir-panel ${compact ? "lir-compact" : ""}`}
      id={compact ? "inventory-detail-history" : "admin-inventory-history"}
      aria-labelledby={compact ? "lir-detail-title" : "lir-history-title"}
    >
      <header>
        <h2 id={compact ? "lir-detail-title" : "lir-history-title"}>
          Lịch sử biến động tồn kho
        </h2>
      </header>

      <form className="lir-filters" onSubmit={apply}>
        {!variantId && (
          <label>
            Tên sản phẩm / Từ khóa
            <input
              value={draft.variantId}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  variantId: event.target.value,
                }))
              }
              placeholder="Nhập tên sản phẩm..."
            />
          </label>
        )}

        <label>
          Loại biến động
          <select
            value={draft.type}
            onChange={(event) =>
              setDraft((current) => ({ ...current, type: event.target.value }))
            }
          >
            <option value="">Tất cả</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {TRANSACTION_TYPE_LABELS[type] || type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Từ
          <input
            type="datetime-local"
            value={draft.from}
            onChange={(event) =>
              setDraft((current) => ({ ...current, from: event.target.value }))
            }
          />
        </label>
        <label>
          Đến
          <input
            type="datetime-local"
            value={draft.to}
            onChange={(event) =>
              setDraft((current) => ({ ...current, to: event.target.value }))
            }
          />
        </label>
        <button type="submit" disabled={state.loading}>
          Lọc
        </button>
      </form>

      <RequestState
        loading={state.loading}
        error={state.error}
        empty={rows.length === 0}
        retry={retry}
        emptyText="Không có giao dịch kho khớp bộ lọc."
      >
        <div
          className="lir-scroll"
          tabIndex={0}
          aria-label="Bảng lịch sử kho, cuộn ngang khi cần"
        >
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Sản phẩm</th>
                <th>Loại</th>
                <th>Số lượng</th>
                <th>Biến động</th>
                <th>Nhân viên</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const variant = row.variantId;
                const id = variantIdOf(variant);

                return (
                  <tr key={row._id}>
                    <td>{timestamp(row.createdAt)}</td>
                    <td>
                      {text(variant?.sku)}
                      <small>{text(id)}</small>
                      {variant?.productId?.name && (
                        <small>{variant.productId.name}</small>
                      )}
                      {validId(id) && (
                        <Link
                          to={`/admin/inventory/${encodeURIComponent(id)}${validId(variant?.productId?._id) ? `?productId=${encodeURIComponent(variant.productId._id)}` : ""}`}
                        >
                          Xem chi tiết
                        </Link>
                      )}
                    </td>
                    <td>
                      <span
                        className={`lir-type-badge lir-type-${row.type.toLowerCase()}`}
                      >
                        {TRANSACTION_TYPE_LABELS[row.type] || row.type}
                      </span>
                    </td>
                    <td>{number(row.quantity)}</td>
                    <td>
                      {number(row.beforeQuantity)} → {number(row.afterQuantity)}
                    </td>

                    {/* Cột hiển thị người thao tác kèm nút bấm mở Form Modal */}
                    <td>
                      <div className="lir-operator-cell lir-inline-cell">
                        <strong>
                          {row.createdBy
                            ? typeof row.createdBy === "string"
                              ? row.createdBy
                              : text(row.createdBy.fullName)
                            : "Hệ thống"}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="lir-toggle-detail-btn lir-small-btn"
                        onClick={() => setSelectedTransaction(row)}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </RequestState>

      {/* --- FORM MODAL HIỂN THỊ CHI TIẾT GIAO DỊCH KHO --- */}
      {selectedTransaction && (
        <div
          className="lir-modal-overlay"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="lir-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="lir-modal-header">
              <h3 style={{ fontFamily: "Be Vietnam Pro, Segoe UI, sans-serif" }}>Chi tiết giao dịch kho</h3>
              <button
                type="button"
                className="lir-modal-close"
                onClick={() => setSelectedTransaction(null)}
              >
                ×
              </button>
            </header>

            <div className="lir-modal-body">
              {/* Tên sản phẩm */}
              <div className="lir-modal-field lir-modal-full">
                <span>Tên sản phẩm:</span>
                <strong>
                  {selectedTransaction.variantId?.productId?.name ||
                    selectedTransaction.productName ||
                    "Chưa có tên sản phẩm"}
                </strong>
              </div>

              {/* SKU & Biến thể */}
              <div className="lir-modal-field lir-modal-full">
                <span>SKU / Biến thể:</span>
                <strong>
                  {selectedTransaction.variantId?.sku || "Không có SKU"}
                  {selectedTransaction.variantId?.color
                    ? ` · Màu: ${selectedTransaction.variantId.color}`
                    : ""}
                  {selectedTransaction.variantId?.size
                    ? ` · Size: ${selectedTransaction.variantId.size}`
                    : ""}
                </strong>
              </div>

              {/* Loại biến động */}
              <div className="lir-modal-field">
                <span>Loại biến động:</span>
                <strong>
                  {TRANSACTION_TYPE_LABELS[selectedTransaction.type] ||
                    selectedTransaction.type}
                </strong>
              </div>

              {/* Số lượng thay đổi */}
              <div className="lir-modal-field">
                <span>Số lượng thay đổi:</span>
                <strong
                  style={{
                    color:
                      selectedTransaction.type === "IMPORT"
                        ? "#166534"
                        : "#991b1b",
                  }}
                >
                  {selectedTransaction.type === "IMPORT" ? "+" : "-"}
                  {number(selectedTransaction.quantity)} đơn vị
                </strong>
              </div>

              {/* Biến động tồn kho */}
              <div className="lir-modal-field">
                <span>Tồn kho (Trước → Sau):</span>
                <strong>
                  {number(selectedTransaction.beforeQuantity)} →{" "}
                  {number(selectedTransaction.afterQuantity)}
                </strong>
              </div>

              {/* Người thực hiện */}
              <div className="lir-modal-field">
                <span>Người thực hiện:</span>
                <strong>
                  {selectedTransaction.createdBy
                    ? typeof selectedTransaction.createdBy === "string"
                      ? selectedTransaction.createdBy
                      : text(selectedTransaction.createdBy.fullName)
                    : "Hệ thống"}
                </strong>
              </div>

              {/* Thời gian */}
              <div className="lir-modal-field">
                <span>Thời gian:</span>
                <strong>{timestamp(selectedTransaction.createdAt)}</strong>
              </div>

              {/* Mã đơn hàng (Nếu có) */}
              {selectedTransaction.orderId && (
                <div className="lir-modal-field lir-modal-full">
                  <span>Mã đơn hàng liên quan:</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "4px",
                    }}
                  >
                    <code>
                      {typeof selectedTransaction.orderId === "object"
                        ? selectedTransaction.orderId._id
                        : selectedTransaction.orderId}
                    </code>
                    <Link
                      to={`/admin/orders`}
                      style={{
                        fontSize: "12px",
                        color: "#0f172a",
                        fontWeight: "650",
                        textDecoration: "underline",
                      }}
                      onClick={() => setSelectedTransaction(null)}
                    >
                      Xem danh sách đơn hàng →
                    </Link>
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              {selectedTransaction.note && (
                <div className="lir-modal-field lir-modal-full">
                  <span>Ghi chú:</span>
                  <p>{selectedTransaction.note}</p>
                </div>
              )}
            </div>

            <footer className="lir-modal-footer">
              <button
                type="button"
                className="lir-modal-btn"
                onClick={() => setSelectedTransaction(null)}
              >
                Đóng
              </button>
            </footer>
          </div>
        </div>
      )}

      <Pagination
        label="lịch sử kho"
        meta={state.data?.pagination}
        count={rows.length}
        page={query.page}
        limit={query.limit}
        loading={state.loading}
        onPage={(page) => {
          setState((current) => ({ ...current, loading: true }));
          setQuery((current) => ({ ...current, page }));
        }}
        onLimit={(limit) => {
          setState((current) => ({ ...current, loading: true }));
          setQuery((current) => ({ ...current, page: 1, limit }));
        }}
      />
    </section>
  );
}
