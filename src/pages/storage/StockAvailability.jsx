import React, { useState, useEffect } from 'react';
import { storageAPI } from '../../services/api.js';
import { PackageCheck, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const StockAvailability = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boLoc, setBoLoc] = useState('ALL');
  const [trangHienTai, setTrangHienTai] = useState(1);
  const soLuongMoiTrang = 8;

  useEffect(() => {
    const fetchStockAvailability = async () => {
      try {
        setLoading(true);
        const res = await storageAPI.getInventory();
        const data = res?.data?.inventories || res?.data?.data?.inventories || res?.data || [];
        
        const formatted = (Array.isArray(data) ? data : []).map(item => {
          const variant = item.variantId || item.variant || {};
          const product = variant.productId || item.product || {};
          return {
            id: variant.sku || variant._id || item._id,
            name: product.name || item.name || 'Sản phẩm nội thất',
            specs: [variant.color, variant.size, variant.material].filter(Boolean).join(' — ') || 'Tiêu chuẩn',
            stock: item.quantity ?? variant.availableStock ?? 0
          };
        });
        setSkuProducts(formatted);
      } catch (error) {
        console.error('Lỗi tải dữ liệu sẵn có:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStockAvailability();
  }, []);

  const danhSachLoc = skuProducts.filter((item) => {
    if (boLoc === 'AVAILABLE') return item.stock > 0;
    if (boLoc === 'OUT') return item.stock === 0;
    return true;
  });

  const tongSoTrang = Math.ceil(danhSachLoc.length / soLuongMoiTrang) || 1;
  const chiSoBatDau = (trangHienTai - 1) * soLuongMoiTrang;
  const danhSachPhanTrang = danhSachLoc.slice(chiSoBatDau, chiSoBatDau + soLuongMoiTrang);

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: "60px" }}>
      <header className="dash-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>TÌNH TRẠNG SẴN CÓ THỜI GIAN THỰC</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600, margin: '4px 0 8px 0' }}>
            Kiểm Tra Tình Trạng Sẵn Có Của Hàng Hóa
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Theo dõi nhanh số lượng hàng có thể xuất bán hoặc phân bổ ngay tại các sản phẩm.</p>
        </div>
      </header>

      <section className="sku-section" style={{ background: 'transparent', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={24} color="#1c1c1c" />
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, color: '#1c1c1c' }}>Ma Trận Hàng Sẵn Sàng</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={`filter-btn ${boLoc === 'ALL' ? 'active' : ''}`} onClick={() => { setBoLoc('ALL'); setTrangHienTai(1); }} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: boLoc === 'ALL' ? '#1c1c1c' : '#fff', color: boLoc === 'ALL' ? '#fff' : '#666', border: '1px solid #e2ded8', fontWeight: 600 }}>Tất Cả</button>
            <button className={`filter-btn ${boLoc === 'AVAILABLE' ? 'active' : ''}`} onClick={() => { setBoLoc('AVAILABLE'); setTrangHienTai(1); }} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: boLoc === 'AVAILABLE' ? '#1c1c1c' : '#fff', color: boLoc === 'AVAILABLE' ? '#fff' : '#666', border: '1px solid #e2ded8', fontWeight: 600 }}>Còn Hàng</button>
            <button className={`filter-btn ${boLoc === 'OUT' ? 'active' : ''}`} onClick={() => { setBoLoc('OUT'); setTrangHienTai(1); }} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: boLoc === 'OUT' ? '#1c1c1c' : '#fff', color: boLoc === 'OUT' ? '#fff' : '#666', border: '1px solid #e2ded8', fontWeight: 600 }}>Hết Hàng</button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#888' }}>Đang tải dữ liệu từ API Backend...</div>
        ) : (
          <div>
            <table className="storage-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eae6df' }}>
              <thead>
                <tr style={{ background: '#faf8f5', color: '#78716c', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px' }}>MÃ SKU & TÊN SẢN PHẨM</th>
                  <th style={{ padding: '14px 16px' }}>QUY CÁCH</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>SỐ LƯỢNG KHẢ DỤNG</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {danhSachPhanTrang.length > 0 ? (
                  danhSachPhanTrang.map((prod, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f2efeb' }}>
                      <td style={{ padding: '16px' }}>
                        <strong style={{ color: '#1c1c1c', fontWeight: 600 }}>{prod.name}</strong>
                        <br />
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2563eb' }}>{prod.id}</span>
                      </td>
                      <td style={{ padding: '16px' }}>{prod.specs}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <strong style={{ color: prod.stock > 0 ? '#16a34a' : '#dc2626' }}>{prod.stock.toLocaleString()}</strong> chiếc
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {prod.stock > 0 ? (
                          <span style={{ color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '11px' }}>Sẵn Sàng Xuất Kho</span>
                        ) : (
                          <span style={{ color: '#dc2626', background: '#fef2f2', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '11px' }}>Hết Hàng</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#8c857b' }}>Không tìm thấy sản phẩm phù hợp.</td></tr>
                )}
              </tbody>
            </table>

            {tongSoTrang > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                <button onClick={() => setTrangHienTai(p => Math.max(p - 1, 1))} disabled={trangHienTai === 1} style={{ padding: '6px 12px', cursor: 'pointer' }}>Trước</button>
                <span>Trang {trangHienTai} / {tongSoTrang}</span>
                <button onClick={() => setTrangHienTai(p => Math.min(p + 1, tongSoTrang))} disabled={trangHienTai === tongSoTrang} style={{ padding: '6px 12px', cursor: 'pointer' }}>Sau</button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default StockAvailability;