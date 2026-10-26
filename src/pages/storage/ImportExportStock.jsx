import React, { useState, useEffect } from "react";
import { storageAPI } from "../../services/api";
import { ArrowDownLeft, ArrowUpRight, FileText, Plus, X, CheckCircle2 } from "lucide-react";

const ImportExportStock = () => {
  const [tabHienTai, setTabHienTai] = useState("import");
  const [chungTu, setChungTu] = useState({ import: [], export: [] });
  const [loading, setLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [danhSachSanPham, setDanhSachSanPham] = useState([]);
  const [formData, setFormData] = useState({ variantId: "", quantity: 1, note: "", partner: "" });
  const [submitting, setSubmitting] = useState(false);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      // Gọi đồng thời API lấy danh sách kho, lịch sử giao dịch và danh sách sản phẩm từ Admin để cập nhật SKU mới tạo
      const [invRes, txRes, productsRes] = await Promise.all([
        storageAPI.getInventory().catch(() => ({ data: { inventories: [] } })),
        storageAPI.getInventoryTransactions().catch(() => ({ data: { transactions: [] } })),
        storageAPI.getProductsAdmin ? storageAPI.getProductsAdmin().catch(() => ({ data: { products: [] } })) : Promise.resolve({ data: { products: [] } })
      ]);

      // 1. Xử lý tồn kho hiện tại để map số lượng
      const invBody = invRes?.data || {};
      const inventories = invBody.inventories || invBody.data?.inventories || invBody.items || [];
      const stockMap = new Map();
      inventories.forEach(item => {
        const variant = item.variantId || item.variant || {};
        const key = variant.sku || variant._id || item._id;
        if (key) {
          stockMap.set(key, item.quantity ?? item.stock ?? 0);
        }
      });

      // 2. Lấy danh sách biến thể từ sản phẩm do Admin quản lý để không bao giờ bị thiếu SKU mới tạo
      const prodBody = productsRes?.data || {};
      const products = prodBody.products || prodBody.data || prodBody.rows || [];

      const formattedVariants = [];
      products.forEach(product => {
        const variants = product.variants || [];
        if (variants.length > 0) {
          variants.forEach(variant => {
            const sku = variant.sku || variant._id;
            const variantId = variant._id || variant.id;
            if (variantId) {
              formattedVariants.push({
                variantId: variantId,
                sku: sku || 'SKU',
                name: product.name,
                specs: [
                  variant.color ? `Màu: ${variant.color}` : '',
                  variant.size ? `Size: ${variant.size}` : '',
                  variant.material ? `Chất liệu: ${variant.material}` : ''
                ].filter(Boolean).join(' — ') || 'Tiêu chuẩn',
                stock: stockMap.has(sku) ? stockMap.get(sku) : 0
              });
            }
          });
        }
      });

      // Fallback dự phòng nếu API sản phẩm admin trống thì dùng trực tiếp từ inventory
      if (formattedVariants.length === 0) {
        inventories.forEach(item => {
          const variant = item.variantId || item.variant || {};
          const product = variant.productId || item.product || {};
          const vId = variant._id || variant.id || item._id;
          if (vId) {
            formattedVariants.push({
              variantId: vId,
              sku: variant.sku || 'SKU',
              name: product.name || item.name || 'Sản phẩm nội thất',
              specs: [variant.color, variant.size, variant.material].filter(Boolean).join(' — ') || 'Tiêu chuẩn',
              stock: item.quantity ?? 0
            });
          }
        });
      }

      setDanhSachSanPham(formattedVariants);

      // 3. Xử lý danh sách chứng từ nhập xuất kho
      const txData = txRes?.data?.transactions || txRes?.data?.data || txRes?.data || [];
      const importedList = [];
      const exportedList = [];

      (Array.isArray(txData) ? txData : []).forEach((tx) => {
        const variant = tx.variantId || {};
        const product = variant.productId || {};
        const prodName = product.name || tx.productName || 'Sản phẩm nội thất';

        const itemObj = {
          date: tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'Hôm nay',
          productName: prodName,
          quantity: tx.quantity || 0,
          note: tx.note || '',
          status: 'Hoàn Thành'
        };

        const typeStr = String(tx.type || '').toUpperCase();
        if (typeStr.includes('IMPORT') || typeStr.includes('NHẬP')) {
          importedList.push(itemObj);
        } else {
          exportedList.push(itemObj);
        }
      });

      setChungTu({ import: importedList, export: exportedList });
    } catch (error) {
      console.error("Lỗi tải dữ liệu chứng từ từ Backend:", error);
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
      alert("Vui lòng chọn sản phẩm/biến thể cần thao tác!");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        quantity: Number(formData.quantity),
        note: [formData.partner ? `Đối tác: ${formData.partner}` : '', formData.note].filter(Boolean).join(' - ') || 'Giao dịch kho'
      };

      if (tabHienTai === "import") {
        await storageAPI.importInventory(formData.variantId, payload);
      } else {
        await storageAPI.exportInventory(formData.variantId, payload);
      }

      setThongBaoThanhCong(`Tạo phiếu ${tabHienTai === "import" ? "nhập" : "xuất"} kho thành công!`);
      await fetchData();

      setTimeout(() => {
        setThongBaoThanhCong("");
        setIsOpenModal(false);
        setFormData({ variantId: "", quantity: 1, note: "", partner: "" });
      }, 1500);
    } catch (err) {
      console.error("Lỗi tạo phiếu:", err);
      alert("Có lỗi xảy ra khi lưu vào Database hệ thống!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: "60px" }}>
      <header className="dash-header" style={{ marginBottom: "24px" }}>
        <div>
          <span className="subtitle">QUẢN LÝ DÒNG CHẢY HÀNG HÓA</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: "clamp(2rem, 2.5vw, 2.7rem)", color: "#1a1a1a", fontWeight: 600 }}>
            Quản Lý Nhập Kho & Xuất Kho
          </h2>
          <p style={{ color: "#666", fontSize: "14px" }}>Đồng bộ chứng từ và lịch sử dòng chảy hàng hóa trực tiếp từ Backend.</p>
        </div>
        <div className="actions">
          <button className="btn-primary" onClick={() => setIsOpenModal(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 18px", borderRadius: "8px", background: "#1c1c1c", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>
            <Plus size={16} /> Tạo Phiếu {tabHienTai === "import" ? "Nhập" : "Xuất"} Kho Mới
          </button>
        </div>
      </header>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => setTabHienTai("import")} style={{ padding: '10px 22px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', background: tabHienTai === 'import' ? '#1c1c1c' : '#fff', color: tabHienTai === 'import' ? '#fff' : '#666', border: '1px solid #e2ded8' }}>
          <ArrowDownLeft size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Phiếu Nhập Kho
        </button>
        <button onClick={() => setTabHienTai("export")} style={{ padding: '10px 22px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', background: tabHienTai === 'export' ? '#1c1c1c' : '#fff', color: tabHienTai === 'export' ? '#fff' : '#666', border: '1px solid #e2ded8' }}>
          <ArrowUpRight size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Phiếu Xuất Kho
        </button>
      </div>

      <section style={{ background: "transparent" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <FileText size={18} color="#1c1c1c" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Danh Sách Chứng Từ {tabHienTai === "import" ? "Nhập Kho" : "Xuất Kho"}</h3>
        </div>

        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>Đang đồng bộ dữ liệu từ Backend...</div>
        ) : (
          <table className="storage-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eae6df' }}>
            <thead>
              <tr style={{ background: '#faf8f5', color: '#78716c', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>
                <th style={{ padding: '14px 16px' }}>THỜI GIAN</th>
                <th style={{ padding: '14px 16px' }}>TÊN SẢN PHẨM</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>SỐ LƯỢNG</th>
                <th style={{ padding: '14px 16px' }}>GHI CHÚ</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {chungTu[tabHienTai].length > 0 ? (
                chungTu[tabHienTai].map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f2efeb' }}>
                    <td style={{ padding: '16px', fontSize: '12px', color: '#57534e' }}>{item.date}</td>
                    <td style={{ padding: '16px' }}><strong>{item.productName}</strong></td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <strong style={{ color: tabHienTai === 'import' ? '#16a34a' : '#dc2626' }}>
                        {tabHienTai === 'import' ? `+${item.quantity}` : `-${item.quantity}`}
                      </strong>
                    </td>
                    <td style={{ padding: '16px', fontSize: '12px', color: '#78716c' }}>{item.note || 'Không có ghi chú'}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{item.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#8c857b' }}>Không có chứng từ nào.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      {isOpenModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '540px', borderRadius: '16px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #eae6df', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>Tạo Phiếu {tabHienTai === "import" ? "Nhập" : "Xuất"} Kho Mới</h3>
              <button onClick={() => setIsOpenModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {thongBaoThanhCong ? (
              <div style={{ padding: '30px', background: '#f0fdf4', borderRadius: '12px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto 12px' }} />
                {thongBaoThanhCong}
              </div>
            ) : (
              <form onSubmit={handleTaoPhieu} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#78716c' }}>CHỌN SẢN PHẨM / BIẾN THỂ (Đã đồng bộ từ Admin) *</label>
                  <select value={formData.variantId} onChange={(e) => setFormData({ ...formData, variantId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#fff' }} required>
                    <option value="">-- Chọn sản phẩm hoặc SKU mới --</option>
                    {danhSachSanPham.map((p) => (
                      <option key={p.variantId} value={p.variantId}>
                        [{p.sku}] {p.name} ({p.specs}) — Tồn hiện tại: {p.stock}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#78716c' }}>ĐỐI TÁC / NHÀ CUNG CẤP</label>
                  <input type="text" placeholder="Nhập tên đối tác hoặc nhà cung cấp..." value={formData.partner} onChange={(e) => setFormData({ ...formData, partner: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dcd6cd', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#78716c' }}>SỐ LƯỢNG THỰC TẾ *</label>
                  <input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dcd6cd', boxSizing: 'border-box' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#78716c' }}>GHI CHÚ GIAO DỊCH</label>
                  <textarea rows="3" placeholder="Nhập ghi chú chi tiết..." value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dcd6cd', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', borderTop: '1px solid #eae6df', paddingTop: '16px' }}>
                  <button type="button" onClick={() => setIsOpenModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#fff', cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" disabled={submitting} style={{ padding: '10px 22px', borderRadius: '8px', background: '#1c1c1c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{submitting ? 'Đang lưu...' : 'Xác Nhận Tạo'}</button>
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