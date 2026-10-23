import React, { useState, useEffect } from 'react';
import { loadStorageVariants } from '../../services/storageData';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

const LowStockAlerts = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const nguongCanhBao = 15;

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const data = await loadStorageVariants();
        setSkuProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi tải dữ liệu cảnh báo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const danhSachCanhBao = skuProducts.filter((item) => {
    const stockVal = item.quantity !== undefined ? item.quantity : item.stock;
    return stockVal !== null && stockVal !== undefined && stockVal <= nguongCanhBao;
  });

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '50px', textAlign: 'center', color: '#888' }}>Đang quét dữ liệu tồn kho, vui lòng đợi trong giây lát...</div>;
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
        .metric-card {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #eae6df;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
      `}</style>

      {/* Header trang */}
      <header className="dash-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>GIÁM SÁT TỒN KHO NGUY CƠ</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600, margin: '4px 0 8px 0' }}>
            Cảnh Báo Tồn Thấp & Hết Hàng
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Danh sách các mã SKU cần được bổ sung gấp để đảm bảo chuỗi cung ứng hoạt động thông suốt.</p>
        </div>
      </header>

      {/* Thẻ thống kê */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '28px' }}>
        <div className="metric-card" style={{ borderLeft: '4px solid #dc2626' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#78716c', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>SẢN PHẨM DƯỚI NGƯỠNG AN TOÀN</h4>
          <div className="metric-val" style={{ fontSize: '2rem', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>{danhSachCanhBao.length} SKU</div>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Cần lên kế hoạch đặt hàng với nhà cung cấp ngay lập tức.</p>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #16a34a' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#78716c', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>TRẠNG THÁI GIÁM SÁT</h4>
          <div className="metric-val" style={{ fontSize: '2rem', fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>Hoạt Động</div>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Tự động đồng bộ thời gian thực từ dữ liệu.</p>
        </div>
      </div>

      {/* Bảng danh sách cảnh báo */}
      <section className="sku-section" style={{ background: 'transparent', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ShieldAlert size={18} color="#dc2626" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1c1c1c' }}>Danh Sách SKU Cần Chú Ý Đặc Biệt</h3>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>TÊN SẢN PHẨM & MÃ SKU</th>
              <th style={{ width: '30%' }}>QUY CÁCH</th>
              <th style={{ width: '15%', textAlign: 'center' }}>SỐ LƯỢNG TỒN</th>
              <th style={{ width: '15%', textAlign: 'center' }}>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {danhSachCanhBao.length > 0 ? (
              danhSachCanhBao.map((prod) => {
                const productName = prod.variantId?.productId?.name || prod.name || 'Sản phẩm nội thất';
                const skuCode = prod.variantId?.sku || prod.sku || 'Chưa có SKU';
                const specsText = prod.specs || [prod.variantId?.color, prod.variantId?.size].filter(Boolean).join(' - ') || 'Chưa cập nhật';
                const currentStock = prod.quantity !== undefined ? prod.quantity : prod.stock;
                const isOut = currentStock === 0;

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
                      <strong style={{ fontSize: '14px', color: isOut ? '#dc2626' : '#d97706' }}>
                        {currentStock !== null && currentStock !== undefined ? Number(currentStock).toLocaleString() : 0}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#78716c', marginLeft: '4px' }}>chiếc</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        background: isOut ? '#fef2f2' : '#fffbeb',
                        color: isOut ? '#dc2626' : '#d97706',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        border: `1px solid ${isOut ? '#fecaca' : '#fde68a'}`,
                        display: 'inline-block',
                        whiteSpace: 'nowrap'
                      }}>
                        {isOut ? 'HẾT HÀNG' : 'SẮP HẾT'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '50px', color: '#16a34a', fontWeight: 600 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={32} color="#16a34a" />
                    <span>Tuyệt vời! Không có sản phẩm nào nằm dưới ngưỡng tồn kho an toàn.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default LowStockAlerts;