import React, { useState } from 'react';
import { skuProducts } from '../../data/storageData';
import { PackageCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const StockAvailability = () => {
  const [boLoc, setBoLoc] = useState('ALL');

  const danhSachLoc = skuProducts.filter((item) => {
    if (boLoc === 'AVAILABLE') return item.stock > 0;
    if (boLoc === 'OUT') return item.stock === 0;
    return true;
  });

  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">TÌNH TRẠNG SẴN CÓ THỜI GIAN THỰC</span>
          <h2>Kiểm Tra Tình Trạng Sẵn Có Của Hàng Hóa</h2>
          <p>Theo dõi nhanh số lượng hàng có thể xuất bán hoặc phân bổ ngay tại các vị trí trong kho.</p>
        </div>
        <div className="actions">
          <button 
            className={`btn-secondary ${boLoc === 'ALL' ? 'active' : ''}`}
            onClick={() => setBoLoc('ALL')}
          >
            Tất Cả
          </button>
          <button 
            className={`btn-secondary ${boLoc === 'AVAILABLE' ? 'active' : ''}`}
            onClick={() => setBoLoc('AVAILABLE')}
          >
            Còn Hàng Sẵn Sàng
          </button>
          <button 
            className={`btn-secondary ${boLoc === 'OUT' ? 'active' : ''}`}
            onClick={() => setBoLoc('OUT')}
          >
            Hết Hàng
          </button>
        </div>
      </header>

      {/* Bảng hiển thị tình trạng sẵn có */}
      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <PackageCheck size={20} color="#1c1c1c" />
          <h3 style={{ margin: 0 }}>Ma Trận Hàng Sẵn Sàng</h3>
        </div>

        <table className="storage-table">
          <thead>
            <tr>
              <th>MÃ SKU & TÊN SẢN PHẨM</th>
              <th>QUY CÁCH</th>
              <th>VỊ TRÍ LƯU TRỮ</th>
              <th>SỐ LƯỢNG KHẢ DỤNG</th>
              <th>TRẠNG THÁI GIAO DỊCH</th>
            </tr>
          </thead>
          <tbody>
            {danhSachLoc.map((prod) => (
              <tr key={prod.id}>
                <td>
                  <strong>{prod.name}</strong>
                  <br />
                  <small style={{ color: '#888' }}>{prod.id}</small>
                </td>
                <td>{prod.specs}</td>
                <td><span className="badge">{prod.location}</span></td>
                <td><strong>{prod.stock}</strong> đơn vị</td>
                <td>
                  {prod.stock > 0 ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: '600', fontSize: '13px' }}>
                      <CheckCircle2 size={16} /> Sẵn Sàng Xuất Kho
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: '600', fontSize: '13px' }}>
                      <AlertCircle size={16} /> Chờ Nhập Bổ Sung
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default StockAvailability;