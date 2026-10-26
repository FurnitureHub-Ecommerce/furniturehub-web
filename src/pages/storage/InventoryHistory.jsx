import React, { useState, useEffect } from 'react';
import { storageAPI } from '../../services/api.js';
import { History, ArrowDownLeft, ArrowUpRight, Layers } from 'lucide-react';

const InventoryHistory = () => {
  const [nhatKy, setNhatKy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boLocLoai, setBoLocLoai] = useState('ALL');
  const [boLocThoiGian, setBoLocThoiGian] = useState('ALL');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Gọi chuẩn endpoint GET /api/inventory/transactions từ Backend
        const res = await storageAPI.getInventoryTransactions();
        const data = res?.data?.transactions || res?.data?.data || res?.data || [];

        const formatted = (Array.isArray(data) ? data : []).map((item, index) => {
          const typeStr = String(item.type || '').toUpperCase();
          const isImport = typeStr.includes('IMPORT') || typeStr.includes('NHẬP');
          const variant = item.variantId || {};
          const product = variant.productId || {};

          let staffName = 'Hệ thống';
          if (item.createdBy && typeof item.createdBy === 'object') {
            staffName = item.createdBy.fullName || item.createdBy.name || 'Nhân sự kho';
          }

          return {
            rawDate: item.createdAt || new Date(),
            time: item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Hôm nay',
            sku: variant.sku || `SKU-${index + 1}`,
            productName: product.name || item.productName || 'Sản phẩm nội thất',
            type: isImport ? 'Nhập Kho' : 'Xuất Kho',
            typeKey: isImport ? 'IMPORT' : 'EXPORT',
            change: `${isImport ? '+' : '-'}${item.quantity || 0}`,
            staff: staffName,
            note: item.note || 'Giao dịch từ Backend',
          };
        });

        setNhatKy(formatted);
      } catch (error) {
        console.error('Lỗi tải lịch sử từ Backend:', error);
        setNhatKy([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredNhatKy = nhatKy.filter((log) => {
    if (boLocLoai !== 'ALL' && log.typeKey !== boLocLoai) return false;
    if (boLocThoiGian !== 'ALL') {
      const logDate = new Date(log.rawDate);
      const now = new Date();
      if (boLocThoiGian === 'TODAY' && logDate.toDateString() !== now.toDateString()) return false;
    }
    return true;
  });

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: "60px" }}>
      <header className="dash-header" style={{ marginBottom: "24px" }}>
        <div>
          <span className="subtitle" style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280" }}>NHẬT KÝ KIỂM SOÁT KHO</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: "clamp(2rem, 2.5vw, 2.7rem)", fontWeight: 600, color: "#1a1a1a", margin: "4px 0 8px 0" }}>
            Lịch Sử Biến Động Kho
          </h2>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>Nhật ký chi tiết các giao dịch từ API Backend.</p>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#fff', padding: '20px 24px', borderRadius: '12px', border: '1px solid #eae6df' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setBoLocLoai('ALL')} style={{ padding: '8px 16px', borderRadius: '8px', background: boLocLoai === 'ALL' ? '#1c1c1c' : '#fff', color: boLocLoai === 'ALL' ? '#fff' : '#666', border: '1px solid #e2ded8', fontWeight: 600, cursor: 'pointer' }}>Tất Cả</button>
          <button onClick={() => setBoLocLoai('IMPORT')} style={{ padding: '8px 16px', borderRadius: '8px', background: boLocLoai === 'IMPORT' ? '#1c1c1c' : '#fff', color: boLocLoai === 'IMPORT' ? '#fff' : '#666', border: '1px solid #e2ded8', fontWeight: 600, cursor: 'pointer' }}>Nhập Kho</button>
          <button onClick={() => setBoLocLoai('EXPORT')} style={{ padding: '8px 16px', borderRadius: '8px', background: boLocLoai === 'EXPORT' ? '#1c1c1c' : '#fff', color: boLocLoai === 'EXPORT' ? '#fff' : '#666', border: '1px solid #e2ded8', fontWeight: 600, cursor: 'pointer' }}>Xuất Kho</button>
        </div>
      </div>

      <section style={{ background: 'transparent' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="storage-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eae6df' }}>
            <thead>
              <tr style={{ background: '#faf8f5', color: '#78716c', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>
                <th style={{ padding: '14px 16px' }}>THỜI GIAN</th>
                <th style={{ padding: '14px 16px' }}>MÃ SKU & SẢN PHẨM</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>LOẠI</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>SỐ LƯỢNG</th>
                <th style={{ padding: '14px 16px' }}>NHÂN SỰ</th>
                <th style={{ padding: '14px 16px' }}>GHI CHÚ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '50px' }}>Đang tải lịch sử từ Backend…</td></tr>
              ) : filteredNhatKy.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '50px' }}>Không có giao dịch nào.</td></tr>
              ) : filteredNhatKy.map((log, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f2efeb' }}>
                  <td style={{ padding: '16px', fontSize: '12px', color: '#57534e' }}>{log.time}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', background: '#f4f1ea', padding: '2px 6px', borderRadius: '4px' }}>{log.sku}</span>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '4px' }}>{log.productName}</div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ background: log.type === 'Nhập Kho' ? '#f0fdf4' : '#fef2f2', color: log.type === 'Nhập Kho' ? '#16a34a' : '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                      {log.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <strong style={{ color: log.type === 'Nhập Kho' ? '#16a34a' : '#dc2626' }}>{log.change}</strong>
                  </td>
                  <td style={{ padding: '16px' }}>{log.staff}</td>
                  <td style={{ padding: '16px', fontSize: '12px', color: '#78716c' }}>{log.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default InventoryHistory;