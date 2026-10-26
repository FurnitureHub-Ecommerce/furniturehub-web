import React, { useState, useEffect } from 'react';
import { storageAPI } from '../../services/api.js';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

const LowStockAlerts = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        setLoading(true);
        // Gọi chuẩn endpoint GET /api/inventory/low-stock từ Backend
        const res = await storageAPI.getLowStock();
        const data = res?.data?.inventories || res?.data?.data?.inventories || res?.data || [];
        
        const formatted = (Array.isArray(data) ? data : []).map(item => {
          const variant = item.variantId || item.variant || {};
          const product = variant.productId || item.product || {};
          return {
            ...item,
            id: variant.sku || variant._id || item._id,
            name: product.name || item.name || 'Sản phẩm nội thất',
            sku: variant.sku || 'N/A',
            specs: [variant.color, variant.size, variant.material].filter(Boolean).join(' - ') || 'Tiêu chuẩn',
            quantity: item.quantity ?? variant.availableStock ?? 0
          };
        });
        setSkuProducts(formatted);
      } catch (error) {
        console.error('Lỗi tải dữ liệu cảnh báo tồn thấp từ API:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '50px', textAlign: 'center', color: '#888' }}>Đang quét dữ liệu cảnh báo từ Backend...</div>;
  }

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '60px' }}>
      <header className="dash-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>GIÁM SÁT TỒN KHO NGUY CƠ</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600, margin: '4px 0 8px 0' }}>
            Cảnh Báo Tồn Thấp & Hết Hàng
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Danh sách các mã SKU cần được bổ sung gấp từ Backend.</p>
        </div>
      </header>

      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '28px' }}>
        <div className="metric-card" style={{ borderLeft: '4px solid #dc2626', background: '#fff', padding: '24px', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#78716c', margin: '0 0 8px 0' }}>SẢN PHẨM DƯỚI NGƯỠNG AN TOÀN</h4>
          <div className="metric-val" style={{ fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>{skuProducts.length} SKU</div>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #16a34a', background: '#fff', padding: '24px', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#78716c', margin: '0 0 8px 0' }}>TRẠNG THÁI GIÁM SÁT</h4>
          <div className="metric-val" style={{ fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>Đang kết nối API</div>
        </div>
      </div>

      <section className="sku-section" style={{ background: 'transparent', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ShieldAlert size={18} color="#dc2626" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Danh Sách SKU Cần Chú Ý Đặc Biệt</h3>
        </div>

        <table className="storage-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eae6df' }}>
          <thead>
            <tr style={{ background: '#faf8f5', color: '#78716c', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>
              <th style={{ padding: '14px 16px' }}>TÊN SẢN PHẨM & MÃ SKU</th>
              <th style={{ padding: '14px 16px' }}>QUY CÁCH</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>SỐ LƯỢNG TỒN</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {skuProducts.length > 0 ? (
              skuProducts.map((prod, idx) => {
                const isOut = prod.quantity === 0;
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f2efeb' }}>
                    <td style={{ padding: '16px' }}>
                      <strong style={{ color: '#1c1c1c', fontWeight: 600 }}>{prod.name}</strong>
                      <br />
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2563eb' }}>{prod.sku}</span>
                    </td>
                    <td style={{ padding: '16px' }}>{prod.specs}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <strong style={{ color: isOut ? '#dc2626' : '#d97706' }}>{prod.quantity}</strong> chiếc
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        background: isOut ? '#fef2f2' : '#fffbeb',
                        color: isOut ? '#dc2626' : '#d97706',
                        padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '11px'
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