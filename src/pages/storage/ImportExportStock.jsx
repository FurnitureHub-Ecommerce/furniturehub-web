import React, { useState, useEffect } from "react";
import { storageAPI } from "../../services/api";
import { loadStorageVariants } from "../../services/storageData";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";

const ImportExportStock = () => {
  const [tabHienTai, setTabHienTai] = useState("import");
  const [chungTu, setChungTu] = useState({ import: [], export: [] });
  const [loading, setLoading] = useState(true);

  // State quản lý Modal tạo phiếu mới
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [danhSachSanPham, setDanhSachSanPham] = useState([]);
  const [formData, setFormData] = useState({
    variantId: "",
    quantity: 1,
    note: "",
    partner: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Lấy danh sách biến thể từ BE để hiển thị trong select box
      const productsData = await loadStorageVariants();
      const productsArr = Array.isArray(productsData) ? productsData : [];
      setDanhSachSanPham(productsArr);

      // 2. Lấy lịch sử giao dịch từ API Backend để hiển thị danh sách chứng từ
      const txResponse = await storageAPI
        .getInventoryTransactions()
        .catch(() => []);

      let txData = [];
      if (Array.isArray(txResponse)) {
        txData = txResponse;
      } else if (Array.isArray(txResponse?.data)) {
        txData = txResponse.data;
      } else if (Array.isArray(txResponse?.transactions)) {
        txData = txResponse.transactions;
      }

      const importedList = [];
      const exportedList = [];

      txData.forEach((tx, index) => {
        // Xử lý an toàn tên sản phẩm hoặc SKU
        let prodName = "Sản phẩm kho";
        if (typeof tx.productName === "string") prodName = tx.productName;
        else if (tx.productName?.name) prodName = tx.productName.name;

        const itemObj = {
          code: tx.code || `TX-${tx._id?.slice(-4) || index}`,
          date: tx.createdAt
            ? new Date(tx.createdAt).toLocaleString()
            : "Hôm nay",
          partner:
            tx.partner ||
            (tx.note?.includes("Đối tác:")
              ? tx.note.split("Đối tác:")[1]?.split("(")[0]?.trim()
              : "Đối tác chính"),
          items: `${prodName} (x${tx.quantity || 0}) - ${tx.note || ""}`,
          status: "Hoàn Thành",
        };

        if (tx.type === "IMPORT" || tx.type?.includes("Nhập")) {
          importedList.push(itemObj);
        } else {
          exportedList.push(itemObj);
        }
      });

      setChungTu({ import: importedList, export: exportedList });
    } catch (error) {
      console.error("Lỗi tải dữ liệu chứng từ kho từ BE:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý tạo phiếu và gửi request trực tiếp lên Database thông qua Backend API
  const handleTaoPhieu = async (e) => {
    e.preventDefault();
    if (!formData.variantId) {
      alert("Vui lòng chọn sản phẩm/biến thể!");
      return;
    }

    try {
      setSubmitting(true);

      // Đóng gói payload khớp hoàn hảo với schema của Backend (chỉ chứa quantity và note)
      const partnerText = formData.partner
        ? `Đối tác: ${formData.partner}`
        : "";
      const noteText = formData.note ? `${formData.note}` : "";
      const finalNote =
        [partnerText, noteText].filter(Boolean).join(" - ") ||
        "Giao dịch kho hàng";

      const payload = {
        quantity: Number(formData.quantity),
        note: finalNote,
      };

      if (tabHienTai === "import") {
        await storageAPI.importInventory(formData.variantId, payload);
      } else {
        await storageAPI.exportInventory(formData.variantId, payload);
      }

      setThongBaoThanhCong(
        `Tạo phiếu ${tabHienTai === "import" ? "nhập" : "xuất"} kho thành công và lưu vào Database!`,
      );

      // Load lại dữ liệu mới nhất từ Database
      await fetchData();

      setTimeout(() => {
        setThongBaoThanhCong("");
        setIsOpenModal(false);
        setFormData({ variantId: "", quantity: 1, note: "", partner: "" });
      }, 1500);
    } catch (err) {
      console.error("Lỗi tạo phiếu lên BE:", err);
      alert("Có lỗi xảy ra khi lưu vào Database từ Backend!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="dashboard-main"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        .tab-btn {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          transition: all 0.25s ease;
          border: 1px solid #dcd6cd;
          background: #fff;
          color: #555;
        }
        .tab-btn:hover {
          background: #f4f1ea;
          color: #111;
          border-color: #b8b0a2;
        }
        .tab-btn.active {
          background: #1c1c1c;
          color: #fff;
          border-color: #1c1c1c;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }
      `}</style>

      <header className="dash-header">
        <div>
          <span className="subtitle">QUẢN LÝ DÒNG CHẢY HÀNG HÓA</span>
          <h2
            style={{
              fontFamily: "Bodoni Moda",
              fontSize: "clamp(2rem, 2.5vw, 2.7rem)",
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              fontWeight: 600,
            }}
          >
            Quản Lý Nhập Kho & Xuất Kho
          </h2>
          <p>
            Đồng bộ chứng từ và lịch sử dòng chảy hàng hóa trực tiếp từ Database
            Backend.
          </p>
        </div>
        <div className="actions">
          <button
            className="btn-primary"
            onClick={() => setIsOpenModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            Tạo Phiếu {tabHienTai === "import" ? "Nhập" : "Xuất"} Kho Mới
          </button>
        </div>
      </header>

      {/* Tabs chuyển đổi Nhập / Xuất */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          onClick={() => setTabHienTai("import")}
          className={`tab-btn ${tabHienTai === "import" ? "active" : ""}`}
        >
          <ArrowDownLeft size={16} /> Phiếu Nhập Kho
        </button>
        <button
          onClick={() => setTabHienTai("export")}
          className={`tab-btn ${tabHienTai === "export" ? "active" : ""}`}
        >
          <ArrowUpRight size={16} /> Phiếu Xuất Kho
        </button>
      </div>

      {/* Bảng danh sách chứng từ từ Database */}
      <section className="sku-section">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <FileText size={20} color="#1c1c1c" />
          <h3 style={{ margin: 0 }}>
            Danh Sách Chứng Từ{" "}
            {tabHienTai === "import" ? "Nhập Kho" : "Xuất Kho"} (Từ Database)
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            Đang tải dữ liệu từ Database...
          </div>
        ) : (
          <table className="storage-table" style={{ fontSize: "14px" }}>
            <thead>
              <tr>
                <th>MÃ CHỨNG TỪ</th>
                <th>THỜI GIAN</th>
                <th>ĐỐI TÁC / NHÀ CUNG CẤP</th>
                <th>CHI TIẾT HÀNG HÓA & GHI CHÚ</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {chungTu[tabHienTai]?.length > 0 ? (
                chungTu[tabHienTai].map((tx, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{tx.code}</strong>
                    </td>
                    <td>{tx.date}</td>
                    <td>{tx.partner}</td>
                    <td>{tx.items}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: "#f0ede6", fontWeight: "600" }}
                      >
                        {tx.status}
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
                      padding: "30px",
                      color: "#666",
                    }}
                  >
                    Chưa có dữ liệu chứng từ{" "}
                    {tabHienTai === "import" ? "nhập" : "xuất"} kho trong
                    Database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* MODAL TẠO PHIẾU MỚI */}
      {/* MODAL TẠO PHIẾU MỚI */}
      {isOpenModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            animation: "fadeIn 0.2s ease-out forwards",
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "560px",
              borderRadius: "16px",
              padding: "32px",
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
              transform: "translateY(0)",
              animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                borderBottom: "1px solid #eaeaea",
                paddingBottom: "14px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  fontFamily: "Bodoni Moda",
                }}
              >
                Tạo Phiếu {tabHienTai === "import" ? "Nhập" : "Xuất"} Kho Mới
              </h3>
              <button
                onClick={() => setIsOpenModal(false)}
                style={{
                  background: "#f5f5f4",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#e7e5e4")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#f5f5f4")
                }
              >
                <X size={18} color="#444" />
              </button>
            </div>

            {thongBaoThanhCong ? (
              <div
                style={{
                  padding: "24px",
                  background: "#f0fdf4",
                  borderRadius: "10px",
                  textAlign: "center",
                  color: "#16a34a",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  border: "1px solid #bbf7d0",
                }}
              >
                <CheckCircle2 size={36} />
                <span style={{ fontWeight: 600, fontSize: "15px" }}>
                  {thongBaoThanhCong}
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleTaoPhieu}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#555",
                      letterSpacing: "0.03em",
                    }}
                  >
                    CHỌN BIẾN THỂ SẢN PHẨM *
                  </label>
                  <select
                    value={formData.variantId}
                    onChange={(e) =>
                      setFormData({ ...formData, variantId: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      fontSize: "14px",
                      background: "#fcfbfa",
                      outline: "none",
                      cursor: "pointer",
                    }}
                    required
                  >
                    <option value="">
                      -- Chọn biến thể từ hệ thống kho --
                    </option>
                    {danhSachSanPham.map((p) => (
                      <option
                        key={p.variantId || p.id}
                        value={p.variantId || p.id}
                      >
                        {p.name} ({p.specs}) — Tồn kho: {p.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#555",
                      letterSpacing: "0.03em",
                    }}
                  >
                    NHÀ CUNG CẤP / ĐỐI TÁC
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên nhà cung cấp hoặc đơn vị nhận..."
                    value={formData.partner}
                    onChange={(e) =>
                      setFormData({ ...formData, partner: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      fontSize: "14px",
                      background: "#fcfbfa",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#555",
                      letterSpacing: "0.03em",
                    }}
                  >
                    SỐ LƯỢNG *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      fontSize: "14px",
                      background: "#fcfbfa",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#555",
                      letterSpacing: "0.03em",
                    }}
                  >
                    GHI CHÚ GIAO DỊCH
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Nhập ghi chú chi tiết..."
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      fontSize: "14px",
                      background: "#fcfbfa",
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    marginTop: "12px",
                    borderTop: "1px solid #eaeaea",
                    paddingTop: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsOpenModal(false)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      background: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "#555",
                    }}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{
                      padding: "10px 22px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    {submitting ? "Đang lưu Database..." : "Xác Nhận Tạo"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExportStock;
