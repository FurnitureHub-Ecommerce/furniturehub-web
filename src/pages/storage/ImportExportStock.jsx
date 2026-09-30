import React, { useState, useEffect } from "react";
import { storageAPI } from "../../services/api";
import {
  loadStorageVariants,
  loadInventoryTransactionsFromBE,
} from "../../services/storageData";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Plus,
  X,
  CheckCircle2,
  Calendar,
  Package,
} from "lucide-react";

const ImportExportStock = () => {
  const [tabHienTai, setTabHienTai] = useState("import");
  const [chungTu, setChungTu] = useState({ import: [], export: [] });
  const [loading, setLoading] = useState(true);

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

      const productsData = await loadStorageVariants();
      setDanhSachSanPham(Array.isArray(productsData) ? productsData : []);

      const txData = await loadInventoryTransactionsFromBE();

      const importedList = [];
      const exportedList = [];

      (Array.isArray(txData) ? txData : []).forEach((tx, index) => {
        let prodName = "Sản phẩm nội thất";
        if (typeof tx.productName === "string") prodName = tx.productName;
        else if (tx.productName?.name) prodName = tx.productName.name;
        else if (tx.variantId?.productId?.name) prodName = tx.variantId.productId.name;
        else if (tx.variantId?.name) prodName = tx.variantId.name;
        else if (tx.sku?.name) prodName = tx.sku.name;
        else if (typeof tx.sku === "string") prodName = tx.sku;

        const itemObj = {
          code: tx.code || `TX-${tx._id?.slice(-4) || index}`,
          date: tx.createdAt
            ? new Date(tx.createdAt).toLocaleString()
            : "Hôm nay",
          productName: prodName,
          quantity: tx.quantity || 0,
          note: tx.note || "",
          status: "Hoàn Thành",
        };

        const typeStr = String(tx.type || "").toUpperCase();
        const isImport =
          typeStr.includes("IMPORT") ||
          typeStr.includes("NHẬP") ||
          tx.code?.startsWith("IMP");

        if (isImport) {
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

  const handleTaoPhieu = async (e) => {
    e.preventDefault();
    if (!formData.variantId) {
      alert("Vui lòng chọn sản phẩm/biến thể!");
      return;
    }

    try {
      setSubmitting(true);

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
        `Tạo phiếu ${tabHienTai === "import" ? "nhập" : "xuất"} kho thành công!`,
      );

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
      style={{ fontFamily: "'Inter', sans-serif", paddingBottom: "60px" }}
    >
      <style>{`
        .tab-btn {
          padding: 10px 22px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          transition: all 0.25s ease;
          border: 1px solid #e2ded8;
          background: #fff;
          color: #666;
        }
        .tab-btn:hover {
          background: #f7f5f0;
          color: #111;
          border-color: #d1cbc1;
        }
        .tab-btn.active {
          background: #1c1c1c;
          color: #fff;
          border-color: #1c1c1c;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .custom-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #eae6df;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .custom-table th {
          background: #faf8f5;
          color: #78716c;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #eae6df;
          white-space: nowrap;
        }
        .custom-table td {
          padding: 16px;
          font-size: 13px;
          color: #292524;
          border-bottom: 1px solid #f2efeb;
          vertical-align: middle;
        }
        .custom-table tbody tr:last-child td {
          border-bottom: none;
        }
        .custom-table tbody tr:hover {
          background: #fcfbfa;
        }
      `}</style>

      <header className="dash-header" style={{ marginBottom: "24px" }}>
        <div>
          <span className="subtitle">QUẢN LÝ DÒNG CHẢY HÀNG HÓA</span>
          <h2
            style={{
              fontFamily: "Bodoni Moda",
              fontSize: "clamp(2rem, 2.5vw, 2.7rem)",
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              fontWeight: 600,
              margin: "4px 0 8px 0",
            }}
          >
            Quản Lý Nhập Kho & Xuất Kho
          </h2>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
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
              gap: "8px",
              padding: "11px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              background: "#1c1c1c",
              color: "#fff",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "all 0.2s",
            }}
          >
            <Plus size={16} />
            Tạo Phiếu {tabHienTai === "import" ? "Nhập" : "Xuất"} Kho Mới
          </button>
        </div>
      </header>

      {/* Tabs chuyển đổi Nhập / Xuất */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
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

      {/* Bảng danh sách chứng từ */}
      <section style={{ background: "transparent" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <FileText size={18} color="#1c1c1c" />
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#1c1c1c" }}>
            Danh Sách Chứng Từ{" "}
            {tabHienTai === "import" ? "Nhập Kho" : "Xuất Kho"} (Từ Database)
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: "50px", textAlign: "center", color: "#888", background: "#fff", borderRadius: "12px", border: "1px solid #eae6df" }}>
            Đang tải dữ liệu từ Database...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: "110px" }}>MÃ</th>
                  <th style={{ width: "170px" }}>THỜI GIAN</th>
                  <th>TÊN SẢN PHẨM</th>
                  <th style={{ textAlign: "center", width: "100px" }}>SỐ LƯỢNG</th>
                  <th>GHI CHÚ</th>
                  <th style={{ textAlign: "center", width: "120px" }}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {chungTu[tabHienTai] && chungTu[tabHienTai].length > 0 ? (
                  chungTu[tabHienTai].map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <span style={{ 
                          fontFamily: "monospace", 
                          fontWeight: 700, 
                          color: "#1c1c1c",
                          background: "#f4f1ea",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          whiteSpace: "nowrap"
                        }}>
                          {item.code}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#57534e", fontSize: "12px", whiteSpace: "nowrap" }}>
                          <Calendar size={13} color="#8c857b" />
                          {item.date}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Package size={15} color="#d97706" style={{ flexShrink: 0 }} />
                          <strong style={{ color: "#1c1c1c", fontWeight: 600, lineHeight: 1.4 }}>{item.productName}</strong>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "13px",
                            color: tabHienTai === "import" ? "#16a34a" : "#dc2626",
                            background: tabHienTai === "import" ? "#f0fdf4" : "#fef2f2",
                            padding: "5px 12px",
                            borderRadius: "6px",
                            display: "inline-block",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {tabHienTai === "import" ? `+${item.quantity}` : `-${item.quantity}`}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "#78716c", fontSize: "12px", fontStyle: item.note ? "normal" : "italic" }}>
                          {item.note || "Không có ghi chú"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            background: "#ecfdf5",
                            color: "#059669",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                            display: "inline-block",
                            border: "1px solid #a7f3d0",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#8c857b" }}>
                      Không có chứng từ {tabHienTai === "import" ? "nhập" : "xuất"} kho nào trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL TẠO PHIẾU MỚI */}
      {isOpenModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "520px",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                borderBottom: "1px solid #eae6df",
                paddingBottom: "14px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.3rem",
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
                  background: "#f4f1ea",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
              >
                <X size={18} color="#444" />
              </button>
            </div>

            {thongBaoThanhCong ? (
              <div
                style={{
                  padding: "30px",
                  background: "#f0fdf4",
                  borderRadius: "12px",
                  textAlign: "center",
                  color: "#16a34a",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  border: "1px solid #bbf7d0",
                }}
              >
                <CheckCircle2 size={40} />
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
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#78716c",
                      letterSpacing: "0.05em",
                    }}
                  >
                    CHỌN SẢN PHẨM / BIẾN THỂ *
                  </label>
                  <select
                    value={formData.variantId}
                    onChange={(e) =>
                      setFormData({ ...formData, variantId: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      fontSize: "13px",
                      background: "#faf8f5",
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                    required
                  >
                    <option value="">
                      -- Chọn sản phẩm từ hệ thống kho --
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
                      fontSize: "11px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#78716c",
                      letterSpacing: "0.05em",
                    }}
                  >
                    ĐỐI TÁC / NHÀ CUNG CẤP (Tùy chọn)
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
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      fontSize: "13px",
                      background: "#faf8f5",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#78716c",
                      letterSpacing: "0.05em",
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
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      fontSize: "13px",
                      background: "#faf8f5",
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
                      fontSize: "11px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#78716c",
                      letterSpacing: "0.05em",
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
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      fontSize: "13px",
                      background: "#faf8f5",
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
                    gap: "10px",
                    marginTop: "8px",
                    borderTop: "1px solid #eae6df",
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
                    style={{
                      padding: "10px 22px",
                      borderRadius: "8px",
                      background: "#1c1c1c",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    {submitting ? "Đang lưu..." : "Xác Nhận Tạo"}
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