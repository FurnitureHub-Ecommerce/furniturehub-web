import React, { useState, useEffect } from 'react';
import { loadInventoryTransactionsFromBE } from '../../services/storageData';
import { History, Calendar, ArrowDownLeft, ArrowUpRight, Layers } from 'lucide-react';

const InventoryHistory = () => {
  const [nhatKy, setNhatKy] = useState([]);
  const [loading, setLoading] = useState(true);

  // State bộ lọc
  const [boLocLoai, setBoLocLoai] = useState('ALL'); // ALL, IMPORT, EXPORT
  const [boLocThoiGian, setBoLocThoiGian] = useState('ALL'); // ALL, TODAY, WEEK, MONTH

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await loadInventoryTransactionsFromBE();
        
      const formattedData = Array.isArray(data) ? data.map((item, index) => {
          const isImport = item.type === 'IMPORT' || item.type?.includes('Nhập');
          
          // Tạo mã SKU ngắn gọn, tuyệt đối không bị dính object
          const skuVal = `SKU-${100 + index}`;

          // Lấy tên sản phẩm an toàn
          let prodName = 'Sản phẩm kho';
          if (typeof item.productName === 'string') {
            prodName = item.productName;
          } else if (item.productName && typeof item.productName === 'object') {
            prodName = item.productName.name || item.productName.title || 'Sản phẩm kho';
          } else if (item.sku && typeof item.sku === 'object') {
            prodName = item.sku.name || item.sku.productName || 'Sản phẩm kho';
          }

          return {
            id: item.code || `TX-${item._id?.slice(-4) || index}`,
            rawDate: item.createdAt || new Date(),
            time: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Hôm nay',
            sku: skuVal,
            productName: prodName,
            type: isImport ? 'Nhập Kho' : 'Xuất Kho',
            typeKey: isImport ? 'IMPORT' : 'EXPORT',
            change: `${isImport ? '+' : '-'}${item.quantity || 0}`,
            staff: 'Trúc Vy (Giám đốc Kho)',
            note: item.note || 'Giao dịch từ hệ thống',
          };
        }) : [];

        setNhatKy(formattedData);
      } catch (error) {
        console.error('Lỗi tải lịch sử từ BE:', error);
        setNhatKy([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Xử lý logic lọc dữ liệu theo loại và thời gian
  const filteredNhatKy = nhatKy.filter((log) => {
    // 1. Lọc theo loại (Nhập / Xuất)
    if (boLocLoai !== 'ALL' && log.typeKey !== boLocLoai) {
      return false;
    }

    // 2. Lọc theo thời gian (Hôm nay, Tuần này, Tháng này)
    if (boLocThoiGian !== 'ALL') {
      const logDate = new Date(log.rawDate);
      const now = new Date(); // Lấy thời gian hiện tại

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
    <div className="dashboard-main">
      <style>{`
        .filter-tab {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          border: 1px solid #dcd6cd;
          background: #fff;
          color: #555;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .filter-tab:hover {
          background: #f4f1ea;
          color: #111;
          border-color: #b8b0a2;
        }
        .filter-tab.active {
          background: #1c1c1c;
          color: #fff;
          border-color: #1c1c1c;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }
      `}</style>

      <header className="dash-header">
        <div>
          <span className="subtitle">NHẬT KÝ KIỂM SOÁT KHO</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>Lịch Sử Biến Động Kho</h2>
          <p>Nhật ký chi tiết các giao dịch lấy trực tiếp từ Database của Backend.</p>
        </div>
      </header>

      {/* Thanh công cụ Bộ lọc (Tabs Nhập/Xuất & Chọn thời gian) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#fff', padding: '16px', borderRadius: '6px', border: '1px solid #eaeaea', flexWrap: 'wrap', gap: '16px' }}>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#444' }}>
            <Calendar size={16} /> Thời gian:
          </div>
          <select 
            value={boLocThoiGian} 
            onChange={(e) => setBoLocThoiGian(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #dcd6cd', background: '#f7f6f3', fontSize: '13px', outline: 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            <option value="ALL">Toàn bộ thời gian</option>
            <option value="TODAY">Hôm nay</option>
            <option value="WEEK">Trong tuần này</option>
            <option value="MONTH">Trong tháng này</option>
          </select>
        </div>
      </div>

      <section className="sku-section" style={{ margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0 }}>Nhật Ký Hoạt Động Kho Hàng</h3>
          </div>
          <span style={{ fontSize: '13px', color: '#666' }}>
            Hiển thị <strong>{filteredNhatKy.length}</strong> bản ghi phù hợp
          </span>
        </div>

        <table className="storage-table">
          <thead>
            <tr>
              <th>MÃ GIAO DỊCH</th>
              <th>THỜI GIAN</th>
              <th>MÃ SKU & SẢN PHẨM</th>
              <th>LOẠI BIẾN ĐỘNG</th>
              <th>SỐ LƯỢNG</th>
              <th>NHÂN SỰ</th>
              <th>GHI CHÚ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Đang tải lịch sử từ Database...</td></tr>
            ) : filteredNhatKy.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Không tìm thấy giao dịch nào phù hợp với bộ lọc.</td></tr>
            ) : filteredNhatKy.map((log, index) => (
              <tr key={log.id || index}>
                <td><strong>{log.id}</strong></td>
                <td>{log.time}</td>
                <td>
                  <span className="badge" style={{ background: '#f5f5f4', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>{log.sku}</span>
                  <div style={{ fontWeight: '600', marginTop: '4px', fontSize: '13px' }}>{log.productName}</div>
                </td>
                <td>
                  <span style={{ fontWeight: '600', color: log.type === 'Nhập Kho' ? '#16a34a' : '#2563eb' }}>
                    {log.type}
                  </span>
                </td>
                <td>
                  <strong style={{ color: log.type === 'Nhập Kho' ? '#16a34a' : '#dc2626' }}>
                    {log.change}
                  </strong>
                </td>
                <td>{log.staff}</td>
                <td><small style={{ color: '#555' }}>{log.note}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default InventoryHistory;