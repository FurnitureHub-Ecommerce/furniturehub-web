import React, { useState, useEffect } from 'react';
import { loadInventoryTransactionsFromBE } from '../../services/storageData';
import { History, Calendar, ArrowDownLeft, ArrowUpRight, Layers, User } from 'lucide-react';

const InventoryHistory = () => {
  const [nhatKy, setNhatKy] = useState([]);
  const [loading, setLoading] = useState(true);

  // State bộ lọc
  const [boLocLoai, setBoLocLoai] = useState('ALL'); // ALL, IMPORT, EXPORT
  const [boLocThoiGian, setBoLocThoiGian] = useState('ALL'); // ALL, TODAY, WEEK, MONTH
  const [boLocNhanVien, setBoLocNhanVien] = useState('ALL'); // Lọc theo nhân sự
  const [danhSachNhanVien, setDanhSachNhanVien] = useState([]); // Danh sách các nhân viên có trong dữ liệu

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await loadInventoryTransactionsFromBE();
        
        const data = Array.isArray(res) ? res : (res?.transactions || res?.data || []);
        
        const staffSet = new Set();

        const formattedData = data.map((item, index) => {
          const isImport = item.type === 'IMPORT' || item.type?.includes('Nhập');
          
          let staffName = 'Nhân sự kho';
          const creator = item.createdBy || item.performedBy || item.user;
          if (creator && typeof creator === 'object') {
            staffName = creator.fullName || creator.name || 'Nhân sự kho';
          } else if (typeof creator === 'string') {
            staffName = creator;
          }

          staffSet.add(staffName);

          let skuVal = 'SKU-001';
          const variant = item.variantId || item.sku || item.variant;
          if (variant && typeof variant === 'object') {
            skuVal = variant.code || variant.sku || variant.skuCode || `SKU-${100 + index}`;
          } else if (typeof variant === 'string') {
            skuVal = variant;
          }

          let prodName = 'Sản phẩm nội thất cao cấp';
          
          if (variant && typeof variant === 'object') {
            if (variant.productId && typeof variant.productId === 'object') {
              prodName = variant.productId.name || variant.productId.title || variant.productId.productName;
            } else if (variant.product && typeof variant.product === 'object') {
              prodName = variant.product.name || variant.product.title;
            } else if (variant.name) {
              prodName = variant.name;
            }
          }

          if (prodName === 'Sản phẩm nội thất cao cấp') {
            if (item.productName) prodName = item.productName;
            else if (item.product && typeof item.product === 'object') prodName = item.product.name;
            else if (item.itemName) prodName = item.itemName;
          }

          return {
            rawDate: item.createdAt || new Date(),
            time: item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Hôm nay',
            sku: skuVal,
            productName: prodName,
            type: isImport ? 'Nhập Kho' : 'Xuất Kho',
            typeKey: isImport ? 'IMPORT' : 'EXPORT',
            change: `${isImport ? '+' : '-'}${item.quantity || 0}`,
            staff: staffName,
            note: item.note || 'Giao dịch từ hệ thống',
          };
        });

        setNhatKy(formattedData);
        setDanhSachNhanVien(Array.from(staffSet));
      } catch (error) {
        console.error('Lỗi tải lịch sử từ BE:', error);
        setNhatKy([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Xử lý logic lọc dữ liệu theo loại, thời gian và nhân viên
  const filteredNhatKy = nhatKy.filter((log) => {
    // 1. Lọc theo loại
    if (boLocLoai !== 'ALL' && log.typeKey !== boLocLoai) {
      return false;
    }

    // 2. Lọc theo nhân viên
    if (boLocNhanVien !== 'ALL' && log.staff !== boLocNhanVien) {
      return false;
    }

   // 3. Lọc theo thời gian
    if (boLocThoiGian !== 'ALL') {
      const logDate = new Date(log.rawDate);
      const now = new Date();

      if (boLocThoiGian === 'TODAY') {
        if (logDate.toDateString() !== now.toDateString()) return false;
      } else if (boLocThoiGian === 'WEEK') {
        const diffTime = now - logDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (boLocThoiGian === 'MONTH') {
        if (logDate.getMonth() !== now.getMonth() || logDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (boLocThoiGian === 'LAST_MONTH') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (logDate.getMonth() !== lastMonth.getMonth() || logDate.getFullYear() !== lastMonth.getFullYear()) {
          return false;
        }
      } else if (boLocThoiGian === 'THIS_YEAR') {
        if (logDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: "60px" }}>
      <style>{`
        .filter-tab {
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          border: 1px solid #e2ded8;
          background: #fff;
          color: #666;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-tab:hover {
          background: #f7f5f0;
          color: #111;
          border-color: #d1cbc1;
        }
        .filter-tab.active {
          background: #1c1c1c;
          color: #fff;
          border-color: #1c1c1c;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .custom-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #eae6df;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .custom-table th {
          background: #faf8f5;
          color: #78716c;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #eae6df;
          white-space: nowrap;
        }
        .custom-table td {
          padding: 16px;
          font-size: 13px;
          color: #292524;
          border-bottom: 1px solid #f2efeb;
          vertical-align: middle;
        }
        .custom-table tbody tr:last-child td {
          border-bottom: none;
        }
        .custom-table tbody tr:hover {
          background: #fcfbfa;
        }
      `}</style>

      {/* HEADER */}
      <header className="dash-header" style={{ marginBottom: "24px" }}>
        <div>
          <span className="subtitle" style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em" }}>
            NHẬT KÝ KIỂM SOÁT KHO
          </span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: "clamp(2rem, 2.5vw, 2.7rem)", fontWeight: 600, color: "#1a1a1a", margin: "4px 0 8px 0", letterSpacing: "-0.02em" }}>
            Lịch Sử Biến Động Kho
          </h2>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Nhật ký chi tiết các giao dịch nhập xuất kho lấy trực tiếp từ dữ liệu.
          </p>
        </div>
      </header>

      {/* THANH CÔNG CỤ BỘ LỌC */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#fff', padding: '20px 24px', borderRadius: '12px', border: '1px solid #eae6df', flexWrap: 'wrap', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className={`filter-tab ${boLocLoai === 'ALL' ? 'active' : ''}`}
            onClick={() => setBoLocLoai('ALL')}
          >
            <Layers size={15} /> Tất Cả
          </button>
          <button 
            className={`filter-tab ${boLocLoai === 'IMPORT' ? 'active' : ''}`}
            onClick={() => setBoLocLoai('IMPORT')}
          >
            <ArrowDownLeft size={15} color={boLocLoai === 'IMPORT' ? '#fff' : '#16a34a'} /> Nhập Kho
          </button>
          <button 
            className={`filter-tab ${boLocLoai === 'EXPORT' ? 'active' : ''}`}
            onClick={() => setBoLocLoai('EXPORT')}
          >
            <ArrowUpRight size={15} color={boLocLoai === 'EXPORT' ? '#fff' : '#dc2626'} /> Xuất Kho
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Bộ lọc theo Nhân viên */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#78716c', letterSpacing: '0.05em' }}>
              NHÂN SỰ:
            </span>
            <select 
              value={boLocNhanVien} 
              onChange={(e) => setBoLocNhanVien(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#faf8f5', fontSize: '13px', outline: 'none', cursor: 'pointer', fontWeight: '500', color: '#1c1c1c' }}
            >
              <option value="ALL">Tất cả nhân sự</option>
              {danhSachNhanVien.map((nv, idx) => (
                <option key={idx} value={nv}>{nv}</option>
              ))}
            </select>
          </div>

          {/* Bộ lọc theo Thời gian */}
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <span style={{ fontSize: '11px', fontWeight: '700', color: '#78716c', letterSpacing: '0.05em' }}>
    THỜI GIAN:
  </span>
  <select 
    value={boLocThoiGian} 
    onChange={(e) => setBoLocThoiGian(e.target.value)}
    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#faf8f5', fontSize: '13px', outline: 'none', cursor: 'pointer', fontWeight: '500', color: '#1c1c1c' }}
  >
    <option value="ALL">Tất cả</option>
    <option value="TODAY">Hôm nay</option>
    <option value="WEEK">Trong tuần này</option>
    <option value="MONTH">Trong tháng này</option>
    <option value="LAST_MONTH">Tháng trước</option>
    <option value="THIS_YEAR">Trong năm nay</option>
  </select>
</div>
        </div>
      </div>

      {/* BẢNG NHẬT KÝ */}
      <section style={{ background: 'transparent', padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#1c1c1c" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1c1c1c', margin: 0 }}>Nhật Ký Hoạt Động Kho Hàng</h3>
          </div>
          <span style={{ fontSize: '13px', color: '#78716c' }}>
            Hiển thị <strong>{filteredNhatKy.length}</strong> bản ghi phù hợp
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '70px', textAlign: 'center' }}>STT</th>
                <th style={{ width: '170px' }}>THỜI GIAN</th>
                <th>MÃ SKU & SẢN PHẨM</th>
                <th style={{ width: '130px', textAlign: 'center' }}>LOẠI BIẾN ĐỘNG</th>
                <th style={{ width: '100px', textAlign: 'center' }}>SỐ LƯỢNG</th>
                <th style={{ width: '140px' }}>NHÂN SỰ</th>
                <th style={{ width: '180px' }}>GHI CHÚ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: '#888' }}>Đang tải lịch sử từ cơ sở dữ liệu…</td></tr>
              ) : filteredNhatKy.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: '#8c857b' }}>Không tìm thấy giao dịch nào phù hợp với bộ lọc.</td></tr>
              ) : filteredNhatKy.map((log, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ 
                      fontWeight: 700, 
                      color: "#78716c",
                      background: "#f4f1ea",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px"
                    }}>
                      {index + 1}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#57534e', fontSize: '12px', whiteSpace: 'nowrap' }}>{log.time}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#78716c', background: '#f4f1ea', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '4px' }}>
                      {log.sku}
                    </span>
                    <div style={{ fontWeight: 600, color: '#1c1c1c', fontSize: '13px', lineHeight: '1.4' }}>
                      {log.productName}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      background: log.type === 'Nhập Kho' ? '#f0fdf4' : '#fef2f2',
                      color: log.type === 'Nhập Kho' ? '#16a34a' : '#dc2626',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      border: `1px solid ${log.type === 'Nhập Kho' ? '#bbf7d0' : '#fecaca'}`,
                      display: 'inline-block',
                      whiteSpace: 'nowrap'
                    }}>
                      {log.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <strong style={{ fontSize: '14px', color: log.type === 'Nhập Kho' ? '#16a34a' : '#dc2626' }}>
                      {log.change}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: '#444', fontSize: '13px' }}>{log.staff}</span>
                  </td>
                  <td>
                    <span style={{ color: '#78716c', fontSize: '12px', fontStyle: log.note ? 'normal' : 'italic' }}>
                      {log.note}
                    </span>
                  </td>
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