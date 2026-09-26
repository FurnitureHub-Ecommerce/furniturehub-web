import React, { useEffect, useState } from 'react';
import { loadStorageVariants } from '../../services/storageData';
import { BarChart3, ShieldCheck } from 'lucide-react';

const InventoryStatistics = () => {
  const [inventory, setInventory] = useState(null);

  useEffect(() => {
    loadStorageVariants().then((variants) => setInventory(variants));
  }, []);

  const variants = inventory || [];
  const stockItems = variants.filter((variant) => variant.stock !== null);
  const totalStock = stockItems.reduce((total, variant) => total + variant.stock, 0);
  const locations = new Set(variants.map((variant) => variant.location).filter(Boolean));

  const storageMetrics = [
    { label: 'TỔNG SỐ SKU', value: inventory === null ? 'Đang tải...' : variants.length, sub: 'Đồng bộ từ API sản phẩm và biến thể' },
    { label: 'HÀNG TỒN KHO (TỔNG)', value: stockItems.length ? totalStock.toLocaleString() : 'Chưa cập nhật', sub: stockItems.length ? 'Tổng số lượng từ API variant' : 'API variant chưa trả về số lượng tồn' },
    { label: 'VỊ TRÍ LƯU TRỮ', value: locations.size || 'Chưa cập nhật', sub: locations.size ? 'Khu vực đang được sử dụng' : 'API variant chưa trả về vị trí lưu trữ' },
    { label: 'CẢNH BÁO TỒN THẤP', value: stockItems.length ? `${stockItems.filter((variant) => variant.stock <= 15).length} SKU` : 'Chưa cập nhật', sub: stockItems.length ? 'Dưới mức tồn kho tối thiểu' : 'Không thể tính khi API chưa có số lượng tồn' },
  ];

  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">THỐNG KÊ & TỔNG HỢP HỆ THỐNG</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>Thống Kê Nâng Cao & Tổng Hợp Tồn Kho</h2>
          <p>Phân tích xu hướng biến động, hiệu suất sử dụng không gian kho và các chỉ số vận hành quan trọng.</p>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="metrics-grid">
        {storageMetrics.map((item, idx) => (
          <div key={idx} className="metric-card">
            <h4>{item.label}</h4>
            <div className="metric-val">{item.value}</div>
            <p>{item.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <section className="sku-section" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BarChart3 size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0 }}>Hiệu Suất Lưu Trữ Theo Khu Vực</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                <span>Kho A</span>
                <span>Chưa cập nhật</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#eaeaea', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '0%', height: '100%', background: '#1c1c1c' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                <span>Kho B</span>
                <span>Chưa cập nhật</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#eaeaea', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '0%', height: '100%', background: '#555' }}></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sku-section" style={{ margin: 0, background: '#fcfbfa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldCheck size={20} color="#16a34a" />
            <h3 style={{ margin: 0 }}>Chỉ Số An Toàn</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#444' }}>
            <div style={{ padding: '12px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '6px' }}>
              <strong>Tỷ lệ thất thoát:</strong> Chưa có dữ liệu API
            </div>
            <div style={{ padding: '12px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '6px' }}>
              <strong>Thời gian xử lý đơn:</strong> Chưa có dữ liệu API
            </div>
            <div style={{ padding: '12px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '6px' }}>
              <strong>Độ chính xác kiểm kê:</strong> Chưa có dữ liệu API
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InventoryStatistics;