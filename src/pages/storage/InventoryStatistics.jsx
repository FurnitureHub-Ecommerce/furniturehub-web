import React from 'react';
import { storageMetrics } from '../../data/storageData';
import { BarChart3, ShieldCheck } from 'lucide-react';

const InventoryStatistics = () => {
  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">THỐNG KÊ & TỔNG HỢP HỆ THỐNG</span>
          <h2>Thống Kê Nâng Cao & Tổng Hợp Tồn Kho</h2>
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
                <span>Kho A (Gốm sứ & Đồ trang trí)</span>
                <span>82% Sức Chứa</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#eaeaea', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '82%', height: '100%', background: '#1c1c1c' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                <span>Kho B (Vải lanh & Phụ kiện mềm)</span>
                <span>64% Sức Chứa</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#eaeaea', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '64%', height: '100%', background: '#555' }}></div>
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
              <strong>Tỷ lệ thất thoát:</strong> &lt; 0.05% (Đạt chuẩn)
            </div>
            <div style={{ padding: '12px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '6px' }}>
              <strong>Thời gian xử lý đơn:</strong> Trung bình 12 phút/lệnh
            </div>
            <div style={{ padding: '12px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '6px' }}>
              <strong>Độ chính xác kiểm kê:</strong> 99.8%
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InventoryStatistics;