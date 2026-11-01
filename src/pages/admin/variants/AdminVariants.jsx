import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Barcode,
  Plus,
  RefreshCw,
  Image,
  ShieldCheck,
  CircleAlert,
  Eye,
  Edit3,
  Power,
  MoreVertical,
  X,
} from "lucide-react";
import {
  deactivateVariant,
  loadAllVariantsData,
  filterVariants,
} from "../../../services/admin/variants.service.js";
import VariantDialog from "./VariantDialog.jsx";
import DeactivateDialog from "../DeactivateDialog.jsx";
import "./AdminVariants.css";

const display = (value) =>
  typeof value === "string" && value.trim() ? value : "Chưa có dữ liệu";
const money = (value) =>
  value === null
    ? "Chưa có dữ liệu"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);

function Thumbnail({ src }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="lv-api-thumbnail">
      {src && !failed ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        <Image size={22} aria-label="Chưa có ảnh" />
      )}
    </span>
  );
}

// Modal xem chi tiết biến thể / SKU có mờ nền backdrop chuẩn
function VariantDetailModal({ variant, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (el && !el.open) el.showModal();
    return () => {
      if (el && el.open) el.close();
    };
  }, []);

  if (!variant) return null;
  const src =
    Array.isArray(variant.product?.images) &&
    typeof variant.product.images[0] === "string"
      ? variant.product.images[0]
      : null;

  return (
    <dialog
      ref={dialogRef}
      className="lv-detail-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="lv-modal-header">
        <div>
          <span className="lv-modal-eyebrow">CHI TIẾT BIẾN THỂ & SKU</span>
          <h2>{display(variant.sku)}</h2>
        </div>
        <button
          type="button"
          className="lv-modal-close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </div>

      <div className="lv-modal-body">
        <div className="lv-modal-intro">
          <div className="lv-modal-thumb">
            {src ? (
              <img src={src} alt="" />
            ) : (
              <Image size={32} color="#64748b" />
            )}
          </div>
          <div>
            <span className="lv-modal-product-name">
              {display(variant.product?.name)}
            </span>
            <div className="lv-modal-price-tag">{money(variant.price)}</div>
          </div>
        </div>

        <div className="lv-modal-grid">
          <div className="lv-modal-item">
            <span>Màu sắc</span>
            <strong>{display(variant.color)}</strong>
          </div>
          <div className="lv-modal-item">
            <span>Kích thước</span>
            <strong>{display(variant.size)}</strong>
          </div>
          <div className="lv-modal-item">
            <span>Chất liệu</span>
            <strong>{display(variant.material)}</strong>
          </div>
        </div>

        <div className="lv-modal-grid" style={{ marginTop: "12px" }}>
          <div className="lv-modal-item">
            <span>Tồn khả dụng</span>
            <strong>{variant.availableStock ?? "Chưa xác định"}</strong>
          </div>
          <div className="lv-modal-item" style={{ gridColumn: "span 2" }}>
            <span>Trạng thái</span>
            <strong style={{ color: variant.isActive ? "#166534" : "#991b1b" }}>
              {variant.isActive === true ? "Đang hoạt động" : "Tạm ngưng"}
            </strong>
          </div>
        </div>
      </div>

      <div className="lv-modal-footer">
        <button type="button" className="lv-primary" onClick={onClose}>
          Đóng cửa sổ
        </button>
      </div>
    </dialog>
  );
}

export default function AdminVariants() {
  const [query, setQuery] = useState({ search: "", material: "", status: "" });
  const [searchTerm, setSearchTerm] = useState(query.search);

  // Lưu trữ cache dữ liệu thô trên client
  const [rawVariantsData, setRawVariantsData] = useState({
    variants: [],
    products: [],
    materials: [],
  });

  const [state, setState] = useState({ loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [confirmVariant, setConfirmVariant] = useState(null);
  const [workingId, setWorkingId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  // Đóng menu thao tác khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".lv-action-dropdown")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Debounce 300ms cho ô tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((current) => {
        if (current.search === searchTerm) return current;
        return { ...current, search: searchTerm };
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Chỉ gọi API tải toàn bộ dữ liệu 1 lần duy nhất khi vào trang hoặc reload
  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: "" });

    loadAllVariantsData()
      .then((res) => {
        if (!cancelled) {
          setRawVariantsData(res);
          setState({ loading: false, error: "" });
        }
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            loading: false,
            error: error.message || "Không thể tải Variant.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [revision]);

  // Lọc dữ liệu tức thì trên RAM bằng useMemo
  const data = useMemo(() => {
    return filterVariants(
      rawVariantsData.variants,
      rawVariantsData.products,
      rawVariantsData.materials,
      query
    );
  }, [rawVariantsData, query]);

  function update(values) {
    setQuery((current) => ({ ...current, ...values }));
  }
  function reload() {
    setRevision((value) => value + 1);
  }
  function saved(message) {
    setEditor(null);
    setNotice(message);
    setActionError("");
    reload();
  }
  function deactivate(variant) {
    if (workingId || !/^[0-9a-fA-F]{24}$/.test(variant._id ?? "")) return;
    setConfirmVariant(variant);
  }
  async function confirmDeactivate(variant) {
    setWorkingId(variant._id);
    setNotice("");
    setActionError("");
    try {
      await deactivateVariant(variant._id);
      setNotice("Đã vô hiệu hóa Variant.");
      reload();
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="lv-page">
      <div className="lv-hero">
        <p className="lv-eyebrow">QUẢN TRỊ DANH MỤC / BIẾN THỂ & SKU</p>
        <header className="lv-intro">
          <div>
            <h1>Quản Lý Biến Thể & Danh Mục SKU</h1>
            <p>
              Theo dõi kích thước, chất liệu, màu sắc và giá niêm yết của từng
              biến thể sản phẩm LUMORA.
            </p>
          </div>
          <div className="lv-actions">
            <button
              className="lv-primary"
              onClick={() => setEditor({ variant: null })}
              disabled={
                state.loading ||
                Boolean(state.error) ||
                Boolean(workingId) ||
                !data?.products?.length
              }
            >
              <Plus size={16} />
              Thêm Biến Thể Mới
            </button>
          </div>
        </header>
      </div>
      {notice && (
        <p className="lv-action-notice" role="status">
          {notice}
        </p>
      )}
      {actionError && (
        <p className="lv-action-error" role="alert">
          {actionError}
        </p>
      )}
      <section className="lv-filters" aria-label="Lọc danh sách SKU">
        <div className="lv-filter-heading">
          <div>
            <strong>Bộ lọc biến thể</strong>
          </div>
        </div>
        <label className="lv-search">
          Tìm kiếm
          <input
            type="search"
            aria-label="Tìm kiếm SKU"
            placeholder="SKU, tên sản phẩm hoặc chất liệu…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
        <label>
          Chất liệu
          <select
            value={query.material}
            onChange={(e) => update({ material: e.target.value })}
          >
            <option value="">Tất cả chất liệu</option>
            {data?.materials.map((material) => (
              <option key={material}>{material}</option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select
            value={query.status}
            onChange={(e) => update({ status: e.target.value })}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm ngừng</option>
          </select>
        </label>
        <button className="lv-reload" onClick={reload} disabled={state.loading}>
          <RefreshCw size={16} aria-hidden="true" />
          Tải lại
        </button>
      </section>

      <section className="lv-table-box" aria-label="Danh sách Variant">
        <div className="lv-table-title">
          <span>DANH SÁCH SKU</span>
          {!state.loading && !state.error && (
            <small>{data?.rows.length ?? 0} biến thể đang hiển thị</small>
          )}
        </div>
        {state.loading && !rawVariantsData.variants.length ? (
          <div className="lv-state" role="status">
            <RefreshCw size={22} className="lv-spin" aria-hidden="true" />
            <strong>Đang tải biến thể…</strong>
            <span>
              Hệ thống đang tải dữ liệu, vui lòng chờ trong giây lát...
            </span>
          </div>
        ) : state.error ? (
          <div className="lv-state lv-state-error" role="alert">
            <CircleAlert size={24} aria-hidden="true" />
            <strong>Không thể tải biến thể</strong>
            <p>{state.error}</p>
            <button onClick={reload}>Thử lại</button>
          </div>
        ) : !data?.rows.length ? (
          <div className="lv-state">
            <Barcode size={25} aria-hidden="true" />
            <strong>Không có Variant phù hợp</strong>
            <span>Hãy điều chỉnh từ khóa hoặc bộ lọc đang chọn.</span>
          </div>
        ) : (
          <div className="lv-table-scroll" tabIndex={0} aria-label="Bảng SKU">
            <table>
              <thead>
                <tr>
                  <th scope="col">MÃ SKU</th>
                  <th scope="col">SẢN PHẨM GỐC</th>
                  <th scope="col">THUỘC TÍNH BIẾN THỂ</th>
                  <th scope="col">GIÁ NIÊM YẾT (VNĐ)</th>
                  <th scope="col">TỒN KHẢ DỤNG</th>
                  <th scope="col">TRẠNG THÁI</th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((variant, index) => {
                  const src =
                    Array.isArray(variant.product?.images) &&
                    typeof variant.product.images[0] === "string"
                      ? variant.product.images[0]
                      : null;
                  const size =
                    typeof variant.size === "string" && variant.size.trim()
                      ? variant.size
                      : null;
                  const material =
                    typeof variant.material === "string" &&
                    variant.material.trim()
                      ? variant.material
                      : null;
                  const color =
                    typeof variant.color === "string" && variant.color.trim()
                      ? variant.color
                      : null;
                  const isMenuOpen = activeMenuId === variant._id;

                  return (
                    <tr key={variant._id ?? `${variant.productId}-${index}`}>
                      <td>
                        <span
                          className="lv-sku"
                          onClick={() => setSelectedVariant(variant)}
                          title="Bấm để xem chi tiết"
                          style={{ cursor: "pointer", fontSize: "12px" }}
                        >
                          {display(variant.sku)}
                        </span>
                      </td>
                      <td>
                        <div className="lv-api-product">
                          <Thumbnail key={src || "empty"} src={src} />
                          <div>
                            <strong
                              title={variant.product?.name ?? undefined}
                              onClick={() => setSelectedVariant(variant)}
                              style={{ cursor: "pointer" }}
                            >
                              {display(variant.product?.name)}
                            </strong>
                            <small className="lv-product-id">
                              ID: {variant.productId ?? "N/A"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="lv-api-attributes">
                          <div className="lv-attribute-line">
                            {material && (
                              <span>
                                {" "}
                                <strong>Chất liệu:</strong> {material}
                              </span>
                            )}
                          </div>
                          {color && (
                            <div className="lv-attribute-color">
                              <strong>Màu sắc: </strong>
                              {color}
                            </div>
                          )}
                          {!size && !material && !color && (
                            <span>Chưa có dữ liệu</span>
                          )}
                        </div>
                      </td>
                      <td className="lv-api-price">{money(variant.price)}</td>
                      <td>
                        <span
                          className={`lv-stock ${variant.availableStock === null ? "lv-stock-unknown" : variant.availableStock === 0 ? "lv-api-out" : "lv-stock-available"}`}
                        >
                          {variant.availableStock === null
                            ? "Chưa xác định"
                            : variant.availableStock === 0
                              ? "Hết hàng · 0"
                              : variant.availableStock}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`lv-stock ${variant.isActive === true ? "lv-active" : variant.isActive === false ? "lv-inactive" : ""}`}
                        >
                          {variant.isActive === true
                            ? "Đang hoạt động"
                            : variant.isActive === false
                              ? "Tạm ngừng"
                              : "Chưa có"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {/* Nút Thao Tác Dropdown gọn gàng */}
                        <div
                          className="lv-action-dropdown"
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <button
                            type="button"
                            className="lv-dropdown-toggle"
                            onClick={() =>
                              setActiveMenuId(isMenuOpen ? null : variant._id)
                            }
                          >
                            Chi tiết <MoreVertical size={14} />
                          </button>

                          {isMenuOpen && (
                            <div className="lv-dropdown-menu">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setSelectedVariant(variant);
                                }}
                              >
                                <Eye size={14} /> Xem chi tiết
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setEditor({ variant });
                                }}
                              >
                                <Edit3 size={14} /> Chỉnh sửa
                              </button>
                              {variant.isActive !== false && (
                                <button
                                  type="button"
                                  className="lv-menu-danger"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    deactivate(variant);
                                  }}
                                >
                                  <Power size={14} /> Vô hiệu hóa
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!state.loading && !state.error && (
          <footer className="lv-api-footer">
            <span>
              Hiển thị {data.rows.length} / {data.loaded} Variant
            </span>
          </footer>
        )}
      </section>

      {selectedVariant && (
        <VariantDetailModal
          variant={selectedVariant}
          onClose={() => setSelectedVariant(null)}
        />
      )}
      {editor && (
        <VariantDialog
          variant={editor.variant}
          products={data?.products ?? []}
          onClose={() => setEditor(null)}
          onSaved={saved}
        />
      )}
      {confirmVariant && (
        <DeactivateDialog
          kind="biến thể"
          name={display(confirmVariant.sku)}
          consequence="Biến thể sẽ chuyển sang trạng thái tạm ngừng. Tồn kho không thay đổi từ thao tác này."
          onClose={() => setConfirmVariant(null)}
          onConfirm={() => confirmDeactivate(confirmVariant)}
        />
      )}
    </div>
  );
}