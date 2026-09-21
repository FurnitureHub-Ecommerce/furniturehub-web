import React from 'react';
import { History } from 'lucide-react';

const InventoryHistory = () => {
  const nhatKy = [];

  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">NHẬT KÝ KIỂM SOÁT KHO</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>Lịch Sử Biến Động Kho</h2>
          <p>Nhật ký chi tiết các giao dịch nhập, xuất và điều chỉnh số lượng của từng mã SKU.</p>
        </div>
      </header>

      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <History size={20} color="#1c1c1c" />
          <h3 style={{ margin: 0 }}>Nhật Ký Hoạt Động Kho Hàng</h3>
        </div>

        <table className="storage-table">
          <thead>
            <tr>
              <th>MÃ GIAO DỊCH</th>
              <th>THỜI GIAN</th>
              <th>MÃ SKU</th>
              <th>LOẠI BIẾN ĐỘNG</th>
              <th>SỐ LƯỢNG THAY ĐỔI</th>
              <th>NHÂN SỰ THỰC HIỆN</th>
              <th>GHI CHÚ</th>
            </tr>
          </thead>
          <tbody>
            {nhatKy.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Backend chưa cung cấp API lịch sử biến động kho.</td></tr>
            ) : nhatKy.map((log) => (
              <tr key={log.id}>
                <td><strong>{log.id}</strong></td>
                <td>{log.time}</td>
                <td><span className="badge">{log.sku}</span></td>
                <td>
                  <span style={{ fontWeight: '600', color: log.type === 'Nhập Kho' ? '#16a34a' : log.type === 'Xuất Kho' ? '#2563eb' : '#dc2626' }}>
                    {log.type}
                  </span>
                </td>
                <td>
                  <strong style={{ color: log.change.startsWith('+') ? '#16a34a' : '#dc2626' }}>
                    {log.change}
                  </strong>
                </td>
                <td>{log.staff}</td>
                <td><small style={{ color: '#666' }}>{log.note}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default InventoryHistory;