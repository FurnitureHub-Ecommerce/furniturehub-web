import React, { useState } from 'react';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';

const InventoryTestingIntegration = () => {
  const [kiemThu] = useState([
    { id: 1, name: 'Đồng bộ API danh mục SKU & Biến thể thời gian thực', status: 'Đã Hoàn Thành', role: 'Storage - BE' },
    { id: 2, name: 'Kiểm thử luồng trừ/hoàn kho tự động khi xác nhận đơn hàng', status: 'Đang Thực Hiện', role: 'Storage - BE/FE' },
    { id: 3, name: 'Kiểm tra tính năng tạo phiếu nhập/xuất kho', status: 'Đã Hoàn Thành', role: 'Storage Giao Diện' },
    { id: 4, name: 'Xác thực cơ chế cảnh báo tồn kho thấp', status: 'Đã Hoàn Thành', role: 'Storage Giao Diện' },
  ]);

  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">KIỂM THỬ HỆ THỐNG & TÍCH HỢP</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>Kiểm Thử Luồng Kho & Tích Hợp Hệ Thống</h2>
          <p>Kiểm tra trạng thái kết nối API, đồng bộ dữ liệu giữa các phân hệ và vận hành toàn trình.</p>
        </div>
      </header>

      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <PlayCircle size={20} color="#1c1c1c" />
          <h3 style={{ margin: 0 }}>Danh Sách Kiểm Thử Kịch Bản Kho</h3>
        </div>

        <table className="storage-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>HẠNG MỤC KIỂM THỬ TÍCH HỢP</th>
              <th>PHẦN QUẢN LÝ</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {kiemThu.map((t) => (
              <tr key={t.id}>
                <td><strong>#TC-0{t.id}</strong></td>
                <td>{t.name}</td>
                <td><span className="badge">{t.role}</span></td>
                <td>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: t.status === 'Đã Hoàn Thành' ? '#16a34a' : '#d97706',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}>
                    {t.status === 'Đã Hoàn Thành' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    {t.status}
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

export default InventoryTestingIntegration;