import React, { useState, useEffect } from 'react';
import { storageAPI, productAPI } from '../../services/api.js';
import { Layers, FileSpreadsheet, Search, X, Package, ChevronLeft, ChevronRight } from 'lucide-react';

// Cache ngầm giúp chuyển trang load tức thì không cần gọi lại API
let dashboardCache = null;
let dashboardCacheTime = 0;
const CACHE_DURATION = 60000; // 1 phút

const StorageDashboard = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // States cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Hiển thị 10 sản phẩm trên 1 trang

  const fetchDashboardData = async () => {
    const now = Date.now();
    if (dashboardCache && (now - dashboardCacheTime < CACHE_DURATION)) {
      setSkuProducts(dashboardCache);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Gọi song song API tồn kho và sản phẩm admin
      const [invRes, productsRes] = await Promise.all([
        storageAPI.getInventory().catch(() => ({ data: { inventories: [] } })),
        productAPI.getProductsAdmin ? productAPI.getProductsAdmin().catch(() => ({ data: { products: [] } })) : Promise.resolve({ data: { products: [] } })
      ]);

      const invBody = invRes?.data || {};
      const inventories = Array.isArray(invBody) 
        ? invBody 
        : (invBody.inventories || invBody.data?.inventories || invBody.items || invBody.data || []);
      
      const stockMap = new Map();

      (Array.isArray(inventories) ? inventories : []).forEach((item) => {
        const invObj = item.inventory || item;
        const variantField = invObj.variantId || item.variantId;
        
        const vIdObj = typeof variantField === "object" && variantField !== null ? variantField : {};
        const vId1 = vIdObj._id;
        const vId2 = typeof variantField === "string" ? variantField : null;
        const sku = vIdObj.sku || invObj.sku || item.sku;
        
        const qty = invObj.quantity ?? invObj.stock ?? invObj.availableStock ?? item.quantity ?? item.stock ?? 0;

        if (vId1) stockMap.set(String(vId1).trim(), Number(qty));
        if (vId2) stockMap.set(String(vId2).trim(), Number(qty));
        if (sku) stockMap.set(String(sku).trim(), Number(qty));
      });

      const prodBody = productsRes?.data || {};
      const products =
        prodBody.products ||
        prodBody.data ||
        prodBody.rows ||
        (Array.isArray(prodBody) ? prodBody : []);

      const variantPromises = (Array.isArray(products) ? products : []).map(
        async (product) => {
          const prodId = product._id || product.id;
          const productName = product.name || "Sản phẩm nội thất";
          const productImage =
            product.image ||
            product.thumbnail ||
            product.images?.[0] ||
            "";

          try {
            const res = productAPI.getProductVariantsAdmin
              ? await productAPI
                  .getProductVariantsAdmin(prodId)
                  .catch(() => null)
              : productAPI.getClient
                ? await productAPI.getClient
                    .get(`/products/${prodId}/variants/admin`)
                    .catch(() => null)
                : null;

            const variantBody = res?.data || {};
            const variants =
              variantBody.variants ||
              variantBody.data ||
              variantBody.rows ||
              product.variants ||
              [];

            if (Array.isArray(variants) && variants.length > 0) {
              return Promise.all(
                variants.map(async (variant) => {
                  const variantId = variant._id || variant.id || variant.variantId;
                  const sku = variant.sku || variant.code || "SKU";
                  
                  let currentStock =
                    stockMap.get(String(variantId).trim()) ??
                    stockMap.get(String(sku).trim()) ??
                    0;

                  if (currentStock === 0 && variantId) {
                    try {
                      const singleInvRes = await storageAPI.getInventoryByVariantId(variantId).catch(() => null);
                      const singleBody = singleInvRes?.data || {};
                      const singleInv = singleBody.inventory || singleBody.data || singleBody;
                      
                      const fetchedQty = singleInv.quantity ?? singleInv.stock ?? singleInv.availableStock;
                      if (fetchedQty !== undefined && fetchedQty !== null) {
                        currentStock = Number(fetchedQty);
                      }
                    } catch (e) {}
                  }

                  const varImage = variant.image || productImage;
                  const vColor = variant.color || variant.attributes?.color || "—";
                  const vSize = variant.size || variant.attributes?.size || "—";
                  const vMaterial = variant.material || variant.attributes?.material || "—";

                  return {
                    id: String(sku).trim(),
                    variantId: String(variantId).trim(),
                    name: productName,
                    image: varImage,
                    stock: Number(currentStock),
                    color: vColor,
                    size: vSize,
                    material: vMaterial,
                  };
                })
              );
            }
          } catch (e) {
            console.error("Lỗi lấy variants cho sản phẩm:", prodId);
          }

          const fallbackId = String(prodId).trim();
          const fallbackSku = String(product.sku || "SKU").trim();
          let fallbackStock = stockMap.get(fallbackId) ?? stockMap.get(fallbackSku) ?? 0;

          if (fallbackStock === 0) {
            try {
              const singleInvRes = await storageAPI.getInventoryByVariantId(fallbackId).catch(() => null);
              const singleBody = singleInvRes?.data || {};
              const singleInv = singleBody.inventory || singleBody.data || singleBody;
              const fetchedQty = singleInv.quantity ?? singleInv.stock ?? singleInv.availableStock;
              if (fetchedQty !== undefined && fetchedQty !== null) {
                fallbackStock = Number(fetchedQty);
              }
            } catch (e) {}
          }

          return [
            {
              id: fallbackSku,
              variantId: fallbackId,
              name: productName,
              image: productImage,
              stock: Number(fallbackStock),
              color: product.color || "—",
              size: product.size || "—",
              material: product.material || "—",
            },
          ];
        },
      );

      const nestedVariants = await Promise.all(variantPromises);
      const allVariants = nestedVariants.flat().filter(Boolean);
      
      setSkuProducts(allVariants);
      dashboardCache = allVariants;
      dashboardCacheTime = Date.now();
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

  // Reset về trang 1 khi người dùng gõ tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleExportExcel = () => {
    if (!skuProducts || skuProducts.length === 0) {
      alert('Không có dữ liệu để xuất Excel!');
      return;
    }

    let csvContent = '\uFEFF'; 
    csvContent += 'STT,Mã SKU,Tên Sản Phẩm,Màu,Size,Chất Liệu,Số Lượng Tồn,Trạng Thái\n';

    skuProducts.forEach((item, idx) => {
      const stockVal = item.stock || 0;
      const status = stockVal === 0 ? 'HẾT HÀNG' : stockVal <= 15 ? 'SẮP HẾT' : 'ỔN ĐỊNH';
      const row = [
        idx + 1,
        `"${item.id || ''}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.color || '—')}"`,
        `"${(item.size || '—')}"`,
        `"${(item.material || '—')}"`,
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

  // Lọc sản phẩm theo từ khóa tìm kiếm
  const filteredProducts = Array.isArray(skuProducts) ? skuProducts.filter((item) => 
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Tính toán dữ liệu phân trang
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentTableData = filteredProducts.slice(startIndex, startIndex + pageSize);

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
            <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 2vw, 1.8rem)', color:'#1a1a1a' }}>Danh Mục SKU Master & Hiện Trạng Tồn Kho</h3>
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

        <table className="storage-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#faf8f5', color: '#78716c', fontSize: '12px', fontWeight: 700, textAlign: 'left' }}>
              <th style={{ padding: '12px 14px', width: '60px', textAlign: 'center' }}>STT</th>
              <th style={{ padding: '12px 14px', width: '100px' }}>HÌNH ẢNH</th>
              <th style={{ padding: '12px 14px' }}>MÃ SKU & SẢN PHẨM</th>
              <th style={{ padding: '12px 14px', width: '220px' }}>QUY CÁCH & BIẾN THỂ</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>SỐ LƯỢNG</th>
              <th style={{ padding: '12px 14px', textAlign: 'center' }}>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {currentTableData.length > 0 ? (
              currentTableData.map((prod, index) => {
                const stockVal = prod.stock;
                // Tính số thứ tự liên tục qua các trang
                const actualIndex = startIndex + index + 1;
                return (
                  <tr key={prod.variantId || prod.id} style={{ borderBottom: '1px solid #f2efeb' }}>
                    <td style={{ padding: '14px', textAlign: 'center', fontWeight: '600', color: '#78716c', fontSize: '12px' }}>
                      {actualIndex}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        onClick={() => setSelectedProduct(prod)}
                        onError={(e) => { e.target.style.display = 'none'; }}
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #eae6df', background: '#f3f4f6' }} 
                        title="Bấm để xem chi tiết"
                      />
                    </td>
                    <td style={{ padding: '14px', maxWidth: '300px', wordBreak: 'break-word' }}>
                      <strong 
                        onClick={() => setSelectedProduct(prod)}
                        style={{ color: '#1a1a1a', cursor: 'pointer', fontSize: '13px', display: 'block', marginBottom: '4px', lineHeight: '1.4' }}
                        title="Bấm để xem chi tiết"
                      >
                        {prod.name}
                      </strong>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>{prod.id}</span>
                    </td>
                    <td style={{ padding: '14px', fontSize: '12px', color: '#57534e', lineHeight: '1.5' }}>
                      <div><strong>Màu:</strong> {prod.color || "—"}</div>
                      <div><strong>Size:</strong> {prod.size || "—"}</div>
                      <div><strong>Chất liệu:</strong> {prod.material || "—"}</div>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}><strong>{stockVal}</strong> chiếc</td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
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
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  Không tìm thấy SKU nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PHÂN TRANG (PAGINATION) */}
        {filteredProducts.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginTop: '20px', padding: '0 8px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '13px', color: '#78716c' }}>
              Hiển thị từ <strong>{startIndex + 1}</strong> đến <strong>{Math.min(startIndex + pageSize, filteredProducts.length)}</strong> trong tổng số <strong>{filteredProducts.length}</strong> SKU
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '6px 12px', borderRadius: '6px', border: '1px solid #dcd6cd',
                  background: currentPage === 1 ? '#f5f2eb' : '#fff',
                  color: currentPage === 1 ? '#a8a29e' : '#1a1a1a',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px', fontWeight: 600
                }}
              >
                <ChevronLeft size={16} /> Trang trước
              </button>

              <span style={{ padding: '0 10px', fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                Trang {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '6px 12px', borderRadius: '6px', border: '1px solid #dcd6cd',
                  background: currentPage === totalPages ? '#f5f2eb' : '#fff',
                  color: currentPage === totalPages ? '#a8a29e' : '#1a1a1a',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '13px', fontWeight: 600
                }}
              >
                Trang sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
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
                <img 
                  src={selectedProduct.image} 
                  alt="" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eae6df', background: '#f3f4f6' }} 
                />
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