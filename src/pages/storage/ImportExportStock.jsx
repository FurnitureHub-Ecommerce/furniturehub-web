import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, FileText, Plus } from 'lucide-react';

const ImportExportStock = () => {
  const [tabHienTai, setTabHienTai] = useState('import');

  const chungTu = {
    import: [
      { code: 'IMP-9021', date: '2026-06-04 10:30', supplier: 'Atelier Ceramics Ltd.', items: 'LUMORA Signature Vase (x50)', status: 'Hoàn Thành' },
      { code: 'IMP-9022', date: '2026-06-03 14:15', supplier: 'Natural Living Co.', items: 'Minimalist Ceramic Plate (x30)', status: 'Đang Kiểm Đếm' }
    ],
    export: [
      { code: 'EXP-4011', date: '2026-06-04 11:00', recipient: 'Chi nhánh Quận 1 - Showroom', items: 'Lumina Aroma Diffuser (x10)', status: 'Đã Xuất Kho' },
      { code: 'EXP-4012', date: '2026-06-02 09:20', recipient: 'Khách hàng VIP (Đơn #881)', items: 'Linen Table Runner (x2)', status: 'Đang Vận Chuyển' }
    ]
  };

  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">QUẢN LÝ DÒNG CHẢY HÀNG HÓA</span>
          <h2>Quản Lý Nhập Kho & Xuất Kho</h2>
          <p>Theo dõi các chứng từ, biên bản giao nhận và lịch sử dòng chảy hàng hóa ra vào hệ thống kho.</p>
        </div>
        <div className="actions">
          <button className="btn-primary">
            <Plus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Tạo Phiếu {tabHienTai === 'import' ? 'Nhập' : 'Xuất'} Kho Mới
          </button>
        </div>
      </header>

      {/* Tabs chuyển đổi Nhập / Xuất */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setTabHienTai('import')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: tabHienTai === 'import' ? '1px solid #1c1c1c' : '1px solid #eaeaea',
            background: tabHienTai === 'import' ? '#1c1c1c' : '#fff',
            color: tabHienTai === 'import' ? '#fff' : '#333',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowDownLeft size={16} /> Phiếu Nhập Kho
        </button>
        <button
          onClick={() => setTabHienTai('export')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: tabHienTai === 'export' ? '1px solid #1c1c1c' : '1px solid #eaeaea',
            background: tabHienTai === 'export' ? '#1c1c1c' : '#fff',
            color: tabHienTai === 'export' ? '#fff' : '#333',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowUpRight size={16} /> Phiếu Xuất Kho
        </button>
      </div>

      {/* Bảng danh sách chứng từ */}
      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText size={20} color="#1c1c1c" />
          <h3 style={{ margin: 0 }}>Danh Sách Chứng Từ {tabHienTai === 'import' ? 'Nhập Kho' : 'Xuất Kho'}</h3>
        </div>

        <table className="storage-table">
          <thead>
            <tr>
              <th>MÃ CHỨNG TỪ</th>
              <th>THỜI GIAN</th>
              <th>{tabHienTai === 'import' ? 'NHÀ CUNG CẤP' : 'ĐƠN VỊ NHẬN / KHÁCH HÀNG'}</th>
              <th>CHI TIẾT HÀNG HÓA</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {chungTu[tabHienTai].map((tx, idx) => (
              <tr key={idx}>
                <td><strong>{tx.code}</strong></td>
                <td>{tx.date}</td>
                <td>{tx.supplier || tx.recipient}</td>
                <td>{tx.items}</td>
                <td>
                  <span className="badge" style={{ background: '#f0ede6', fontWeight: '600' }}>
                    {tx.status}
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

export default ImportExportStock;