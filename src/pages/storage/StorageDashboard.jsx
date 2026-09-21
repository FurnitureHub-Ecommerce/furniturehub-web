import React, { useState, useEffect } from 'react';
import { loadStorageVariants } from '../../services/storageData';
import { Layers, FileSpreadsheet } from 'lucide-react';

const StorageDashboard = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm tải dữ liệu kho
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setSkuProducts(await loadStorageVariants());
    } catch (error) {
      console.error('Lỗi tải Dashboard kho:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 📊 Tính năng Xuất Excel Kho (Định dạng CSV tương thích Excel tiếng Việt UTF-8)
  const handleExportExcel = () => {
    if (skuProducts.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF'; // Thêm BOM để hiển thị tiếng Việt chuẩn trên Excel
    csvContent += 'Mã SKU,Tên Sản Phẩm,Quy Cách & Biến Thể,Vị Trí Lưu Trữ,Số Lượng Tồn,Trạng Thái\n';

    skuProducts.forEach((item) => {
      const status = item.stock === 0 ? 'HẾT HÀNG' : item.stock <= 15 ? 'SẮP HẾT' : 'ỔN ĐỊNH';
      const row = [
        `"${item.id}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.specs.replace(/"/g, '""')}"`,
        `"${item.location}"`,
        item.stock,
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

  const totalStock = skuProducts.reduce((acc, item) => acc + (item.stock || 0), 0);
  const stockItems = skuProducts.filter((item) => item.stock !== null);
  const lowStockCount = stockItems.filter((item) => item.stock <= 15).length;
  const hasStockData = stockItems.length > 0;
  const locations = new Set(skuProducts.map((item) => item.location).filter(Boolean));

  const storageMetrics = [
    { label: 'TỔNG SỐ SKU', value: skuProducts.length, sub: 'Đang quản lý trong hệ thống' },
    { label: 'HÀNG TỒN KHO (TỔNG)', value: hasStockData ? totalStock.toLocaleString() : 'Chưa cập nhật', sub: hasStockData ? 'Sản phẩm sẵn sàng lưu trữ' : 'API variant chưa trả về số lượng tồn' },
    { label: 'VỊ TRÍ LƯU TRỮ', value: locations.size || 'Chưa cập nhật', sub: locations.size ? 'Khu vực đang được sử dụng' : 'API variant chưa trả về vị trí lưu trữ' },
    { label: 'CẢNH BÁO TỒN THẤP', value: hasStockData ? `${lowStockCount} SKU` : 'Chưa cập nhật', sub: hasStockData ? 'Dưới mức tồn kho tối thiểu' : 'Không thể tính khi API chưa có số lượng tồn' }
  ];

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '40px', textAlign: 'center' }}>Đang tải tổng quan hệ thống kho...</div>;
  }

  return (
    <div className="dashboard-main" style={{ position: 'relative' }}>
      <header className="dash-header">
        <div>
          <span className="subtitle">QUẢN LÝ DANH MỤC & HỆ THỐNG KHO</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>
            Quản Lý SKU, Biến Thể & Tồn Kho Thực Tế
          </h2>
          <p>Theo dõi số lượng thực tế, tình trạng lưu trữ theo từng khu vực kho và thông số bảo quản thời gian thực.</p>
        </div>
        <div className="actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <FileSpreadsheet size={16} /> Xuất Excel Kho
          </button>
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

      {/* SKU Table */}
      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0 }}>Danh Mục SKU Master & Hiện Trạng Lưu Trữ</h3>
          </div>
          <span style={{ fontSize: '13px', color: '#666' }}>Cập nhật tự động từ hệ thống</span>
        </div>

        <table className="storage-table">
          <thead>
            <tr>
              <th>MÃ SKU & SẢN PHẨM</th>
              <th>QUY CÁCH & BIẾN THỂ</th>
              <th>VỊ TRÍ LƯU TRỮ</th>
              <th>SỐ LƯỢNG TỒN</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {skuProducts.length > 0 ? (
              skuProducts.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <strong>{prod.name}</strong>
                    <br />
                    <small style={{ color: '#888' }}>{prod.id}</small>
                  </td>
                  <td>{prod.specs}</td>
                  <td><span className="badge">{prod.location || 'Chưa cập nhật'}</span></td>
                  <td><strong>{prod.stock === null ? 'Chưa cập nhật' : prod.stock}</strong>{prod.stock !== null && ' chiếc'}</td>
                  <td>
                    <span style={{
                      background: prod.stock === null ? '#f5f5f4' : prod.stock === 0 ? '#fef2f2' : prod.stock <= 15 ? '#fffbeb' : '#f0fdf4',
                      color: prod.stock === null ? '#78716c' : prod.stock === 0 ? '#dc2626' : prod.stock <= 15 ? '#d97706' : '#16a34a',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {prod.stock === null ? 'CHƯA CÓ DỮ LIỆU TỒN' : prod.stock === 0 ? 'HẾT HÀNG' : prod.stock <= 15 ? 'SẮP HẾT' : 'ỔN ĐỊNH'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  Không có dữ liệu SKU nào trong kho.
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