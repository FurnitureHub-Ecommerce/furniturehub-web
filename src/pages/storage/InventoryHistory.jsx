import React, { useState, useEffect } from 'react';
import { storageAPI } from '../../services/api.js';
import { History, ArrowDownLeft, ArrowUpRight, FileText } from 'lucide-react';

const InventoryHistory = () => {
  const [nhatKy, setNhatKy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boLocLoai, setBoLocLoai] = useState('ALL');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
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
            note: item.note || 'Giao dịch kho',
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
    return true;
  });

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: "60px", padding: "24px" }}>
      <header className="dash-header" style={{ marginBottom: "20px" }}>
        <div>
          <span className="subtitle" style={{ fontSize: "11px", fontWeight: 700, color: "#78716c" }}>NHẬT KÝ KIỂM SOÁT KHO</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: "#1a1a1a", fontWeight: 600, margin: "4px 0" }}>
            Lịch Sử Biến Động Kho
          </h2>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>Nhật ký chi tiết các giao dịch nhập xuất thời gian thực từ hệ thống.</p>
        </div>
      </header>

      {/* THANH BỘ LỌC NÚT BẤM */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button 
          onClick={() => setBoLocLoai('ALL')} 
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: boLocLoai === 'ALL' ? '#1c1c1c' : '#fff', color: boLocLoai === 'ALL' ? '#fff' : '#57534e', border: '1px solid #e2ded8' }}
        >
          Tất Cả Giao Dịch ({nhatKy.length})
        </button>
        <button 
          onClick={() => setBoLocLoai('IMPORT')} 
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: boLocLoai === 'IMPORT' ? '#1c1c1c' : '#fff', color: boLocLoai === 'IMPORT' ? '#fff' : '#57534e', border: '1px solid #e2ded8' }}
        >
          Phiếu Nhập Kho
        </button>
        <button 
          onClick={() => setBoLocLoai('EXPORT')} 
          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: boLocLoai === 'EXPORT' ? '#1c1c1c' : '#fff', color: boLocLoai === 'EXPORT' ? '#fff' : '#57534e', border: '1px solid #e2ded8' }}
        >
          Phiếu Xuất Kho
        </button>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <section style={{ background: '#fff', border: '1px solid #eae6df', borderRadius: '12px', overflow: 'hidden', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText size={18} color="#1c1c1c" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Danh Sách Chứng Từ Giao Dịch</h3>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#78716c' }}>Đang tải lịch sử giao dịch...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#faf8f5', color: '#78716c', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', width: '180px' }}>THỜI GIAN</th>
                  <th style={{ padding: '14px 16px' }}>MÃ SKU & SẢN PHẨM</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '130px' }}>LOẠI</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '110px' }}>SỐ LƯỢNG</th>
                  <th style={{ padding: '14px 16px', width: '160px' }}>NHÂN SỰ</th>
                  <th style={{ padding: '14px 16px' }}>GHI CHÚ / ĐỐI TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredNhatKy.length > 0 ? (
                  filteredNhatKy.map((log, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f2efeb' }}>
                      {/* Thời gian */}
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#57534e', whiteSpace: 'nowrap' }}>
                        {log.time}
                      </td>
                      
                      {/* SKU & Tên sản phẩm */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                          {log.sku}
                        </span>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a1a', marginTop: '4px' }}>
                          {log.productName}
                        </div>
                      </td>

                      {/* Loại giao dịch (Đã fix whiteSpace: nowrap để chữ không bị rớt dòng) */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: log.type === 'Nhập Kho' ? '#f0fdf4' : '#fef2f2', 
                          color: log.type === 'Nhập Kho' ? '#16a34a' : '#dc2626', 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '11px', 
                          fontWeight: 700,
                          whiteSpace: 'nowrap' 
                        }}>
                          {log.type === 'Nhập Kho' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          {log.type}
                        </span>
                      </td>

                      {/* Số lượng */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <strong style={{ color: log.type === 'Nhập Kho' ? '#16a34a' : '#dc2626', fontSize: '13px' }}>
                          {log.change}
                        </strong>
                      </td>

                      {/* Nhân sự */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#444' }}>
                        {log.staff}
                      </td>

                      {/* Ghi chú */}
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#78716c' }}>
                        {log.note}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#8c857b', fontSize: '13px' }}>
                      Chưa có lịch sử giao dịch nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default InventoryHistory;