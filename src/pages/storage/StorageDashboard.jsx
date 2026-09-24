import React from 'react';
import { storageMetrics, skuProducts } from '../../data/storageData';
import { Layers } from 'lucide-react';

const StorageDashboard = () => {
  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">QUẢN LÝ DANH MỤC & HỆ THỐNG KHO</span>
          <h2>Quản Lý SKU, Biến Thể & Tồn Kho Thực Tế</h2>
          <p>Theo dõi số lượng thực tế, tình trạng lưu trữ theo từng khu vực kho và thông số bảo quản thời gian thực.</p>
        </div>
        <div className="actions">
          <button className="btn-secondary">Xuất Excel Kho</button>
          <button className="btn-primary">+ Tạo Mã Biến Thể Mới</button>
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

      {/* SKU Table */}
      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0 }}>Danh Mục SKU Master & Hiện Trạng Lưu Trữ</h3>
          </div>
          <span style={{ fontSize: '13px', color: '#666' }}>Cập nhật tự động từ hệ thống</span>
        </div>

        <table className="storage-table">
          <thead>
            <tr>
              <th>MÃ SKU & SẢN PHẨM</th>
              <th>QUY CÁCH & BIẾN THỂ</th>
              <th>VỊ TRÍ LƯU TRỮ</th>
              <th>SỐ LƯỢNG TỒN</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {skuProducts.map((prod) => (
              <tr key={prod.id}>
                <td>
                  <strong>{prod.name}</strong>
                  <br />
                  <small style={{ color: '#888' }}>{prod.id}</small>
                </td>
                <td>{prod.specs}</td>
                <td><span className="badge">{prod.location}</span></td>
                <td><strong>{prod.stock}</strong> chiếc</td>
                <td>
                  <span style={{
                    background: prod.stock === 0 ? '#fef2f2' : prod.stock <= 15 ? '#fffbeb' : '#f0fdf4',
                    color: prod.stock === 0 ? '#dc2626' : prod.stock <= 15 ? '#d97706' : '#16a34a',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {prod.stock === 0 ? 'HẾT HÀNG' : prod.stock <= 15 ? 'SẮP HẾT' : 'ỔN ĐỊNH'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default StorageDashboard;