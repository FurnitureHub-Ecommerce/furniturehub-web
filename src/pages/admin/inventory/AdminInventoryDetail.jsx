import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Banknote, Layers, AlertTriangle, RefreshCw,
  LockKeyhole, Package, Ruler, ShieldCheck, Warehouse,
} from "lucide-react";
import { getInventoryDetail } from "../../../services/admin/inventoryDetail.service.js";
import "./AdminInventoryDetail.css";
import { TransactionHistoryPanel } from "../inventory/InventoryReadSections.jsx";

const hasValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";
const displayValue = (value) => (hasValue(value) ? value : "Chưa có dữ liệu");
const displayNumber = (value) =>
  typeof value === "number"
    ? new Intl.NumberFormat("vi-VN").format(value)
    : "Chưa có dữ liệu";
const money = (value) =>
  typeof value === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value) // Đã chỉnh lại sang VNĐ cho đồng bộ hệ thống
    : "Chưa có dữ liệu";

function loadErrorMessage(error) {
  const source = {
    Inventory: "tồn kho",
    Variant: "biến thể",
    Product: "sản phẩm liên kết",
  }[error?.inventoryDetailSource] ?? "chi tiết SKU";
  const status = error?.response?.status;
  if (status) return `Không thể tải ${source} (HTTP ${status}). Vui lòng thử lại.`;
  if (error instanceof Error && !error.isAxiosError) return error.message;
  return `Không thể tải ${source}. Vui lòng kiểm tra kết nối và thử lại.`;
}

function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="lid-photo" role="img" aria-label="Ảnh sản phẩm chưa có">
        <Package size={36} /><span>Chưa có ảnh sản phẩm</span>
      </div>
    );
  }
  return <div className="lid-photo"><img src={src} alt={alt} onError={() => setFailed(true)} /></div>;
}

export default function AdminInventoryDetail() {
  const { variantId } = useParams();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const requestId = `${variantId}:${productId ?? ""}`;
  const [state, setState] = useState({ loading: true, data: null, error: "", id: null });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getInventoryDetail(variantId, productId)
      .then((data) => {
        if (!cancelled) setState({ loading: false, data, error: "", id: requestId });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            data: null,
            error: loadErrorMessage(error),
            id: requestId,
          });
        }
      });
    return () => { cancelled = true; };
  }, [variantId, productId, requestId, revision]);

  function retry() {
    setState((current) => ({ ...current, loading: true }));
    setRevision((value) => value + 1);
  }

  const loading = state.loading || state.id !== requestId;
  const { variant, product, inventory } = state.data ?? {};
  const productImage = Array.isArray(product?.images)
    ? product.images.find((image) => typeof image === "string" && image.trim())
    : null;
  const hasLowStockDefinition =
    typeof inventory?.quantity === "number" &&
    typeof inventory?.lowStockThreshold === "number";
  const stockStatus = hasLowStockDefinition
    ? inventory.quantity <= inventory.lowStockThreshold
      ? "Đã chạm ngưỡng thấp"
      : "Trên ngưỡng an toàn"
    : "Chưa có dữ liệu";

  return (
    <div className="lid-page">
      <div className="lid-top">
        <p className="lid-eyebrow">GIÁM SÁT HỆ THỐNG / TỒN KHO / CHI TIẾT SKU</p>
        {/* Sửa lại đường dẫn quay lại trang Quản lý Biến thể & SKU */}
        <Link to="/admin/variants"><ArrowLeft size={15} />Quay lại danh sách SKU</Link>
      </div>

      {loading ? (
        <div className="lid-state" role="status"><RefreshCw className="lid-spin" size={24} aria-hidden="true" /><h1 style={{fontFamily: "'Montserrat', sans-serif"}}>Đang tải thông tin Variant</h1><p>Vui lòng chờ trong giây lát.</p></div>
      ) : state.error ? (
        <div className="lid-state lid-state-error" role="alert"><AlertTriangle size={26} aria-hidden="true" /><h1>Không thể tải chi tiết SKU</h1><p>{state.error}</p><button onClick={retry}>Thử lại</button></div>
      ) : !variant ? (
        <div className="lid-state" role="status">
          <Package size={30} /><h1>Không tìm thấy Variant</h1>
          <p>Không có Variant với ID “{variantId}”.</p>
          <Link to="/admin/variants">Quay lại danh sách SKU</Link>
        </div>
      ) : (
        <>
          <section className="lid-summary">
            <div>
              <span className="lid-tag">MÃ SKU: {displayValue(variant.sku)}</span>
              
              <h1 style={{fontFamily: "'Montserrat', sans-serif"}}>{product?.name ?? "Chưa có thông tin sản phẩm"}</h1>
              <p className="lid-attributes"><strong>Kích thước:</strong> {displayValue(variant.size)} </p>
              <p className="lid-attributes"><strong>Chất liệu:</strong> {displayValue(variant.material)}</p>
              <p className="lid-attributes"><strong>Màu sắc:</strong> {displayValue(variant.color)}</p>
            </div>
          </section>

          <div className="lid-kpis">
            <article>
              <span>SỐ LƯỢNG TỒN KHO <Warehouse size={19} /></span>
              <strong>{inventory ? displayNumber(inventory.quantity) : "Chưa có dữ liệu tồn kho"}</strong>
              {!inventory && <p className="lid-inset">SKU này chưa có bản ghi tồn kho. Số lượng chưa xác định.</p>}
            </article>
            <article>
              <span>GIÁ NIÊM YẾT THAM CHIẾU <Banknote size={19} /></span>
              <strong className="lid-price">{money(variant.price)}</strong>
              
            </article>
            <article>
              <span>NGƯỠNG AN TOÀN TỐI THIỂU <ShieldCheck size={19} /></span>
              <strong>{displayNumber(inventory?.lowStockThreshold)}</strong>
              <p className="lid-inset">Trạng thái: <span className={`lid-stock-status ${hasLowStockDefinition ? inventory.quantity <= inventory.lowStockThreshold ? "lid-stock-low" : "lid-stock-safe" : ""}`}>{stockStatus}</span></p>
            </article>
          </div>

          <div className="lid-details">
            <section className="lid-card lid-product">
              <p className="lid-eyebrow">HÌNH ẢNH SẢN PHẨM</p>
              <ProductImage src={productImage} alt={product?.name ?? "Sản phẩm của Variant"} />
              <div className="lid-parent">
                <div>
                  <small>SẢN PHẨM LIÊN KẾT</small>
                  <p>{product?.name ?? "Chưa có thông tin sản phẩm"}</p>
                  <small>ID: {displayValue(variant.productId)}</small>
                </div>
              </div>
            </section>

            <section className="lid-card">
              <div className="lid-heading">
                <h2 style={{fontFamily: "'Playfair Display', serif"}}>Thông Số Kỹ Thuật Biến Thể Chi Tiết</h2>
              </div>
              <div className="lid-spec-grid">
                <article><h3 style={{fontFamily: "'Playfair Display', serif"}}><Ruler size={16} />KÍCH THƯỚC</h3><strong>{displayValue(variant.size)}</strong></article>
                <article><h3 style={{fontFamily: "'Playfair Display', serif"}}><Layers size={16} />VẬT LIỆU & MÀU SẮC</h3><strong>{displayValue(variant.material)}</strong><p>{displayValue(variant.color)}</p></article>
              </div>
            </section>
          </div>

          {/* --- TÍCH HỢP BẢNG LỊCH SỬ BIẾN ĐỘNG TỒN KHO RIÊNG CHO SKU NÀY --- */}
          <div style={{ marginTop: "24px" }}>
            <TransactionHistoryPanel variantId={variantId} compact={true} />
          </div>
        </>
      )}
    </div>
  );
}