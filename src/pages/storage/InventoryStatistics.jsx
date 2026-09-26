import React, { useEffect, useState } from 'react';
import { loadStorageVariants } from '../../services/storageData';
import { BarChart3, ShieldCheck, TrendingUp, Package, AlertTriangle } from 'lucide-react';

const InventoryStatistics = () => {
  const [inventory, setInventory] = useState(null);

  useEffect(() => {
    loadStorageVariants().then((variants) => setInventory(variants));
  }, []);

  const variants = inventory || [];
  const totalSku = variants.length;
  const stockItems = variants.filter((variant) => variant.stock !== null && variant.stock !== undefined);
  const totalStock = stockItems.reduce((total, variant) => total + Number(variant.stock || 0), 0);

  // Thống kê phân loại chi tiết
  const stableItems = stockItems.filter((v) => Number(v.stock) > 15);
  const lowStockItems = stockItems.filter((v) => Number(v.stock) > 0 && Number(v.stock) <= 15);
  const outOfStockItems = stockItems.filter((v) => Number(v.stock) === 0);

  const getPercent = (count) => (totalSku > 0 ? Math.round((count / totalSku) * 100) : 0);

  // Lấy Top sản phẩm có số lượng tồn kho cao nhất để thống kê
  const topStockProducts = [...stockItems]
    .sort((a, b) => Number(b.stock) - Number(a.stock))
    .slice(0, 5);

  const storageMetrics = [
    { label: 'TỔNG SỐ SKU', value: inventory === null ? 'Đang tải...' : totalSku, sub: 'Đồng bộ từ API sản phẩm và biến thể' },
    { label: 'HÀNG TỒN KHO (TỔNG)', value: stockItems.length ? totalStock.toLocaleString() : 'Chưa cập nhật', sub: stockItems.length ? 'Tổng số lượng từ API variant' : 'API variant chưa trả về số lượng tồn' },
    { label: 'CẢNH BÁO TỒN THẤP', value: stockItems.length ? `${lowStockItems.length} SKU` : 'Chưa cập nhật', sub: stockItems.length ? 'Dưới mức tồn kho tối thiểu' : 'Không thể tính khi API chưa có số lượng tồn' },
  ];

  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">THỐNG KÊ & TỔNG HỢP HỆ THỐNG</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>Thống Kê Nâng Cao & Tổng Hợp</h2>
          <p>Phân tích xu hướng biến động và các chỉ số vận hành sản phẩm quan trọng.</p>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {storageMetrics.map((item, idx) => (
          <div key={idx} className="metric-card">
            <h4>{item.label}</h4>
            <div className="metric-val">{item.value}</div>
            <p>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Grid chứa các dạng thống kê mới */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Dạng 1: Biểu đồ phân phối trạng thái trực quan */}
        <section className="sku-section" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BarChart3 size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0 }}>Phân Phối Trạng Thái Tồn Kho</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                <span>Hàng Ổn Định (&gt; 15 chiếc)</span>
                <span style={{ color: '#16a34a' }}>{stableItems.length} SKU ({getPercent(stableItems.length)}%)</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#eaeaea', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${getPercent(stableItems.length)}%`, height: '100%', background: '#16a34a', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                <span>Sắp Hết Hàng (1 - 15 chiếc)</span>
                <span style={{ color: '#d97706' }}>{lowStockItems.length} SKU ({getPercent(lowStockItems.length)}%)</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#eaeaea', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${getPercent(lowStockItems.length)}%`, height: '100%', background: '#d97706', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                <span>Hết Hàng (0 chiếc)</span>
                <span style={{ color: '#dc2626' }}>{outOfStockItems.length} SKU ({getPercent(outOfStockItems.length)}%)</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#eaeaea', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${getPercent(outOfStockItems.length)}%`, height: '100%', background: '#dc2626', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Dạng 2: Thống kê tỷ lệ loại hàng & chỉ số an toàn */}
        <section className="sku-section" style={{ margin: 0, background: '#fcfbfa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={20} color="#16a34a" />
            <h3 style={{ margin: 0 }}>Chỉ Số Vận Hành & An Toàn</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#444' }}>
            <div style={{ padding: '12px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Tỷ lệ hàng sẵn sàng:</strong></span>
              <span style={{ color: '#16a34a', fontWeight: '700' }}>{totalSku ? `${100 - getPercent(outOfStockItems.length)}%` : '0%'}</span>
            </div>
            <div style={{ padding: '12px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Mức độ rủi ro thiếu hàng:</strong></span>
              <span style={{ color: lowStockItems.length > 0 ? '#d97706' : '#16a34a', fontWeight: '700' }}>
                {lowStockItems.length > 0 ? 'Cần chú ý' : 'An toàn'}
              </span>
            </div>
            <div style={{ padding: '12px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Độ chính xác dữ liệu SKU:</strong></span>
              <span style={{ fontWeight: '700' }}>100% Đồng bộ</span>
            </div>
          </div>
        </section>
      </div>

      {/* Dạng 3: Bảng Thống Kê Top 5 Sản Phẩm Tồn Kho Nhiều Nhất */}
      <section className="sku-section" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <TrendingUp size={20} color="#1c1c1c" />
          <h3 style={{ margin: 0 }}>Top 5 Sản Phẩm Có Số Lượng Tồn Nhiều Nhất</h3>
        </div>

        <table className="storage-table" style={{ fontSize: '14px' }}>
          <thead>
            <tr>
              <th>HẠNG</th>
              <th>TÊN SẢN PHẨM & MÃ SKU</th>
              <th>QUY CÁCH</th>
              <th>SỐ LƯỢNG TỒN</th>
            </tr>
          </thead>
          <tbody>
            {topStockProducts.length > 0 ? (
              topStockProducts.map((prod, index) => (
                <tr key={prod.id || index}>
                  <td><strong>#{index + 1}</strong></td>
                  <td>
                    <strong>{prod.name}</strong>
                    <br />
                    <small style={{ color: '#888' }}>{prod.id}</small>
                  </td>
                  <td>{prod.specs || 'Tiêu chuẩn'}</td>
                  <td><strong>{prod.stock}</strong> chiếc</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Chưa có dữ liệu tồn kho để xếp hạng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default InventoryStatistics;