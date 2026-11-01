import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Plus,
  Package,
  Image,
  CircleAlert,
  Eye,
  Edit3,
  Power,
  MoreVertical,
  X,
} from "lucide-react";
import {
  deactivateProduct,
  loadAllCatalogData,
  filterProducts,
  reactivateProduct,
} from "../../../services/admin/catalog.service.js";
import ProductDialog from "./ProductDialog.jsx";
import ProductReactivateDialog from "./ProductReactivateDialog.jsx";
import DeactivateDialog from "../DeactivateDialog.jsx";
import "./AdminCatalog.css";

const display = (value) =>
  typeof value === "string" && value.trim() ? value : "Chưa có dữ liệu";
const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );

function Thumbnail({ src }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="lc-thumbnail">
      {src && !failed ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        <Image size={22} aria-label="Chưa có ảnh" />
      )}
    </span>
  );
}

// Modal xem chi tiết sản phẩm chuẩn dialog có mờ nền backdrop
function ProductDetailModal({ product, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (el && !el.open) el.showModal();
    return () => {
      if (el && el.open) el.close();
    };
  }, []);

  if (!product) return null;
  const src =
    Array.isArray(product.images) && typeof product.images[0] === "string"
      ? product.images[0]
      : null;

  return (
    <dialog
      ref={dialogRef}
      className="lc-detail-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="lc-modal-header">
        <div>
          <span className="lc-modal-eyebrow">THÔNG TIN CHI TIẾT</span>
          <h2>{display(product.name)}</h2>
        </div>
        <button
          type="button"
          className="lc-modal-close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </div>

      <div className="lc-modal-body">
        <div className="lc-modal-intro">
          <div className="lc-modal-thumb">
            {src ? (
              <img src={src} alt="" />
            ) : (
              <Image size={32} color="#64748b" />
            )}
          </div>
          <div>
            <span className="lc-modal-id">ID: {product._id ?? "N/A"}</span>
            <div className="lc-modal-price-tag">
              {product.priceRange
                ? product.priceRange.min === product.priceRange.max
                  ? money(product.priceRange.min)
                  : `${money(product.priceRange.min)} – ${money(product.priceRange.max)}`
                : "Liên hệ"}
            </div>
          </div>
        </div>

        <div className="lc-modal-grid">
          <div className="lc-modal-item">
            <span>Danh mục</span>
            <strong>{display(product.category?.name)}</strong>
          </div>
          <div className="lc-modal-item">
            <span>Thương hiệu</span>
            <strong>{display(product.brand?.name)}</strong>
          </div>
          <div className="lc-modal-item">
            <span>Trạng thái</span>
            <strong style={{ color: product.isActive ? "#166534" : "#991b1b" }}>
              {product.isActive === true ? "Đang hoạt động" : "Tạm ngưng"}
            </strong>
          </div>
        </div>

        <div className="lc-modal-section">
          <h4>Mô tả sản phẩm</h4>
          <p>{display(product.description)}</p>
        </div>

        <div className="lc-modal-section">
          <h4>Biến thể sản phẩm ({product.variants?.length || 0})</h4>
          <div className="lc-modal-variants-list">
            {product.variants?.length > 0 ? (
              product.variants.map((v, i) => (
                <div key={i} className="lc-variant-row">
                  <span>
                    SKU: {v.sku || "N/A"} — {v.material || "Tiêu chuẩn"}
                  </span>
                  <strong>{money(v.price || 0)}</strong>
                </div>
              ))
            ) : (
              <p className="lc-muted">Không có biến thể nào.</p>
            )}
          </div>
        </div>
      </div>

      <div className="lc-modal-footer">
        <button type="button" className="lc-primary" onClick={onClose}>
          Đóng cửa sổ
        </button>
      </div>
    </dialog>
  );
}

export default function AdminCatalog() {
  const [query, setQuery] = useState({
    search: "",
    categoryId: "",
    brandId: "",
    material: "",
    status: "",
  });
  
  // State phụ cho ô tìm kiếm giúp gõ phím mượt mà không bị delay
  const [searchTerm, setSearchTerm] = useState(query.search);

  // Lưu trữ toàn bộ dữ liệu thô cache trên client
  const [rawCatalog, setRawCatalog] = useState({
    products: [],
    categories: [],
    brands: [],
    materials: [],
  });

  const [state, setState] = useState({ loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [reactivateTarget, setReactivateTarget] = useState(null);
  const [workingId, setWorkingId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null); // Quản lý trạng thái mở menu thao tác của dòng nào
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  // Đóng menu thao tác khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".lc-action-dropdown")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Áp dụng Debounce 300ms cho ô tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((current) => {
        if (current.search === searchTerm) return current;
        return { ...current, search: searchTerm };
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Chỉ gọi API tải toàn bộ dữ liệu một lần duy nhất khi vào trang hoặc reload()
  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: "" }));
    
    loadAllCatalogData()
      .then((res) => {
        if (!cancelled) {
          setRawCatalog(res);
          setState({ loading: false, error: "" });
        }
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            loading: false,
            error: error.message || "Không thể tải Catalog.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [revision]);

  // Sử dụng useMemo để lọc dữ liệu ngay lập tức trên RAM mà không gọi lại mạng
  const data = useMemo(() => {
    return filterProducts(
      rawCatalog.products,
      rawCatalog.categories,
      rawCatalog.brands,
      rawCatalog.materials,
      query
    );
  }, [rawCatalog, query]);

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

  async function deactivate(product) {
    if (!/^[0-9a-fA-F]{24}$/.test(product._id ?? "") || workingId) return;
    setWorkingId(product._id);
    setNotice("");
    setActionError("");
    try {
      await deactivateProduct(product._id);
      setNotice("Đã vô hiệu hóa sản phẩm.");
      reload();
    } finally {
      setWorkingId(null);
    }
  }

  async function reactivate(product) {
    if (!/^[0-9a-fA-F]{24}$/.test(product._id ?? "") || workingId) return;
    setWorkingId(product._id);
    setNotice("");
    setActionError("");
    try {
      await reactivateProduct(product._id);
      setNotice("Đã kích hoạt lại sản phẩm.");
      reload();
    } finally {
      setWorkingId(null);
    }
  }

  const selects = [
    ["categoryId", "Danh mục", data?.categories],
    ["brandId", "Thương hiệu", data?.brands],
  ];

  return (
    <div className="lc-page">
      <div className="lc-intro">
        <p className="lc-eyebrow">QUẢN TRỊ DANH MỤC / SẢN PHẨM</p>
        <header className="lc-heading">
          <div>
            <h1>Quản Lý Sản Phẩm</h1>
            <p>
              Quản lý sản phẩm nội thất LUMORA và các biến thể trong danh mục.
            </p>
          </div>
          <div className="lc-toolbar">
            <Link to="/admin/brands">Quản Lý Thương Hiệu</Link>
            <Link to="/admin/categories">Quản Lý Danh Mục</Link>
            <button
              className="lc-primary"
              onClick={() => setEditor({ id: null })}
              disabled={
                state.loading ||
                Boolean(state.error) ||
                !data?.categories.length ||
                !data?.brands.length
              }
            >
              <Plus size={15} aria-hidden="true" />
              Thêm Sản Phẩm Mới
            </button>
          </div>
        </header>
      </div>
      {notice && (
        <p className="lc-product-notice" role="status">
          {notice}
        </p>
      )}
      {actionError && (
        <p className="lc-product-error" role="alert">
          {actionError}
        </p>
      )}
      <nav className="lc-navigation" aria-label="Phân hệ Catalog">
        <span aria-current="page">Tất cả sản phẩm</span>
        <Link to="/admin/variants">Quản lý Biến thể & SKU</Link>
        <Link to="/admin/categories">Danh mục & Không gian</Link>
        <Link to="/admin/brands">Thương hiệu & Xưởng chế tác</Link>
      </nav>
      <section className="lc-filters" aria-label="Lọc sản phẩm">
        <div className="lc-filter-heading">
          <div>
            <strong>Bộ lọc danh mục</strong>
          </div>
        </div>
        <label className="lc-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm sản phẩm"
            placeholder="Tên sản phẩm, mô tả hoặc SKU…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
        {selects.map(([field, label, options]) => (
          <label key={field}>
            {label}
            <select
              value={query[field]}
              onChange={(e) => update({ [field]: e.target.value })}
            >
              <option value="">Tất cả</option>
              {options
                ?.filter((item) => item._id != null)
                .map((item) => (
                  <option key={item._id} value={item._id}>
                    {display(item.name)}
                  </option>
                ))}
            </select>
          </label>
        ))}
        <label>
          Chất liệu
          <select
            value={query.material}
            onChange={(e) => update({ material: e.target.value })}
          >
            <option value="">Tất cả</option>
            {data?.materials.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select
            value={query.status}
            onChange={(e) => update({ status: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm ngừng</option>
          </select>
        </label>
        <button onClick={reload} disabled={state.loading}>
          <RefreshCw size={16} aria-hidden="true" />
          Tải lại
        </button>
      </section>

      <section className="lc-table-box">
        <div className="lc-table-title">
          <span>DANH SÁCH SẢN PHẨM</span>
          {!state.loading && !state.error && (
            <small>{data?.rows.length ?? 0} mục đang hiển thị</small>
          )}
        </div>
        {state.loading && !rawCatalog.products.length ? (
          <div className="lc-state" role="status">
            <RefreshCw size={22} className="lc-spin" aria-hidden="true" />
            <strong>Đang tải sản phẩm…</strong>
            <span>
              Đang đồng bộ danh mục LUMORA Atelier, vui lòng chờ trong giây lát
            </span>
          </div>
        ) : state.error ? (
          <div className="lc-state lc-state-error" role="alert">
            <CircleAlert size={24} aria-hidden="true" />
            <strong>Không thể tải sản phẩm</strong>
            <p>{state.error}</p>
            <button onClick={reload}>Thử lại</button>
          </div>
        ) : !data?.rows.length ? (
          <div className="lc-state">
            <Package size={25} aria-hidden="true" />
            <strong>Không có sản phẩm phù hợp</strong>
            <span>Hãy điều chỉnh từ khóa hoặc bộ lọc đang chọn.</span>
          </div>
        ) : (
          <div
            className="lv-table-scroll"
            tabIndex={0}
            aria-label="Bảng sản phẩm"
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">SẢN PHẨM</th>
                  <th scope="col">DANH MỤC</th>
                  <th scope="col">THƯƠNG HIỆU</th>
                  <th scope="col">MỨC GIÁ (VNĐ)</th>
                  <th scope="col">TRẠNG THÁI</th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((product, index) => {
                  const src =
                    Array.isArray(product.images) &&
                    typeof product.images[0] === "string"
                      ? product.images[0]
                      : null;
                  const isMenuOpen = activeMenuId === product._id;
                  return (
                    <tr
                      className={
                        product.isActive === false
                          ? "lc-row-inactive"
                          : undefined
                      }
                      key={product._id ?? index}
                    >
                      <td>
                        <div className="lc-product">
                          <Thumbnail key={src || "empty"} src={src} />
                          <div className="lc-product-info">
                            <strong
                              onClick={() => setSelectedProduct(product)}
                              title="Bấm để xem chi tiết"
                            >
                              {display(product.name)}
                            </strong>
                            <span className="lc-product-id">
                              ID: {product._id ?? "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{display(product.category?.name)}</td>
                      <td>{display(product.brand?.name)}</td>
                      <td>
                        <span className="lc-price">
                          {product.priceRange
                            ? product.priceRange.min === product.priceRange.max
                              ? money(product.priceRange.min)
                              : `${money(product.priceRange.min)} – ${money(product.priceRange.max)}`
                            : "Chưa có dữ liệu"}
                        </span>
                      </td>
                      <td>
                        <span className="lc-badge">
                          {product.isActive === true
                            ? "Đang hoạt động"
                            : product.isActive === false
                              ? "Tạm ngưng"
                              : "Chưa rõ"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {/* NÚT THAO TÁC GOM GỌN (DROPDOWN) */}
                        <div
                          className="lc-action-dropdown"
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <button
                            type="button"
                            className="lc-dropdown-toggle"
                            onClick={() =>
                              setActiveMenuId(isMenuOpen ? null : product._id)
                            }
                          >
                            Chi tiết <MoreVertical size={14} />
                          </button>

                          {isMenuOpen && (
                            <div className="lc-dropdown-menu">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setSelectedProduct(product);
                                }}
                              >
                                <Eye size={14} /> Xem chi tiết
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setEditor({
                                    id: product._id,
                                    inactive: product.isActive === false,
                                  });
                                }}
                              >
                                <Edit3 size={14} /> Chỉnh sửa
                              </button>
                              {product.isActive === true ? (
                                <button
                                  type="button"
                                  className="lc-menu-danger"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setConfirmProduct(product);
                                  }}
                                >
                                  <Power size={14} /> Vô hiệu hóa
                                </button>
                              ) : product.isActive === false ? (
                                <button
                                  type="button"
                                  className="lc-menu-success"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setReactivateTarget(product);
                                  }}
                                >
                                  <Power size={14} /> Kích hoạt lại
                                </button>
                              ) : null}
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
          <footer>
            Hiển thị {data.rows.length} / {data.loaded} sản phẩm
          </footer>
        )}
      </section>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {editor && (
        <ProductDialog
          id={editor.id}
          inactive={editor.inactive}
          categories={data?.categories ?? []}
          brands={data?.brands ?? []}
          onClose={() => setEditor(null)}
          onSaved={saved}
        />
      )}
      {confirmProduct && (
        <DeactivateDialog
          kind="sản phẩm"
          name={display(confirmProduct.name)}
          consequence="Sản phẩm sẽ chuyển sang trạng thái tạm ngừng."
          onClose={() => setConfirmProduct(null)}
          onConfirm={() => deactivate(confirmProduct)}
        />
      )}
      {reactivateTarget && (
        <ProductReactivateDialog
          name={display(reactivateTarget.name)}
          onClose={() => setReactivateTarget(null)}
          onConfirm={() => reactivate(reactivateTarget)}
        />
      )}
    </div>
  );
}