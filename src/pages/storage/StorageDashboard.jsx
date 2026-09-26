import React, { useState, useEffect } from 'react';
import { loadStorageVariants } from '../../services/storageData';
import { Layers, FileSpreadsheet, Search } from 'lucide-react';

const StorageDashboard = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Thêm state bắt lỗi
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadStorageVariants();
      // Đảm bảo dữ liệu luôn là mảng
      setSkuProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải Dashboard kho:', err);
      setError('Không thể tải dữ liệu kho từ hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExportExcel = () => {
    if (!skuProducts || skuProducts.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF'; 
    csvContent += 'Mã SKU,Tên Sản Phẩm,Quy Cách & Biến Thể,Số Lượng Tồn,Trạng Thái\n';

    skuProducts.forEach((item) => {
      const stockVal = item.stock || 0;
      const status = stockVal === 0 ? 'HẾT HÀNG' : stockVal <= 15 ? 'SẮP HẾT' : 'ỔN ĐỊNH';
      const row = [
        `"${item.id || ''}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.specs || '').replace(/"/g, '""')}"`,
        stockVal,
        `"${status}"`,
      ].join(',');
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoTonKho_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Kiểm tra an toàn trước khi filter
  const filteredProducts = Array.isArray(skuProducts) ? skuProducts.filter((item) => 
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const totalStock = skuProducts.reduce((acc, item) => acc + (Number(item.stock) || 0), 0);
  const stockItems = skuProducts.filter((item) => item.stock !== null && item.stock !== undefined);
  const lowStockCount = stockItems.filter((item) => Number(item.stock) <= 15).length;
  const hasStockData = stockItems.length > 0;

  const storageMetrics = [
    { label: 'TỔNG SỐ SKU', value: skuProducts.length, sub: 'Đang quản lý trong hệ thống' },
    { label: 'HÀNG TỒN KHO (TỔNG)', value: hasStockData ? totalStock.toLocaleString() : 'Chưa cập nhật', sub: 'Sản phẩm sẵn sàng lưu trữ' },
    { label: 'CẢNH BÁO TỒN THẤP', value: hasStockData ? `${lowStockCount} SKU` : 'Chưa cập nhật', sub: 'Dưới mức tồn kho tối thiểu' }
  ];

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '40px', textAlign: 'center' }}>Đang tải tổng quan hệ thống kho...</div>;
  }

  if (error) {
    return <div className="dashboard-main" style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>{error}</div>;
  }

  return (
    <div className="dashboard-main" style={{ position: 'relative' }}>
      <header className="dash-header">
        <div>
          <span className="subtitle">QUẢN LÝ DANH MỤC & HỆ THỐNG KHO</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>
            Quản Lý SKU, Biến Thể & Tồn Kho Thực Tế
          </h2>
          <p>Theo dõi số lượng thực tế và thông số tồn kho theo thời gian thực từ hệ thống biến thể.</p>
        </div>
        <div className="actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <FileSpreadsheet size={16} /> Xuất Excel Kho
          </button>
        </div>
      </header>

      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {storageMetrics.map((item, idx) => (
          <div key={idx} className="metric-card">
            <h4>{item.label}</h4>
            <div className="metric-val">{item.value}</div>
            <p>{item.sub}</p>
          </div>
        ))}
      </div>

      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0 }}>Danh Mục SKU Master & Hiện Trạng Tồn Kho</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <Search size={16} color="#666" />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc mã SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '14px' }}
            />
          </div>
        </div>

        <table className="storage-table">
          <thead>
            <tr>
              <th>MÃ SKU & SẢN PHẨM</th>
              <th>QUY CÁCH & BIẾN THỂ</th>
              <th>SỐ LƯỢNG TỒN</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((prod) => {
                const stockVal = prod.stock;
                return (
                  <tr key={prod.id || Math.random()}>
                    <td>
                      <strong>{prod.name}</strong>
                      <br />
                      <small style={{ color: '#888' }}>{prod.id}</small>
                    </td>
                    <td>{prod.specs}</td>
                    <td><strong>{stockVal === null || stockVal === undefined ? 'Chưa cập nhật' : stockVal}</strong>{stockVal !== null && stockVal !== undefined && ' chiếc'}</td>
                    <td>
                      <span style={{
                        background: stockVal == null ? '#f5f5f4' : stockVal === 0 ? '#fef2f2' : stockVal <= 15 ? '#fffbeb' : '#f0fdf4',
                        color: stockVal == null ? '#78716c' : stockVal === 0 ? '#dc2626' : stockVal <= 15 ? '#d97706' : '#16a34a',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {stockVal == null ? 'CHƯA CÓ DỮ LIỆU' : stockVal === 0 ? 'HẾT HÀNG' : stockVal <= 15 ? 'SẮP HẾT' : 'ỔN ĐỊNH'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  Không tìm thấy SKU nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default StorageDashboard;