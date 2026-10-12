import { ArrowLeft, LockKeyhole, Package, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getOrderDetailAvailability } from "../../../services/admin/orderDetail.service.js";
import "./AdminOrderDetail.css";

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const access = getOrderDetailAvailability(orderId);

  return (
    <div className="lod-page">
      <p className="lod-eyebrow">
        GIÁM SÁT HỆ THỐNG / ĐƠN HÀNG / CHI TIẾT ĐƠN
      </p>
      <span className="lod-readonly">
        <ShieldCheck size={13} />
        CHẾ ĐỘ GIÁM SÁT (READ-ONLY)
      </span>
      <Link className="lod-back" to="/admin/monitoring">
        <ArrowLeft size={15} />
        Quay lại danh sách đơn hàng
      </Link>
      <div className="lod-intro">
        <div>
          <h1>Chi Tiết Đơn Hàng</h1>
          <span className="lod-status">Yêu cầu quyền Backend</span>
          <p>
            Mã route: <strong>{access.orderId || "Không xác định"}</strong>
          </p>
        </div>
      </div>
      <section className="lod-card lod-state" role="status">
        <LockKeyhole size={34} />
        <h2>{access.title}</h2>
        <p>{access.message}</p>
        <p className="lod-muted">
          Trang không gọi API chi tiết hoặc Payment dành riêng cho Customer và
          không dựng dữ liệu đơn hàng từ Inventory hay Monitoring.
        </p>
        <Link to="/admin/monitoring">Về Admin Monitoring</Link>
      </section>
      <div className="lod-kpis" aria-label="Các nhóm dữ liệu chưa khả dụng">
        {["TỔNG GIÁ TRỊ ĐƠN", "QUY CÁCH KIỆN HÀNG", "GIAO HÀNG", "THANH TOÁN"].map(
          (label) => (
            <article key={label}>
              <span>
                {label}
                <Package size={18} />
              </span>
              <strong className="lod-unknown">Chưa khả dụng</strong>
              <p>Chờ Backend cấp quyền cho Admin.</p>
            </article>
          ),
        )}
      </div>
      <section className="lod-card lod-policy">
        <h3>
          <ShieldCheck size={20} />
          Giới Hạn Tích Hợp
        </h3>
        <p>
          Customer, vật phẩm, giá trị, Payment, giao nhận, timeline, Staff và
          Warehouse không được hiển thị khi chưa có API Admin hợp lệ.
        </p>
      </section>
    </div>
  );
}
