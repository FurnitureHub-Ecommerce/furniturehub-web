import React, { useState, useEffect } from 'react';
import { storageAPI, productAPI } from '../../services/api.js';
import { Layers, FileSpreadsheet, Search, X, Package } from 'lucide-react';

const StorageDashboard = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [invRes, productsRes] = await Promise.all([
        storageAPI.getInventory().catch(() => ({ data: { inventories: [] } })),
        productAPI.getProductsAdmin ? productAPI.getProductsAdmin().catch(() => ({ data: { products: [] } })) : Promise.resolve({ data: { products: [] } })
      ]);

      const invBody = invRes?.data || {};
      const inventories = invBody.inventories || invBody.data?.inventories || invBody.items || invBody || [];
      const stockMap = new Map();

      (Array.isArray(inventories) ? inventories : []).forEach(item => {
        const variantObj = item.variantId || item.variant || {};
        const vId = variantObj._id || variantObj.id || item._id;
        const sku = variantObj.sku || item.sku;
        const qty = item.quantity ?? item.stock ?? item.availableStock ?? 0;
        if (vId) stockMap.set(String(vId), qty);
        if (sku) stockMap.set(String(sku), qty);
      });

      const prodBody = productsRes?.data || {};
      const products = prodBody.products || prodBody.data || prodBody.rows || (Array.isArray(prodBody) ? prodBody : []);

      const variantPromises = (Array.isArray(products) ? products : []).map(async (product) => {
        const prodId = product._id || product.id;
        const productName = product.name || 'Sản phẩm nội thất';
        const productImage = product.image || product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80';

        try {
          const res = productAPI.getProductVariantsAdmin 
            ? await productAPI.getProductVariantsAdmin(prodId).catch(() => null)
            : productAPI.getClient ? await productAPI.getClient.get(`/products/${prodId}/variants/admin`).catch(() => null) : null;

          const variantBody = res?.data || {};
          const variants = variantBody.variants || variantBody.data || variantBody.rows || product.variants || [];

          if (Array.isArray(variants) && variants.length > 0) {
            return variants.map(variant => {
              const variantId = variant._id || variant.id;
              const sku = variant.sku || variant.code || 'SKU';
              const currentStock = stockMap.get(String(variantId)) ?? stockMap.get(String(sku)) ?? 0;
              const varImage = variant.image || productImage;

              return {
                id: sku,
                variantId: variantId,
                name: productName,
                image: varImage,
                specs: [
                  variant.color ? `Màu: ${variant.color}` : '',
                  variant.size ? `Size: ${variant.size}` : '',
                  variant.material ? `Chất liệu: ${variant.material}` : ''
                ].filter(Boolean).join(' — ') || 'Tiêu chuẩn',
                stock: currentStock,
                color: variant.color || '—',
                size: variant.size || '—',
                material: variant.material || '—'
              };
            });
          }
        } catch (e) {
          console.error("Lỗi lấy variants:", prodId);
        }

        return [{
          id: product.sku || 'SKU',
          variantId: prodId,
          name: productName,
          image: productImage,
          specs: 'Tiêu chuẩn',
          stock: stockMap.get(String(prodId)) ?? 0,
          color: product.color || '—',
          size: product.size || '—',
          material: product.material || '—'
        }];
      });

      const nestedVariants = await Promise.all(variantPromises);
      const allVariants = nestedVariants.flat().filter(Boolean);
      setSkuProducts(allVariants);
    } catch (err) {
      console.error('Lỗi tải dữ liệu kho:', err);
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
  const lowStockCount = skuProducts.filter((item) => Number(item.stock) <= 15).length;

  const storageMetrics = [
    { label: 'TỔNG SỐ SKU', value: skuProducts.length, sub: 'Đang quản lý trong hệ thống' },
    { label: 'TỔNG HÀNG TỒN KHO', value: totalStock.toLocaleString(), sub: 'Sản phẩm sẵn sàng lưu trữ' },
    { label: 'CẢNH BÁO TỒN THẤP', value: `${lowStockCount} sản phẩm`, sub: 'Dưới mức tồn kho tối thiểu' }
  ];

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '40px', textAlign: 'center' }}>Đang đồng bộ dữ liệu từ hệ thống...</div>;
  }

  if (error) {
    return <div className="dashboard-main" style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>{error}</div>;
  }

  return (
    <div className="dashboard-main" style={{ position: 'relative' }}>
      <header className="dash-header">
        <div>
          <span className="subtitle" style={{fontFamily: "'Playfair Display', serif"}}>QUẢN LÝ DANH MỤC & HỆ THỐNG KHO</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>
            Quản Lý SKU, Biến Thể & Tồn Kho Thực Tế
          </h2>
          <p>Theo dõi số lượng thực tế và thông số tồn kho theo thời gian thực.</p>
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
            <Layers size={28} color="#1c1c1c" />
            <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 2.5vw, 2rem)', color:'ActiveBorder' }}>Danh Mục SKU Master & Hiện Trạng Tồn Kho</h3>
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
            <tr >
              <th style={{ width: '100px' }}>HÌNH ẢNH</th>
              <th>MÃ SKU & SẢN PHẨM</th>
              <th>QUY CÁCH & BIẾN THỂ</th>
              <th>SỐ LƯỢNG </th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((prod) => {
                const stockVal = prod.stock;
                return (
                  <tr key={prod.variantId || prod.id}>
                    <td>
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        onClick={() => setSelectedProduct(prod)}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #eae6df' }} 
                        title="Bấm để xem chi tiết"
                      />
                    </td>
                    <td>
                      <strong 
                        onClick={() => setSelectedProduct(prod)}
                        style={{ color: '#2563eb', cursor: 'pointer' }}
                        title="Bấm để xem chi tiết"
                      >
                        {prod.name}
                      </strong>
                      <br />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>{prod.id}</span>
                    </td>
                    <td>{prod.specs}</td>
                    <td><strong>{stockVal}</strong> chiếc</td>
                    <td>
                      <span style={{
                        background: stockVal === 0 ? '#fef2f2' : stockVal <= 15 ? '#fffbeb' : '#f0fdf4',
                        color: stockVal === 0 ? '#dc2626' : stockVal <= 15 ? '#d97706' : '#16a34a',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {stockVal === 0 ? 'HẾT HÀNG' : stockVal <= 15 ? 'SẮP HẾT' : 'ỔN ĐỊNH'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  Không tìm thấy SKU nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* MODAL HIỂN THỊ CHI TIẾT SẢN PHẨM */}
      {selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={22} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Chi Tiết Tồn Kho & SKU</h3>
              </div>
              <button onClick={() => setSelectedProduct(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img src={selectedProduct.image} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eae6df' }} />
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>{selectedProduct.id}</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '1.2rem', color: '#1f2937' }}>{selectedProduct.name}</h2>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f9fafb', padding: '16px', borderRadius: '8px', fontSize: '13px' }}>
                <div><strong>Màu sắc:</strong> {selectedProduct.color}</div>
                <div><strong>Kích thước:</strong> {selectedProduct.size}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Chất liệu:</strong> {selectedProduct.material}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Số lượng tồn:</strong> <span style={{ color: '#2563eb', fontWeight: 700 }}>{selectedProduct.stock} chiếc</span></div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedProduct(null)} style={{ backgroundColor: '#111827', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageDashboard;