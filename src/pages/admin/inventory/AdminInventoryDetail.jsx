import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  Warehouse,
  Banknote,
  ClipboardCheck,
  Package,
  Ruler,
  Layers,
  Weight,
  Barcode,
  MapPin,
  Clock,
  Truck,
  LockKeyhole,
} from "lucide-react";
import { getInventoryDetail } from "../../../services/admin/inventoryDetail.service.js";
import "./AdminInventoryDetail.css";

const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "EUR" }).format(
    value,
  );

function Pending({ children, reason, dark = false }) {
  return (
    <span className="lid-pending" tabIndex={0} aria-label={reason}>
      <button type="button" disabled className={dark ? "lid-dark" : ""}>
        {children}
      </button>
      <span role="tooltip">{reason}</span>
    </span>
  );
}

export default function AdminInventoryDetail() {
  const { variantId } = useParams();
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: "",
    id: null,
  });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getInventoryDetail(variantId)
      .then((data) => {
        if (!cancelled)
          setState({ loading: false, data, error: "", id: variantId });
      })
      .catch(() => {
        if (!cancelled)
          setState({
            loading: false,
            data: null,
            error: "Không thể tải thông tin Variant. Vui lòng thử lại.",
            id: variantId,
          });
      });
    return () => {
      cancelled = true;
    };
  }, [variantId, revision]);
  function retry() {
    setState((current) => ({ ...current, loading: true }));
    setRevision((value) => value + 1);
  }
  const loading = state.loading || state.id !== variantId;
  const { variant, product } = state.data ?? {};
  return (
    <div className="lid-page">
      <div className="lid-top">
        <p className="lid-eyebrow">
          GIÁM SÁT HỆ THỐNG / TỒN KHO / CHI TIẾT SKU
        </p>
        <Link to="/admin/variants">
          <ArrowLeft size={15} />
          Quay lại danh sách SKU
        </Link>
      </div>
      {loading ? (
        <div className="lid-state" role="status">
          Đang tải thông tin Variant…
        </div>
      ) : state.error ? (
        <div className="lid-state" role="alert">
          <p>{state.error}</p>
          <button onClick={retry}>Thử lại</button>
        </div>
      ) : !variant ? (
        <div className="lid-state" role="status">
          <Package size={30} />
          <h1>Không tìm thấy Variant</h1>
          <p>Không có Variant với ID “{variantId}”.</p>
          <Link to="/admin/variants">Quay lại danh sách SKU</Link>
        </div>
      ) : (
        <>
          <section className="lid-summary">
            <div>
              <span className="lid-tag">MÃ SKU: {variant.sku}</span>
              <p className="lid-readonly">
                <LockKeyhole size={12} />
                CHẾ ĐỘ GIÁM SÁT (READ-ONLY)
              </p>
              <small>Đồng bộ kho: Chưa tích hợp</small>
              <h1>{product?.name ?? "Chưa có thông tin sản phẩm"}</h1>
              <p>
                {variant.size} · {variant.material} · {variant.color}
              </p>
              <span className="lid-demo">
                Dữ liệu Variant/Product mock từ Catalog
              </span>
            </div>
            <Pending
              dark
              reason="Chưa tích hợp xuất lịch sử tồn kho Excel/CSV."
            >
              <Download size={16} />
              Xuất sổ cái lịch sử (Excel/CSV)
            </Pending>
          </section>
          <div className="lid-kpis">
            <article>
              <span>
                TỒN KHẢ DỤNG THỰC TẾ
                <Warehouse size={19} />
              </span>
              <strong>Chưa tích hợp</strong>
              <p className="lid-inset">Phân bố theo kho: Chưa tích hợp</p>
            </article>
            <article>
              <span>
                NGƯỠNG AN TOÀN TỐI THIỂU
                <ShieldCheck size={19} />
              </span>
              <strong>Chưa tích hợp</strong>
              <p className="lid-inset">Trạng thái an toàn: Chưa tích hợp</p>
            </article>
            <article>
              <span>
                GIÁ NIÊM YẾT THAM CHIẾU
                <Banknote size={19} />
              </span>
              <strong className="lid-price">{money(variant.price)}</strong>
              <small>EUR / Variant</small>
              <p className="lid-inset">Giá trị lưu kho: Chưa tích hợp</p>
            </article>
            <article>
              <span>
                KIỂM KÊ GẦN NHẤT
                <ClipboardCheck size={19} />
              </span>
              <strong>Chưa tích hợp</strong>
              <p className="lid-inset">Người kiểm kê: Chưa tích hợp</p>
            </article>
          </div>
          <div className="lid-details">
            <section className="lid-card lid-product">
              <p className="lid-eyebrow">HÌNH ẢNH MẪU SẢN PHẨM CẬN CẢNH</p>
              <div
                className="lid-photo"
                role="img"
                aria-label="Ảnh sản phẩm chờ asset gốc"
              >
                <Package size={36} />
                <span>Chờ asset gốc</span>
              </div>
              <p className="lid-inset">
                Xuất xứ: Chưa xác nhận
                <br />
                Lô sản xuất: Chưa xác nhận
              </p>
              <div className="lid-parent">
                <div>
                  <small>SẢN PHẨM CHA LIÊN KẾT</small>
                  <p>{product?.name ?? "Chưa có thông tin sản phẩm"}</p>
                  <small>ID: {variant.productId}</small>
                </div>
                <Pending reason="Trang chi tiết sản phẩm chưa được triển khai.">
                  Xem sản phẩm
                </Pending>
              </div>
            </section>
            <section className="lid-card">
              <div className="lid-heading">
                <h2>Thông Số Kỹ Thuật Biến Thể Chi Tiết</h2>
                <span className="lid-tag">Chuẩn hạng: Chưa xác nhận</span>
              </div>
              <div className="lid-spec-grid">
                <article>
                  <h3>
                    <Ruler size={16} />
                    KÍCH THƯỚC
                  </h3>
                  <strong>{variant.size}</strong>
                </article>
                <article>
                  <h3>
                    <Layers size={16} />
                    VẬT LIỆU & MÀU SẮC
                  </h3>
                  <strong>{variant.material}</strong>
                  <p>{variant.color}</p>
                </article>
                <article>
                  <h3>
                    <Weight size={16} />
                    TRỌNG LƯỢNG TỊNH & KIỆN
                  </h3>
                  <strong>Chưa tích hợp</strong>
                </article>
                <article>
                  <h3>
                    <Package size={16} />
                    QUY CÁCH ĐÓNG GÓI
                  </h3>
                  <strong>Chưa tích hợp</strong>
                </article>
              </div>
              <div className="lid-barcode">
                <h3>
                  <Barcode size={18} />
                  MÃ BARCODE / RFID TAG
                </h3>
                <strong>Chưa tích hợp</strong>
                <p>
                  Thời gian sản xuất: Chưa xác nhận
                  <br />
                  Bảo hành: Chưa xác nhận
                </p>
              </div>
            </section>
          </div>
          <section className="lid-policy">
            <ShieldCheck size={25} />
            <div>
              <h3>Nguyên Tắc Bảo Vệ Dữ Liệu Chuỗi Cung Ứng</h3>
              <p>
                Admin chỉ giám sát; không nhập, xuất, điều chuyển hoặc điều
                chỉnh tồn kho.
              </p>
              <small>Audit Log bất biến: Chưa tích hợp</small>
            </div>
            <span className="lid-tag">CHỈ ĐỌC</span>
          </section>
          <section className="lid-history">
            <header>
              <div>
                <h2>Sổ Cái Biến Động Tồn Kho</h2>
                <p>Lịch sử tồn kho: Chưa tích hợp</p>
              </div>
              <label>
                <span className="lid-filter-label">Loại biến động</span>
                <select disabled title="Chưa có nguồn lịch sử để lọc">
                  <option>Tất cả loại biến động</option>
                </select>
              </label>
            </header>
            <div
              className="lid-table-scroll"
              tabIndex={0}
              aria-label="Bảng lịch sử tồn kho, cuộn ngang khi cần"
            >
              <table>
                <thead>
                  <tr>
                    <th scope="col">THỜI GIAN GHI NHẬN</th>
                    <th scope="col">LOẠI BIẾN ĐỘNG</th>
                    <th scope="col">BIẾN THIÊN SỐ LƯỢNG</th>
                    <th scope="col">MÃ THAM CHIẾU LIÊN KẾT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="lid-empty">
                      Chưa có dữ liệu lịch sử tồn kho
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <footer>
              <span>Chuỗi sổ cái: Chưa tích hợp</span>
              <nav aria-label="Phân trang lịch sử">
                <button disabled title="Chưa có dữ liệu lịch sử">
                  Trước
                </button>
                <span>Chưa tích hợp</span>
                <button disabled title="Chưa có dữ liệu lịch sử">
                  Tiếp
                </button>
              </nav>
            </footer>
          </section>
          <div className="lid-bottom">
            <article>
              <h3>
                <MapPin size={17} />
                PHÂN BỐ VỊ TRÍ LƯU KHO
              </h3>
              <strong>Chưa tích hợp</strong>
            </article>
            <article>
              <h3>
                <Clock size={17} />
                THỜI GIAN LƯU KHO TRUNG BÌNH
              </h3>
              <strong>Chưa tích hợp</strong>
            </article>
            <article>
              <h3>
                <Truck size={17} />
                DỰ BÁO KẾ HOẠCH CUNG ỨNG
              </h3>
              <strong>Chưa tích hợp</strong>
            </article>
          </div>
        </>
      )}
    </div>
  );
}
