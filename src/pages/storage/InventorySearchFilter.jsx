import React, { useState, useEffect } from "react";
import { loadStorageVariants } from "../../services/storageData";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";

const InventorySearchFilter = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tuKhoa, setTuKhoa] = useState("");
  const [khuVucKho, setKhuVucKho] = useState("ALL");
  const [trangThaiTon, setTrangThaiTon] = useState("ALL");

  // Gọi API lấy dữ liệu thật khi component được mount
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        setSkuProducts(await loadStorageVariants());
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tra cứu tồn kho:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const ketQuaLoc = skuProducts.filter((item) => {
    const khopTuKhoa =
      item.name.toLowerCase().includes(tuKhoa.toLowerCase()) ||
      item.id.toLowerCase().includes(tuKhoa.toLowerCase()) ||
      item.specs.toLowerCase().includes(tuKhoa.toLowerCase());

    const khopKhuVuc = khuVucKho === "ALL" || item.location?.includes(khuVucKho);

    let khopTrangThai = true;
    if (trangThaiTon === "LOW") {
      khopTrangThai = item.stock !== null && item.stock <= 15 && item.stock > 0;
    } else if (trangThaiTon === "OUT") {
      khopTrangThai = item.stock === 0;
    } else if (trangThaiTon === "NORMAL") {
      khopTrangThai = item.stock !== null && item.stock > 15;
    }

    return khopTuKhoa && khopKhuVuc && khopTrangThai;
  });

  const xuLyDatLai = () => {
    setTuKhoa("");
    setKhuVucKho("ALL");
    setTrangThaiTon("ALL");
  };

  if (loading) {
    return (
      <div
        className="dashboard-main"
        style={{
          padding: "40px",
          fontFamily: "'Playfair Display', serif",
          textAlign: "center",
        }}
      >
        Đang đồng bộ dữ liệu tra cứu từ hệ thống...
      </div>
    );
  }

  return (
    <div
      className="dashboard-main"
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      <header className="dash-header">
        <div>
          <span
            className="subtitle"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            TÌM KIẾM & BỘ LỌC NÂNG CAO
          </span>
          <h2
            style={{
              fontFamily: "Bodoni Moda",
              fontSize: "clamp(2rem, 2.5vw, 2.7rem)",
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              fontWeight: 600,
            }}
          >
            Tra Cứu & Lọc Dữ Liệu Tồn Kho
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif" }}>
            Tra cứu nhanh chóng thông tin sản phẩm, vị trí lưu trữ và trạng thái
            hàng hóa theo tiêu chí đa chiều.
          </p>
        </div>
        <div className="actions" style={{ fontFamily: "'Inter', sans-serif" }}>
          <button className="btn-secondary" onClick={xuLyDatLai}>
            <RotateCcw
              size={14}
              style={{ marginRight: "6px", verticalAlign: "middle" }}
            />{" "}
            Đặt Lại Bộ Lọc
          </button>
        </div>
      </header>

      {/* Khu vực điều khiển bộ lọc */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "6px",
          border: "1px solid #eaeaea",
          marginBottom: "24px",
          fontFamily: "Bodoni Moda",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#1a1a1a",
          }}
        >
          <SlidersHorizontal size={18} />
          <span>Bộ Lọc Dữ Liệu Tồn Kho</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                color: "#8c857b",
                marginBottom: "6px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              TỪ KHÓA TÌM KIẾM
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#f7f6f3",
                padding: "10px 12px",
                borderRadius: "4px",
                border: "1px solid #e2ded4",
              }}
            >
              <Search size={16} color="#8c857b" />
              <input
                type="text"
                placeholder="Nhập tên SKU, mã định danh hoặc quy cách..."
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  width: "100%",
                  fontSize: "13px",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                color: "#8c857b",
                marginBottom: "6px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              KHU VỰC KHO
            </label>
            <select
              value={khuVucKho}
              onChange={(e) => setKhuVucKho(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "4px",
                border: "1px solid #e2ded4",
                background: "#f7f6f3",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <option value="ALL">Tất Cả Khu Vực Kho</option>
              <option value="Kho A">Kho A</option>
              <option value="Kho B">Kho B</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "700",
                color: "#8c857b",
                marginBottom: "6px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              TRẠNG THÁI TỒN KHO
            </label>
            <select
              value={trangThaiTon}
              onChange={(e) => setTrangThaiTon(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "4px",
                border: "1px solid #e2ded4",
                background: "#f7f6f3",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <option value="ALL">Tất Cả Trạng Thái</option>
              <option value="NORMAL">Ổn định (&gt; 15)</option>
              <option value="LOW">Sắp hết (1 - 15)</option>
              <option value="OUT">Hết hàng (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kết quả tìm kiếm */}
      <section className="sku-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <h3 style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>Kết Quả Tra Cứu</h3>
          <span style={{ fontSize: "13px", color: "#666", fontFamily: "'Inter', sans-serif" }}>
            Tìm thấy <strong>{ketQuaLoc.length}</strong> kết quả phù hợp
          </span>
        </div>

        <table className="storage-table" style={{ fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr>
              <th>MÃ SKU & TÊN SẢN PHẨM</th>
              <th>QUY CÁCH & BIẾN THỂ</th>
              <th>VỊ TRÍ LƯU TRỮ</th>
              <th>SỐ LƯỢNG TỒN</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {ketQuaLoc.length > 0 ? (
              ketQuaLoc.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <strong>{prod.name}</strong>
                    <br />
                    <small style={{ color: "#888" }}>{prod.id}</small>
                  </td>
                  <td>{prod.specs}</td>
                  <td>
                    <span className="badge">{prod.location || "Chưa cập nhật"}</span>
                  </td>
                  <td>
                    <strong>{prod.stock}</strong> chiếc
                  </td>
                  <td>
                    <span
                      style={{
                        background:
                          prod.stock === 0
                            ? "#fef2f2"
                            : prod.stock <= 15
                              ? "#fffbeb"
                              : "#f0fdf4",
                        color:
                          prod.stock === 0
                            ? "#dc2626"
                            : prod.stock <= 15
                              ? "#d97706"
                              : "#16a34a",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      {prod.stock === 0
                        ? "HẾT HÀNG"
                        : prod.stock <= 15
                          ? "SẮP HẾT"
                          : "ỔN ĐỊNH"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666",
                  }}
                >
                  Không tìm thấy sản phẩm nào khớp với điều kiện tìm kiếm và bộ
                  lọc của bạn.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default InventorySearchFilter;
