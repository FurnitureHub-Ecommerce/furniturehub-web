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
            id: item.code || `TX-${item._id?.slice(-4) || index}`,
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
      }
    }

    return true;
  });

  return (
    <div className="dashboard-main" style={{ width: "100%", padding: "0 28px 48px 28px", maxWidth: "1500px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .filter-tab {
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #dcd6cd;
          background: #fff;
          color: #555;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .filter-tab:hover {
          background: #faf8f5;
          color: #111;
          border-color: #b8b0a2;
        }
        .filter-tab.active {
          background: #1c1c1c;
          color: #fff;
          border-color: #1c1c1c;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* HEADER */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", borderBottom: "1px solid #eae6df", paddingBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", letterSpacing: "0.05em" }}>
            NHẬT KÝ KIỂM SOÁT KHO
          </span>
          <h1 style={{ fontFamily: "Bodoni Moda", fontSize: "2.6rem", fontWeight: 600, color: "#1a1a1a", margin: "4px 0 0 0" }}>
            Lịch Sử Biến Động Kho
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "13px" }}>
            Nhật ký chi tiết các giao dịch nhập xuất kho lấy trực tiếp từ Database hệ thống.
          </p>
        </div>
      </header>

      {/* THANH CÔNG CỤ BỘ LỌC (LOẠI, NHÂN VIÊN, THỜI GIAN) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#fff', padding: '18px 24px', borderRadius: '14px', border: '1px solid #eae6df', flexWrap: 'wrap', gap: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
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
            <ArrowUpRight size={15} color={boLocLoai === 'EXPORT' ? '#fff' : '#2563eb'} /> Xuất Kho
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Bộ lọc theo Nhân viên */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#555' }}>
              <User size={16} /> NHÂN SỰ:
            </div>
            <select 
              value={boLocNhanVien} 
              onChange={(e) => setBoLocNhanVien(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#faf8f5', fontSize: '13px', outline: 'none', cursor: 'pointer', fontWeight: '600', color: '#333' }}
            >
              <option value="ALL">Tất cả nhân sự</option>
              {danhSachNhanVien.map((nv, idx) => (
                <option key={idx} value={nv}>{nv}</option>
              ))}
            </select>
          </div>

          {/* Bộ lọc theo Thời gian */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#555' }}>
              <Calendar size={16} /> THỜI GIAN:
            </div>
            <select 
              value={boLocThoiGian} 
              onChange={(e) => setBoLocThoiGian(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#faf8f5', fontSize: '13px', outline: 'none', cursor: 'pointer', fontWeight: '600', color: '#333' }}
            >
              <option value="ALL">Toàn bộ thời gian</option>
              <option value="TODAY">Hôm nay</option>
              <option value="WEEK">Trong tuần này</option>
              <option value="MONTH">Trong tháng này</option>
            </select>
          </div>
        </div>
      </div>

      {/* BẢNG NHẬT KÝ */}
      <section style={{ background: '#fff', border: '1px solid #eae6df', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eae6df', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#1c1c1c" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1c1c1c', margin: 0 }}>Nhật Ký Hoạt Động Kho Hàng</h3>
          </div>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>
            Hiển thị <strong>{filteredNhatKy.length}</strong> bản ghi phù hợp
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#5c4033", color: "#fff", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>
                <th style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>MÃ GIAO DỊCH</th>
                <th style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>THỜI GIAN</th>
                <th style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>MÃ SKU & SẢN PHẨM</th>
                <th style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>LOẠI BIẾN ĐỘNG</th>
                <th style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>SỐ LƯỢNG</th>
                <th style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>NHÂN SỰ</th>
                <th style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>GHI CHÚ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải lịch sử từ cơ sở dữ liệu…</td></tr>
              ) : filteredNhatKy.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Không tìm thấy giao dịch nào phù hợp với bộ lọc.</td></tr>
              ) : filteredNhatKy.map((log, index) => (
                <tr key={log.id || index} style={{ borderBottom: '1px solid #f2efeb', background: index % 2 === 0 ? '#fff' : '#fcfbfa' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1c1c1c', whiteSpace: 'nowrap' }}>{log.id}</td>
                  <td style={{ padding: '16px 20px', color: '#666', whiteSpace: 'nowrap' }}>{log.time}</td>
                  <td style={{ padding: '16px 20px', minWidth: '260px' }}>
                    <span style={{ background: '#f2efeb', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', color: '#1c1c1c', display: 'inline-block', whiteSpace: 'nowrap' }}>{log.sku}</span>
                    <div style={{ fontWeight: '600', marginTop: '6px', fontSize: '13px', color: '#333', lineHeight: '1.4' }}>{log.productName}</div>
                  </td>
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: '600', color: log.type === 'Nhập Kho' ? '#16a34a' : '#2563eb' }}>
                      {log.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <strong style={{ color: log.type === 'Nhập Kho' ? '#16a34a' : '#dc2626' }}>
                      {log.change}
                    </strong>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 500, color: '#444', whiteSpace: 'nowrap' }}>{log.staff}</td>
                  <td style={{ padding: '16px 24px', color: '#666', whiteSpace: 'nowrap' }}><small>{log.note}</small></td>
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