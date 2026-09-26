import { useEffect, useRef, useState } from "react";
import {
  Building,
  Package,
  BadgeCheck,
  Banknote,
  Plus,
  Pencil,
  X,
  Save,
  Image,
  Upload,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getBrands,
  saveBrand,
} from "../../../services/admin/brands.service.js";
import "./AdminBrands.css";

const defaults = { search: "", status: "", page: 1, pageSize: 5 };

function LogoPlaceholder() {
  return (
    <span className="lb-logo" role="img" aria-label="Chưa có asset logo gốc">
      <Building size={24} />
    </span>
  );
}

function BrandDialog({ brand, onClose, onSaved }) {
  const dialog = useRef(null);
  const [form, setForm] = useState({
    name: brand?.name ?? "",
    description: brand?.description ?? "",
    isActive: brand?.isActive ?? true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    return () => {
      element.close();
      previous?.focus();
    };
  }, []);
  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    if (!form.name.trim()) {
      setError("Tên thương hiệu không được để trống.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      onSaved(await saveBrand({ id: brand?._id, ...form }));
    } catch (failure) {
      setError(failure.message);
      setSaving(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="lb-dialog"
      aria-labelledby="lb-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <header>
        <div>
          <span className="lb-eyebrow">HỒ SƠ NHÃN HIỆU</span>
          <h2 id="lb-dialog-title">
            {brand ? "Chỉnh Sửa" : "Thêm Mới"} Thương Hiệu Nội Thất (Brand
            Management)
          </h2>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={onClose}
          aria-label="Đóng modal"
        >
          <X size={20} />
        </button>
      </header>
      <form onSubmit={submit}>
        <div className="lb-dialog-body">
          <div className="lb-form-grid">
            <label>
              TÊN THƯƠNG HIỆU *
              <input
                autoFocus
                required
                disabled={saving}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label>
              QUỐC GIA XUẤT XỨ
              <select disabled title="Quốc gia chưa được hỗ trợ">
                <option>Chưa xác nhận</option>
              </select>
            </label>
          </div>
          <section className="lb-logo-field" aria-label="Logo thương hiệu">
            <h3>LOGO THƯƠNG HIỆU (KHUYẾN NGHỊ 400×400PX)</h3>
            <div>
              <LogoPlaceholder />
              <div>
                <button
                  type="button"
                  disabled
                  aria-describedby="lb-upload-help"
                >
                  <Upload size={15} />
                  Tải Logo Lên
                </button>
                <p id="lb-upload-help">
                  Upload chưa tích hợp
                </p>
              </div>
            </div>
          </section>
          <label>
            MÔ TẢ THƯƠNG HIỆU
            <textarea
              rows={3}
              disabled={saving}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>
          <fieldset disabled={saving}>
            <legend>TRẠNG THÁI HOẠT ĐỘNG</legend>
            <label>
              <input
                type="radio"
                name="brandStatus"
                checked={form.isActive}
                onChange={() => setForm({ ...form, isActive: true })}
              />
              Đang hoạt động
            </label>
            <label>
              <input
                type="radio"
                name="brandStatus"
                checked={!form.isActive}
                onChange={() => setForm({ ...form, isActive: false })}
              />
              Tạm ngừng
            </label>
          </fieldset>
          {error && (
            <p className="lb-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <footer>
          <button type="button" onClick={onClose} disabled={saving}>
            Hủy Bỏ
          </button>
          <button className="lb-primary" disabled={saving}>
            <Save size={16} />
            {saving ? "Đang lưu…" : "Lưu Thương Hiệu"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

export default function AdminBrands() {
  const [query, setQuery] = useState(defaults);
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  const [revision, setRevision] = useState(0);
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let cancelled = false;
    getBrands(query)
      .then((data) => {
        if (!cancelled) setState({ loading: false, data, error: "" });
      })
      .catch((error) => {
        if (!cancelled)
          setState({ loading: false, data: null, error: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [query, revision]);
  function update(changes) {
    setState((current) => ({ ...current, loading: true, error: "" }));
    setQuery((current) => ({ ...current, page: 1, ...changes }));
  }
  function reload() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    setRevision((value) => value + 1);
  }
  function saved(brand) {
    setModal(null);
    setNotice(
      `Đã lưu “${brand.name}” vào mock dùng chung với Catalog. Thay đổi mất khi tải lại trình duyệt.`,
    );
    update({ page: 1 });
  }
  const data = state.data;
  return (
    <div className="lb-page">
      <p className="lb-eyebrow">
        QUẢN TRỊ DANH MỤC / THƯƠNG HIỆU & XƯỞNG ATELIER
      </p>
      <div className="lb-intro">
        <div>
          <h1>Quản Lý Thương Hiệu Nội Thất</h1>
          <p>
            Quản lý hồ sơ thương hiệu và danh mục sản phẩm liên kết của LUMORA.
          </p>
        </div>
        <button
          className="lb-primary"
          onClick={() => setModal({ brand: null })}
        >
          <Plus size={18} />
          Thêm Thương Hiệu Mới
        </button>
      </div>
      <p className="lb-demo">
        <strong>Dữ liệu demo dùng chung với Catalog</strong> · Lưu tạm trong bộ
        nhớ, không gọi Backend. Tải lại trình duyệt sẽ khôi phục dữ liệu ban
        đầu.
      </p>
      {notice && (
        <p className="lb-notice" role="status">
          {notice}
        </p>
      )}
      <div className="lb-kpis">
        <article>
          <span>
            TỔNG THƯƠNG HIỆU
            <Building size={20} />
          </span>
          <strong>{data?.totals.brands ?? "…"}</strong>
          <p>Thương hiệu trong mock</p>
        </article>
        <article>
          <span>
            ĐANG HOẠT ĐỘNG
            <BadgeCheck size={20} />
          </span>
          <strong>{data?.totals.active ?? "…"}</strong>
          <p>Trạng thái isActive của Brand</p>
        </article>
        <article>
          <span>
            SẢN PHẨM LIÊN KẾT
            <Package size={20} />
          </span>
          <strong>{data?.totals.products ?? "…"}</strong>
          <p>Tính theo brandId của Product</p>
        </article>
        <article>
          <span>
            GIÁ TRỊ ĐƠN TRUNG BÌNH (AOV)
            <Banknote size={20} />
          </span>
          <strong className="lb-unknown">Chưa tích hợp</strong>
          <p>Tăng trưởng: Chưa tích hợp</p>
        </article>
      </div>
      <section className="lb-filters" aria-label="Bộ lọc thương hiệu">
        <label>
          Tìm thương hiệu
          <input
            type="search"
            placeholder="Tên hoặc mô tả thương hiệu…"
            value={query.search}
            onChange={(event) => update({ search: event.target.value })}
          />
        </label>
        <label>
          Trạng thái
          <select
            value={query.status}
            onChange={(event) => update({ status: event.target.value })}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm ngừng</option>
          </select>
        </label>
        <button disabled={state.loading} onClick={reload}>
          Tải lại mock
        </button>
      </section>
      <section className="lb-table-box">
        {state.loading ? (
          <div className="lb-state" role="status">
            Đang tải thương hiệu…
          </div>
        ) : state.error ? (
          <div className="lb-state" role="alert">
            <p>{state.error}</p>
            <button onClick={reload}>Thử lại</button>
          </div>
        ) : !data?.rows.length ? (
          <div className="lb-state" role="status">
            <Building size={30} />
            <h2>Không có thương hiệu phù hợp</h2>
            <button onClick={() => update(defaults)}>Xóa bộ lọc</button>
          </div>
        ) : (
          <div
            className="lb-table-scroll"
            tabIndex={0}
            aria-label="Bảng thương hiệu, cuộn ngang khi cần"
          >
            <table>
              <thead>
                <tr>
                  {[
                    "THƯƠNG HIỆU",
                    "XUẤT XỨ",
                    "MÔ TẢ",
                    "SẢN PHẨM",
                    "DOANH SỐ ĐÓNG GÓP",
                    "TRẠNG THÁI",
                    "THAO TÁC",
                  ].map((label) => (
                    <th key={label} scope="col">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((brand) => (
                  <tr key={brand._id}>
                    <th scope="row">
                      <div className="lb-brand-name">
                        <LogoPlaceholder />
                        <div>
                          {brand.name}
                          <small>ID: {brand._id}</small>
                        </div>
                      </div>
                    </th>
                    <td>Chưa xác nhận</td>
                    <td className="lb-description">
                      {brand.description || "Chưa có mô tả"}
                    </td>
                    <td>
                      <span className="lb-count">
                        {brand.productCount}
                        <small>sản phẩm</small>
                      </span>
                    </td>
                    <td>
                      Chưa tích hợp<small>Tỷ trọng: Chưa tích hợp</small>
                    </td>
                    <td>
                      <span className="lb-badge">
                        {brand.isActive ? "Đang hoạt động" : "Tạm ngừng"}
                      </span>
                    </td>
                    <td>
                      <button
                        aria-label={`Sửa ${brand.name}`}
                        onClick={() => setModal({ brand })}
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <footer className="lb-pagination">
          <label>
            Dòng mỗi trang{" "}
            <select
              value={query.pageSize}
              onChange={(event) =>
                update({ pageSize: Number(event.target.value) })
              }
            >
              {[5, 10, 20].map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </label>
          {data && !state.loading && !state.error && (
            <>
              <span aria-live="polite">
                Hiển thị {data.rows.length} trên {data.total} thương hiệu ·
                Trang {data.page}/{data.totalPages}
              </span>
              <nav aria-label="Phân trang thương hiệu">
                <button
                  aria-label="Trang trước"
                  disabled={data.page === 1}
                  onClick={() => update({ page: data.page - 1 })}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>{data.page}</span>
                <button
                  aria-label="Trang sau"
                  disabled={data.page === data.totalPages}
                  onClick={() => update({ page: data.page + 1 })}
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </>
          )}
        </footer>
      </section>
      <div className="lb-bottom-grid">
        <section className="lb-featured">
          <div
            className="lb-photo"
            role="img"
            aria-label="Ảnh thương hiệu chờ asset gốc"
          >
            <Image size={30} />
            <span>Chờ asset gốc</span>
          </div>
          <div>
            <span className="lb-eyebrow">HỒ SƠ THƯƠNG HIỆU DEMO</span>
            <h2>{data?.featured?.name ?? "Chưa có thương hiệu"}</h2>
            <p>{data?.featured?.description ?? "Chưa có mô tả"}</p>
            <p>
              {data?.featured
                ? `${data.featured.productCount} sản phẩm liên kết`
                : "Chưa có dữ liệu"}
            </p>
            <small>Lead time: Chưa xác nhận</small>
          </div>
        </section>
        <section className="lb-curation">
          <span className="lb-eyebrow">
            <ShieldCheck size={16} />
            QUY TRÌNH GIÁM TUYỂN NHÃN HIỆU
          </span>
          <h2>Tiêu Chí Định Danh Thương Hiệu LUMORA</h2>
          <p>
            Chính sách giám tuyển, chứng nhận và điều kiện hợp tác:{" "}
            <strong>Chưa xác nhận</strong>.
          </p>
          <p>
            Không khẳng định thương hiệu đạt tiêu chuẩn độc quyền, nguồn vật
            liệu hoặc tỷ lệ chế tác thủ công khi chưa có dữ liệu.
          </p>
          <button disabled aria-describedby="lb-policy-help">
            Xem tiêu chuẩn thẩm định
          </button>
          <small id="lb-policy-help">
            Chưa xác nhận chính sách; chưa có tài liệu để mở.
          </small>
        </section>
      </div>
      {modal && (
        <BrandDialog
          brand={modal.brand}
          onClose={() => setModal(null)}
          onSaved={saved}
        />
      )}
    </div>
  );
}
