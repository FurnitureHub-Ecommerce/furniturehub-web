import React, { useState, useEffect } from 'react';
import { loadStorageVariants } from '../../services/storageData';
import { Search, Filter, Eye, X, Info, CheckCircle, XCircle, Calendar } from 'lucide-react';

const SkuManagement = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [boLocTrangThai, setBoLocTrangThai] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // State quản lý Modal xem chi tiết SKU
  const [selectedSku, setSelectedSku] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    const fetchRealInventory = async () => {
      try {
        setLoading(true);
        const data = await loadStorageVariants();
        setSkuProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu kho:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealInventory();
  }, []);

  const danhSachLoc = skuProducts.filter((item) => {
    const productName = item.variantId?.productId?.name || item.name || '';
    const skuCode = item.variantId?.sku || item.sku || item.id || '';

    const nameMatch = productName.toLowerCase().includes(tuKhoaTimKiem.toLowerCase());
    const skuMatch = skuCode.toLowerCase().includes(tuKhoaTimKiem.toLowerCase());
    const matchKeyword = nameMatch || skuMatch;

    if (boLocTrangThai === 'STABLE') return matchKeyword && item.stock !== null && item.stock > 15;
    if (boLocTrangThai === 'LOW') return matchKeyword && item.stock !== null && item.stock > 0 && item.stock <= 15;
    if (boLocTrangThai === 'OUT') return matchKeyword && item.stock === 0;

    return matchKeyword;
  });

  const handleOpenDetail = (prod) => {
    setSelectedSku(prod);
    setIsOpenModal(true);
  };

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '50px', textAlign: 'center', color: '#888' }}>Đang đồng bộ dữ liệu SKU từ hệ thống...</div>;
  }

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '60px' }}>
      <style>{`
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
        .view-btn:hover {
          background: #1c1c1c !important;
          color: #fff !important;
          border-color: #1c1c1c !important;
        }
      `}</style>

      {/* Header trang */}
      <header className="dash-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>QUẢN LÝ DANH MỤC SKU</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600, margin: '4px 0 8px 0' }}>
            Quản Lý Danh Mục SKU & Biến Thể
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Quản lý toàn bộ thông tin định danh sản phẩm và thuộc tính biến thể trong kho.</p>
        </div>
        
        <div className="actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '80px' }}>
          <span style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Filter size={14} /> Lọc trạng thái:
          </span>
          <select 
            value={boLocTrangThai} 
            onChange={(e) => setBoLocTrangThai(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            <option value="ALL">Tất Cả Trạng Thái</option>
            <option value="STABLE">Ổn Định (&gt; 15)</option>
            <option value="LOW">Sắp Hết (1 - 15)</option>
            <option value="OUT">Hết Hàng (0)</option>
          </select>
        </div>
      </header>

      {/* Thanh tìm kiếm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #eae6df', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '380px', background: '#faf8f5', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2ded4' }}>
          <Search size={18} color="#8c857b" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã SKU..."
            value={tuKhoaTimKiem}
            onChange={(e) => setTuKhoaTimKiem(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: '#1c1c1c' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#78716c' }}>
          <span>Hiển thị tổng số <strong>{danhSachLoc.length}</strong> SKU</span>
        </div>
      </div>

      {/* Bảng danh sách SKU */}
      <section className="sku-section" style={{ background: 'transparent', padding: 0 }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>TÊN SẢN PHẨM & MÃ SKU</th>
              <th style={{ width: '30%' }}>QUY CÁCH & THUỘC TÍNH</th>
              <th style={{ width: '15%', textAlign: 'center' }}>TỒN KHO</th>
              <th style={{ width: '12%', textAlign: 'center' }}>TRẠNG THÁI</th>
              <th style={{ width: '8%', textAlign: 'center' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {danhSachLoc.length > 0 ? (
              danhSachLoc.map((prod) => {
                const productName = prod.variantId?.productId?.name || prod.name || 'Sản phẩm nội thất';
                const skuCode = prod.variantId?.sku || prod.sku || prod.id || 'N/A';
                const specsText = prod.specs || [prod.variantId?.color, prod.variantId?.size].filter(Boolean).join(' - ') || 'Chưa cập nhật';

                return (
                  <tr key={prod._id || prod.id}>
                    <td>
                      <strong style={{ color: '#1c1c1c', fontWeight: 600, fontSize: '13px' }}>{productName}</strong>
                      <br />
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                        {skuCode}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#57534e', fontSize: '13px', lineHeight: '1.4' }}>{specsText}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <strong style={{ fontSize: '14px', color: prod.quantity > 0 || prod.stock > 0 ? '#111827' : '#dc2626' }}>
                        {(prod.quantity !== undefined ? prod.quantity : prod.stock) !== null && (prod.quantity !== undefined ? prod.quantity : prod.stock) !== undefined ? Number(prod.quantity !== undefined ? prod.quantity : prod.stock).toLocaleString() : 'Chưa cập nhật'}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#78716c', marginLeft: '4px' }}>chiếc</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {(() => {
                        const currentStock = prod.quantity !== undefined ? prod.quantity : prod.stock;
                        const isNull = currentStock === null || currentStock === undefined;
                        const isOut = currentStock === 0;
                        const isLow = currentStock > 0 && currentStock <= 15;
                        return (
                          <span style={{
                            background: isNull ? '#f5f5f4' : isOut ? '#fef2f2' : isLow ? '#fffbeb' : '#f0fdf4',
                            color: isNull ? '#78716c' : isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            border: `1px solid ${isNull ? '#e7e5e4' : isOut ? '#fecaca' : isLow ? '#fde68a' : '#bbf7d0'}`,
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                          }}>
                            {isNull ? 'CHƯA CÓ DỮ LIỆU' : isOut ? 'HẾT HÀNG' : isLow ? 'SẮP HẾT' : 'ỔN ĐỊNH'}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleOpenDetail(prod)}
                        className="view-btn"
                        title="Xem chi tiết" 
                        style={{ background: '#fff', border: '1px solid #dcd6cd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#333', transition: 'all 0.2s' }}
                      >
                        <Eye size={13} /> Xem
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#8c857b' }}>Không tìm thấy SKU nào phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {/* MODAL XEM CHI TIẾT SKU */}
      {isOpenModal && selectedSku && (
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
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid #eae6df",
                paddingBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Info size={20} color="#2563eb" />
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: "#1a1a1a",
               
                  }}
                >
                  Chi Tiết Thông Tin SKU
                </h3>
              </div>
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

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>TÊN SẢN PHẨM</span>
                <strong style={{ fontSize: "16px", color: "#111827" }}>
                  {selectedSku.variantId?.productId?.name || selectedSku.name || "Sản phẩm nội thất"}
                </strong>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", display: "block", marginBottom: "2px" }}>MÃ SKU</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#2563eb" }}>
                    {selectedSku.variantId?.sku || selectedSku.sku || "Chưa có SKU"}
                  </span>
                </div>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", display: "block", marginBottom: "2px" }}>MÀU SẮC</span>
                  <span style={{ fontWeight: 600, color: "#374151" }}>
                    {selectedSku.variantId?.color || selectedSku.color || selectedSku.specs || "Chưa cập nhật"}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", display: "block", marginBottom: "2px" }}>SỐ LƯỢNG TỒN KHO</span>
                  <span style={{ fontWeight: 700, color: "#16a34a", fontSize: "15px" }}>
                    {(selectedSku.quantity !== undefined ? selectedSku.quantity : selectedSku.stock) !== null && (selectedSku.quantity !== undefined ? selectedSku.quantity : selectedSku.stock) !== undefined ? `${Number(selectedSku.quantity !== undefined ? selectedSku.quantity : selectedSku.stock).toLocaleString()} chiếc` : "Chưa cập nhật"}
                  </span>
                </div>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", display: "block", marginBottom: "2px" }}>NGƯỠNG CẢNH BÁO TỒN THẤP</span>
                  <span style={{ fontWeight: 600, color: "#d97706" }}>
                    {selectedSku.lowStockThreshold !== undefined && selectedSku.lowStockThreshold !== null ? `${selectedSku.lowStockThreshold} chiếc` : "Không thiết lập"}
                  </span>
                </div>
              </div>

              <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", display: "block", marginBottom: "2px" }}>QUY CÁCH & THUỘC TÍNH</span>
                <span style={{ fontWeight: 600, color: "#374151" }}>
                  {[selectedSku.variantId?.size, selectedSku.variantId?.material].filter(Boolean).join(' - ') || selectedSku.specs || "Chưa cập nhật"}
                </span>
              </div>

              <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={13} /> CẬP NHẬT LẦN CUỐI:
                </span>
                <span style={{ fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                  {selectedSku.updatedAt ? new Date(selectedSku.updatedAt).toLocaleString() : "Vừa mới đây"}
                </span>
              </div>

              <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#78716c" }}>TRẠNG THÁI HOẠT ĐỘNG</span>
                {selectedSku.isActive !== false && selectedSku.variantId?.isActive !== false && selectedSku.variantId?.productId?.isActive !== false ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a", fontWeight: "700", fontSize: "13px" }}>
                    <CheckCircle size={16} /> Đang hoạt động
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#dc2626", fontWeight: "700", fontSize: "13px" }}>
                    <XCircle size={16} /> Ngừng hoạt động
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginTop: "24px", textAlign: "right", borderTop: "1px solid #eae6df", paddingTop: "16px" }}>
              <button
                onClick={() => setIsOpenModal(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "#1c1c1c",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkuManagement;