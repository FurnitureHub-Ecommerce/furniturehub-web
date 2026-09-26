import React, { useState, useEffect } from 'react';
import { loadStorageVariants } from '../../services/storageData';
import { ShieldAlert, ArrowUpRight } from 'lucide-react';

const LowStockAlerts = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const nguongCanhBao = 15;

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setSkuProducts(await loadStorageVariants());
      } catch (error) {
        console.error('Lỗi tải dữ liệu cảnh báo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const danhSachCanhBao = skuProducts.filter((item) => item.stock !== null && item.stock <= nguongCanhBao);

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '40px', textAlign: 'center' }}>Đang quét dữ liệu tồn kho...</div>;
  }

  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">GIÁM SÁT TỒN KHO NGUY CƠ</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>Cảnh Báo Tồn Thấp & Hết Hàng</h2>
          <p>Danh sách các mã SKU cần được bổ sung gấp để đảm bảo chuỗi cung ứng hoạt động thông suốt.</p>
        </div>
        <div className="actions">
          <button className="btn-primary">Tạo Lệnh Nhập Hàng Bổ Sung</button>
        </div>
      </header>

      {/* Thẻ thống kê */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="metric-card" style={{ borderLeft: '4px solid #dc2626' }}>
          <h4>SẢN PHẨM DƯỚI NGƯỠNG AN TOÀN</h4>
          <div className="metric-val" style={{ color: '#dc2626' }}>{danhSachCanhBao.length} SKU</div>
          <p>Cần lên kế hoạch đặt hàng với nhà cung cấp ngay lập tức.</p>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h4>TRẠNG THÁI GIÁM SÁT</h4>
          <div className="metric-val" style={{ color: '#f59e0b' }}>Hoạt Động</div>
          <p>Tự động cập nhật thời gian thực từ hệ thống kho.</p>
        </div>
      </div>

      {/* Bảng cảnh báo */}
      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ShieldAlert size={20} color="#dc2626" />
          <h3 style={{ margin: 0 }}>Danh Sách SKU Cần Chú Ý Đặc Biệt</h3>
        </div>

        <table className="storage-table">
          <thead>
            <tr>
              <th>MÃ SKU & TÊN SẢN PHẨM</th>
              <th>QUY CÁCH</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {danhSachCanhBao.length > 0 ? (
              danhSachCanhBao.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <strong>{prod.name}</strong>
                    <br />
                    <small style={{ color: '#888' }}>{prod.id}</small>
                  </td>
                  <td>{prod.specs}</td>
                  <td>
                    <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                      {prod.stock === 0 ? 'HẾT HÀNG' : 'SẮP HẾT'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Nhập Hàng <ArrowUpRight size={14} style={{ verticalAlign: 'middle' }} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  Tuyệt vời! Không có sản phẩm nào nằm dưới ngưỡng tồn kho an toàn.
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