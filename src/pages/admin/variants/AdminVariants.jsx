import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Barcode,
  Layers,
  BadgeCheck,
  Monitor,
  Download,
  CirclePlus,
  RefreshCw,
  Package,
  Ruler,
  Palette,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { getVariants } from "../../../services/admin/variants.service.js";
import "./AdminVariants.css";

const initialQuery = {
  search: "",
  material: "",
  minPrice: "",
  maxPrice: "",
  status: "",
  page: 1,
  pageSize: 10,
};
const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "EUR" }).format(
    value,
  );

function Unavailable({ children, reason, primary = false }) {
  return (
    <span className="lv-unavailable" tabIndex={0} aria-label={reason}>
      <button disabled type="button" className={primary ? "lv-primary" : ""}>
        {children}
      </button>
      <span className="lv-tooltip">{reason}</span>
    </span>
  );
}

export default function AdminVariants() {
  const [query, setQuery] = useState(initialQuery);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => {
    let cancelled = false;
    getVariants(query)
      .then((data) => {
        if (!cancelled) setState({ loading: false, data, error: "" });
      })
      .catch((error) => {
        if (!cancelled)
          setState((current) => ({
            ...current,
            loading: false,
            error: error.message,
          }));
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
  const data = state.data;
  const totals = data?.totals;
  return (
    <div className="lv-page">
      <p className="lv-eyebrow">QUẢN TRỊ DANH MỤC / BIẾN THỂ & SKU</p>
      <div className="lv-intro">
        <div>
          <h1>Quản Lý Biến Thể & Danh Mục SKU</h1>
          <p>
            Theo dõi kích thước, chất liệu, màu sắc và giá niêm yết
            <br />
            của từng biến thể sản phẩm LUMORA.
          </p>
        </div>
        <div className="lv-actions">
          <Unavailable reason="Xuất báo cáo SKU chưa triển khai.">
            <Download size={16} />
            Xuất Báo Cáo SKU
          </Unavailable>
          <Unavailable
            primary
            reason="Thêm Variant chưa triển khai; trang này chỉ đọc."
          >
            <CirclePlus size={16} />
            Thêm Biến Thể Mới
          </Unavailable>
        </div>
      </div>
      <p className="lv-demo">
        <strong>Dữ liệu mock Catalog</strong> · Chỉ đọc · Giá demo bằng EUR ·
        Tải lại không đồng bộ Backend hoặc Storage.
      </p>
      <div className="lv-kpis">
        <article>
          <span>
            TỔNG MÃ BIẾN THỂ (SKU)
            <Barcode size={20} />
          </span>
          <strong>{totals?.variants ?? "…"}</strong>
          <p>Trên {totals?.products ?? "…"} sản phẩm có Variant</p>
        </article>
        <article>
          <span>
            QUY CHUẨN HOÀN THIỆN
            <Layers size={20} />
          </span>
          <strong className="lv-pending">Chưa tích hợp</strong>
          <p>Chưa có dữ liệu quy chuẩn hoàn thiện</p>
        </article>
        <article>
          <span>
            VARIANT ĐANG HOẠT ĐỘNG
            <BadgeCheck size={20} />
          </span>
          <strong>{totals?.active ?? "…"}</strong>
          <p>
            {totals
              ? `${totals.variants ? ((totals.active / totals.variants) * 100).toFixed(1) : "0"}% tổng SKU · ${totals.variants - totals.active} ngừng hoạt động`
              : "Đang tải tổng số…"}
          </p>
        </article>
        <article>
          <span>
            ĐỒNG BỘ DỮ LIỆU KHO
            <Monitor size={20} />
          </span>
          <strong className="lv-pending">Chưa tích hợp</strong>
          <p>Không có kết nối đồng bộ Storage</p>
        </article>
      </div>
      <section className="lv-filters" aria-label="Lọc danh sách SKU">
        <label className="lv-search">
          Tìm kiếm
          <input
            type="search"
            placeholder="SKU, tên sản phẩm hoặc chất liệu…"
            value={query.search}
            onChange={(event) => update({ search: event.target.value })}
          />
        </label>
        <label>
          Chất liệu
          <select
            value={query.material}
            onChange={(event) => update({ material: event.target.value })}
          >
            <option value="">Tất cả chất liệu</option>
            {data?.materials.map((material) => (
              <option key={material}>{material}</option>
            ))}
          </select>
        </label>
        <label>
          Giá tối thiểu (EUR)
          <input
            type="number"
            min="0"
            step="0.01"
            value={query.minPrice}
            onChange={(event) => update({ minPrice: event.target.value })}
            aria-invalid={query.minPrice !== "" && Number(query.minPrice) < 0}
          />
        </label>
        <label>
          Giá tối đa (EUR)
          <input
            type="number"
            min="0"
            step="0.01"
            value={query.maxPrice}
            onChange={(event) => update({ maxPrice: event.target.value })}
            aria-invalid={
              query.maxPrice !== "" &&
              (Number(query.maxPrice) < 0 ||
                (query.minPrice !== "" &&
                  Number(query.minPrice) > Number(query.maxPrice)))
            }
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
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>
        <button className="lv-reload" onClick={reload} disabled={state.loading}>
          <RefreshCw size={17} />
          Tải lại mock
        </button>
      </section>
      <section className="lv-table-box" aria-label="Danh sách Variant">
        {state.loading ? (
          <div className="lv-state" role="status">
            Đang tải danh sách SKU…
          </div>
        ) : state.error ? (
          <div className="lv-state" role="alert">
            <p>{state.error}</p>
            <button onClick={reload}>Thử lại</button>
            <button onClick={() => update(initialQuery)}>Xóa bộ lọc</button>
          </div>
        ) : !data?.rows.length ? (
          <div className="lv-state" role="status">
            <Package size={30} />
            <h2>Không có SKU phù hợp</h2>
            <p>Thử điều chỉnh tìm kiếm, chất liệu, giá hoặc trạng thái.</p>
            <button onClick={() => update(initialQuery)}>Xóa bộ lọc</button>
          </div>
        ) : (
          <>
            <p className="lv-result" aria-live="polite">
              Hiển thị {data.rows.length} trên {data.total} SKU phù hợp · KPI
              phía trên tính trên toàn bộ mock.
            </p>
            <div
              className="lv-table-scroll"
              tabIndex={0}
              aria-label="Bảng SKU, cuộn ngang khi cần"
            >
              <table>
                <thead>
                  <tr>
                    <th scope="col">MÃ SKU</th>
                    <th scope="col">SẢN PHẨM GỐC</th>
                    <th scope="col">THUỘC TÍNH BIẾN THỂ</th>
                    <th scope="col">GIÁ BÁN NIÊM YẾT</th>
                    <th scope="col">TỒN KHO (STORAGE)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((variant) => (
                    <tr key={variant._id}>
                      <td>
                        <Link
                          className="lv-sku"
                          to={
                            "/admin/inventory/" +
                            encodeURIComponent(variant._id)
                          }
                        >
                          {variant.sku}
                        </Link>
                        <small>ID: {variant._id}</small>
                      </td>
                      <td>
                        <div className="lv-product">
                          <span
                            className="lv-placeholder"
                            role="img"
                            aria-label="Chưa có ảnh sản phẩm gốc"
                          >
                            <Package size={25} />
                          </span>
                          <div>
                            <strong>
                              {variant.product?.name ?? "Chưa có sản phẩm gốc"}
                            </strong>
                            <small>ID sản phẩm: {variant.productId}</small>
                            <small>
                              Danh mục:{" "}
                              {variant.category?.name ?? "Chưa xác định"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="lv-attribute">
                          <Ruler size={15} />
                          <span>{variant.size}</span>
                        </div>
                        <div className="lv-attribute">
                          <Layers size={15} />
                          <span>{variant.material}</span>
                        </div>
                        <div className="lv-attribute">
                          <Palette size={15} />
                          <span>{variant.color}</span>
                        </div>
                      </td>
                      <td>
                        <strong className="lv-price">
                          {money(variant.price)}
                        </strong>
                        <small>Thuế: Chưa xác nhận</small>
                      </td>
                      <td>
                        <span className="lv-stock">Chưa tích hợp</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <footer className="lv-footer">
          <label>
            Dòng trên trang:{" "}
            <select
              value={query.pageSize}
              onChange={(event) =>
                update({ pageSize: Number(event.target.value) })
              }
            >
              {[5, 10, 20].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          {data && !state.error && !state.loading && (
            <>
              <span>
                {data.total
                  ? `Trang ${data.page} trên ${data.totalPages}`
                  : "0 kết quả"}
              </span>
              <nav aria-label="Phân trang SKU">
                <button
                  aria-label="Trang đầu"
                  disabled={data.page === 1}
                  onClick={() => update({ page: 1 })}
                >
                  <ChevronsLeft size={17} />
                </button>
                <button
                  aria-label="Trang trước"
                  disabled={data.page === 1}
                  onClick={() => update({ page: data.page - 1 })}
                >
                  <ChevronLeft size={17} />
                </button>
                {Array.from(
                  { length: data.totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    aria-current={page === data.page ? "page" : undefined}
                    onClick={() => update({ page })}
                  >
                    {page}
                  </button>
                ))}
                <button
                  aria-label="Trang sau"
                  disabled={data.page === data.totalPages}
                  onClick={() => update({ page: data.page + 1 })}
                >
                  <ChevronRight size={17} />
                </button>
                <button
                  aria-label="Trang cuối"
                  disabled={data.page === data.totalPages}
                  onClick={() => update({ page: data.totalPages })}
                >
                  <ChevronsRight size={17} />
                </button>
              </nav>
            </>
          )}
        </footer>
      </section>
      <section className="lv-governance">
        <ShieldCheck size={25} />
        <div>
          <h2>Nguyên Tắc Quản Trị Theo Vai Trò</h2>
          <p>
            Admin xem thông tin SKU và giá niêm yết trong mock Catalog. Trang
            này không thực hiện nhập, xuất hoặc điều chỉnh tồn kho của Storage
            Manager.
          </p>
          <small>
            Vai trò nghiệp vụ: Admin / Staff / Storage Manager / Customer
          </small>
        </div>
        <span>
          Quyền ghi: <strong>Chưa xác định</strong>
        </span>
      </section>
    </div>
  );
}
