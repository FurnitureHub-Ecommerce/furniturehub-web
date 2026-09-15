import React from 'react';
import { storageMetrics, skuProducts } from '../../data/storageData';

const StorageDashboard = () => {
  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">CATALOG REGISTRY & STOCK MATRIX</span>
          <h2>Quản Lý SKU, Biến Thể & Tồn Kho Thực Tế</h2>
          <p>Theo dõi số lượng thực tế, tình trạng lưu trữ theo từng kho/vịnh bay và thông số bảo quản.</p>
        </div>
        <div className="actions">
          <button className="btn-secondary">Xuất Excel ERP</button>
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
        <h3>Danh Mục SKU Master & Hiện Trạng Lưu Trữ</h3>
        <table className="storage-table">
          <thead>
            <tr>
              <th>MÃ SKU & TÁC PHẨM</th>
              <th>QUY CÁCH & BIẾN THỂ</th>
              <th>VỊ TRÍ</th>
              <th>TỔNG</th>
            </tr>
          </thead>
          <tbody>
            {skuProducts.map((prod) => (
              <tr key={prod.id}>
                <td>
                  <strong>{prod.name}</strong>
                  <br />
                  <small>{prod.id}</small>
                </td>
                <td>{prod.specs}</td>
                <td><span className="badge">{prod.location}</span></td>
                <td><strong>{prod.stock}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default StorageDashboard;