import React, { useState, useEffect } from 'react';
import { storageAPI } from '../../services/api.js';
import { Layers, FileSpreadsheet, Search, X, Package } from 'lucide-react';

const StorageDashboard = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State quản lý Modal chi tiết sản phẩm / tồn kho
  const [selectedProduct, setSelectedProduct] = useState(null);

 const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi API GET /api/inventory
      const response = await storageAPI.getInventory();
      const body = response?.data || {};
      
      // Lấy đúng mảng inventories từ response của backend
      const inventories = body.inventories || body.data?.inventories || body.items || (Array.isArray(body) ? body : []);

      // Chuẩn hóa dữ liệu hiển thị lên bảng kho
      const formattedItems = inventories.map(item => {
        const variant = item.variantId || item.variant || {};
        const product = variant.productId || item.product || {};
        
        return {
          id: variant.sku || variant._id || item._id || 'N/A',
          name: product.name || item.name || 'Sản phẩm kho',
          specs: [
            variant.color ? `Màu: ${variant.color}` : '',
            variant.size ? `Size: ${variant.size}` : '',
            variant.material ? `Chất liệu: ${variant.material}` : ''
          ].filter(Boolean).join(' — ') || 'Tiêu chuẩn',
          // Lấy quantity làm số lượng tồn kho (hoặc availableStock)
          stock: item.quantity ?? variant.availableStock ?? item.stock ?? 0,
          price: variant.price ?? 0
        };
      });

      setSkuProducts(formattedItems);
    } catch (err) {
      console.error('Lỗi tải dữ liệu kho từ /api/inventory:', err);
      setError('Không thể tải dữ liệu tồn kho từ Backend.');
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
    { label: 'TỔNG HÀNG TỒN KHO', value: hasStockData ? totalStock.toLocaleString() : 'Chưa cập nhật', sub: 'Sản phẩm sẵn sàng lưu trữ' },
    { label: 'CẢNH BÁO TỒN THẤP', value: hasStockData ? `${lowStockCount} sản phẩm` : 'Chưa cập nhật', sub: 'Dưới mức tồn kho tối thiểu' }
  ];

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '40px', textAlign: 'center' }}>Đang gọi API /api/inventory từ Backend...</div>;
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
          <p>Theo dõi số lượng thực tế và thông số tồn kho theo thời gian thực từ API /api/inventory.</p>
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
              style={{ border: 'none', outline: 'none', fontSize: '14px', background: 'transparent' }}
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
                      <strong 
                        onClick={() => setSelectedProduct(prod)}
                        style={{ color: '#2563eb', cursor: 'pointer', transition: 'color 0.2s' }}
                        title="Bấm để xem chi tiết sản phẩm"
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {prod.name}
                      </strong>
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

      {/* MODAL HIỂN THỊ CHI TIẾT SẢN PHẨM */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '550px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #f3f4f6',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={22} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Chi Tiết Tồn Kho & SKU</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  transition: 'background 0.2s'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Tên Sản Phẩm</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', color: '#1f2937' }}>{selectedProduct.name}</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>MÃ SKU</span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#374151', fontFamily: 'monospace', fontSize: '14px' }}>{selectedProduct.id}</p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>SỐ LƯỢNG TỒN KHO</span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#2563eb', fontSize: '16px' }}>
                    {selectedProduct.stock !== null && selectedProduct.stock !== undefined ? `${selectedProduct.stock} chiếc` : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Quy Cách & Biến Thể Chi Tiết</span>
                <p style={{ margin: '6px 0 0 0', color: '#4b5563', lineHeight: '1.5', background: '#fff', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '6px' }}>
                  {selectedProduct.specs || 'Không có thông tin quy cách cụ thể.'}
                </p>
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => setSelectedProduct(null)}
                style={{
                  backgroundColor: '#111827',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageDashboard;