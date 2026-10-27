import React, { useState, useEffect } from 'react';
import { storageAPI, productAPI } from '../../services/api.js';
import { Search, Filter, Eye, X, Package } from 'lucide-react';

const SkuManagement = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [boLocTrangThai, setBoLocTrangThai] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedSku, setSelectedSku] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    const fetchInventoryAndVariants = async () => {
      try {
        setLoading(true);
        
        // 1. Gọi đồng thời API Tồn kho và API Danh sách sản phẩm Admin
        const [invRes, productsRes] = await Promise.all([
          storageAPI.getInventory().catch(() => ({ data: { inventories: [] } })),
          productAPI.getProductsAdmin ? productAPI.getProductsAdmin().catch(() => ({ data: { products: [] } })) : Promise.resolve({ data: { products: [] } })
        ]);

        const invBody = invRes?.data || {};
        const inventories = Array.isArray(invBody) 
          ? invBody 
          : (invBody.inventories || invBody.data?.inventories || invBody.items || invBody.data || []);
        
        const stockMap = new Map();

        // Mapping tồn kho vét cạn toàn bộ các trường hợp ID và SKU từ mảng inventory chung (Chuẩn ImportExportStock)
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
        const products = prodBody.products || prodBody.data || prodBody.rows || (Array.isArray(prodBody) ? prodBody : []);

        // 2. Duyệt qua từng sản phẩm để gọi API lấy Variants chi tiết nếu có
        const detailedSkuPromises = (Array.isArray(products) ? products : []).map(async (product) => {
          const prodId = product._id || product.id;
          const productName = product.name || 'Sản phẩm nội thất';
          const defaultImg = product.image || product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80';

          let variants = product.variants || [];
          try {
            if (productAPI.getProductVariantsAdmin) {
              const varRes = await productAPI.getProductVariantsAdmin(prodId).catch(() => null);
              const varBody = varRes?.data || {};
              if (Array.isArray(varBody.variants)) variants = varBody.variants;
              else if (Array.isArray(varBody.data)) variants = varBody.data;
              else if (Array.isArray(varBody)) variants = varBody;
            }
          } catch (e) {
            console.error("Lỗi gọi variants cho sản phẩm:", prodId);
          }

          if (Array.isArray(variants) && variants.length > 0) {
            return Promise.all(
              variants.map(async (v) => {
                const vId = v._id || v.id || v.variantId;
                const sku = v.sku || v.code || product.sku || 'SKU';
                
                let currentStock =
                  stockMap.get(String(vId).trim()) ??
                  stockMap.get(String(sku).trim()) ??
                  0;

                // Gọi vét cạn API chi tiết nếu chưa có trong mảng chung
                if (currentStock === 0 && vId) {
                  try {
                    const singleInvRes = await storageAPI.getInventoryByVariantId(vId).catch(() => null);
                    const singleBody = singleInvRes?.data || {};
                    const singleInv = singleBody.inventory || singleBody.data || singleBody;
                    const fetchedQty = singleInv.quantity ?? singleInv.stock ?? singleInv.availableStock;
                    if (fetchedQty !== undefined && fetchedQty !== null) {
                      currentStock = Number(fetchedQty);
                    }
                  } catch (e) {}
                }

                return {
                  id: String(sku).trim(),
                  vId: String(vId).trim(),
                  name: productName,
                  image: v.image || defaultImg,
                  color: v.color || v.attributes?.color || '—',
                  size: v.size || v.attributes?.size || '—',
                  material: v.material || v.attributes?.material || '—',
                  stock: Number(currentStock),
                  rawVariant: v
                };
              })
            );
          }

          const fallbackId = String(prodId).trim();
          const fallbackSku = String(product.sku || 'SKU').trim();
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

          return [{
            id: fallbackSku,
            vId: fallbackId,
            name: productName,
            image: defaultImg,
            color: product.color || '—',
            size: product.size || '—',
            material: product.material || '—',
            stock: Number(fallbackStock),
            rawVariant: product
          }];
        });

        const nestedSkuList = await Promise.all(detailedSkuPromises);
        const allSkuMeta = nestedSkuList.flat();

        const formatted = allSkuMeta.map(meta => ({
          ...meta,
          specs: [
            meta.color !== '—' ? `Màu: ${meta.color}` : '',
            meta.size !== '—' ? `Size: ${meta.size}` : '',
            meta.material !== '—' ? `Chất liệu: ${meta.material}` : ''
          ].filter(Boolean).join(' — ') || 'Tiêu chuẩn'
        }));

        setSkuProducts(formatted);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu SKU từ API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryAndVariants();
  }, []);

  const danhSachLoc = skuProducts.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(tuKhoaTimKiem.toLowerCase());
    const skuMatch = item.id.toLowerCase().includes(tuKhoaTimKiem.toLowerCase());
    const matchKeyword = nameMatch || skuMatch;

    if (boLocTrangThai === 'STABLE') return matchKeyword && item.stock > 15;
    if (boLocTrangThai === 'LOW') return matchKeyword && item.stock > 0 && item.stock <= 15;
    if (boLocTrangThai === 'OUT') return matchKeyword && item.stock === 0;

    return matchKeyword;
  });

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '60px', textAlign: 'center', color: '#78716c', fontFamily: "'Inter', sans-serif" }}>Đang đồng bộ dữ liệu SKU và Biến thể từ hệ thống...</div>;
  }

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '60px', padding: '16px clamp(12px, 3vw, 24px)', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* HEADER */}
      <header className="dash-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '11px', fontWeight: '700', color: '#78716c', letterSpacing: '0.05em' }}>QUẢN LÝ DANH MỤC SKU</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.7rem, 2.5vw, 2.2rem)', color: '#1a1a1a', fontWeight: 600, margin: '4px 0' }}>
            Quản Lý Danh Mục SKU & Biến Thể
          </h2>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Quản lý toàn bộ thông tin định danh sản phẩm và thuộc tính biến thể thời gian thực.</p>
        </div>

        {/* BỘ LỌC TRẠNG THÁI */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#78716c', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Filter size={14} /> Lọc:
          </span>
          <select 
            value={boLocTrangThai} 
            onChange={(e) => setBoLocTrangThai(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#fff', fontSize: '12px', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            <option value="ALL">Tất Cả Trạng Thái</option>
            <option value="STABLE">Ổn Định (&gt; 15)</option>
            <option value="LOW">Sắp Hết (1 - 15)</option>
            <option value="OUT">Hết Hàng (0)</option>
          </select>
        </div>
      </header>

      {/* THANH TÌM KIẾM & THỐNG KÊ NHANH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: '#fff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #eae6df', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '360px', background: '#faf8f5', padding: '9px 14px', borderRadius: '8px', border: '1px solid #e2ded4', boxSizing: 'border-box' }}>
          <Search size={16} color="#78716c" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã SKU..."
            value={tuKhoaTimKiem}
            onChange={(e) => setTuKhoaTimKiem(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>
        <span style={{ fontSize: '12px', color: '#78716c', fontWeight: 600 }}>Hiển thị tổng số <strong>{danhSachLoc.length}</strong> SKU</span>
      </div>

      {/* BẢNG DANH SÁCH SKU */}
      <section style={{ background: '#fff', border: '1px solid #eae6df', borderRadius: '12px', overflow: 'hidden', padding: '16px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Package size={18} color="#1c1c1c" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1a1a1a' }}>Danh Sách Biến Thể & SKU</h3>
        </div>

        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#faf8f5', color: '#78716c', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', width: '70px' }}>HÌNH ẢNH</th>
                <th style={{ padding: '12px 14px' }}>MÃ SKU & TÊN SẢN PHẨM</th>
                <th style={{ padding: '12px 14px' }}>QUY CÁCH & THUỘC TÍNH</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>TỒN KHO</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>TRẠNG THÁI</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {danhSachLoc.length > 0 ? (
                danhSachLoc.map((prod) => (
                  <tr key={prod.vId || prod.id} style={{ borderBottom: '1px solid #f2efeb' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eae6df', display: 'block' }} 
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80'; }}
                      />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                        {prod.id}
                      </span>
                      <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '13px', marginTop: '4px', lineHeight: '1.4' }}>
                        {prod.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#57534e' }}>
                      {prod.specs}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <strong style={{ fontSize: '13px', color: prod.stock > 0 ? '#16a34a' : '#dc2626' }}>
                        {prod.stock.toLocaleString()}
                      </strong> <span style={{ fontSize: '11px', color: '#78716c' }}>chiếc</span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{
                        background: prod.stock === 0 ? '#fef2f2' : prod.stock <= 15 ? '#fffbeb' : '#f0fdf4',
                        color: prod.stock === 0 ? '#dc2626' : prod.stock <= 15 ? '#d97706' : '#16a34a',
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        display: 'inline-block'
                      }}>
                        {prod.stock === 0 ? 'HẾT HÀNG' : prod.stock <= 15 ? 'SẮP HẾT' : 'ỔN ĐỊNH'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button 
                        onClick={() => { setSelectedSku(prod); setIsOpenModal(true); }}
                        style={{ background: '#fff', border: '1px solid #dcd6cd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}
                      >
                        <Eye size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Xem
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#8c857b', fontSize: '13px' }}>Không tìm thấy SKU nào phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL XEM CHI TIẾT SKU */}
      {isOpenModal && selectedSku && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', boxSizing: 'border-box' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '480px', borderRadius: '16px', padding: '24px', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eae6df', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1a1a1a' }}>Chi Tiết Thông Tin SKU</h3>
              <button onClick={() => setIsOpenModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
              <img 
                src={selectedSku.image} 
                alt="" 
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #eae6df', flexShrink: 0 }} 
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80'; }}
              />
              <div style={{ flex: 1, minWidth: '180px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>{selectedSku.id}</span>
                <h4 style={{ margin: '6px 0 4px', fontSize: '1rem', color: '#1a1a1a', lineHeight: '1.4' }}>{selectedSku.name}</h4>
                <span style={{ fontSize: '13px', color: selectedSku.stock > 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>Tồn kho: {selectedSku.stock} chiếc</span>
              </div>
            </div>

            <div style={{ background: '#faf8f5', padding: '14px', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '13px', marginBottom: '20px' }}>
              <div><strong>Màu sắc:</strong> {selectedSku.color}</div>
              <div><strong>Kích thước:</strong> {selectedSku.size}</div>
              <div style={{ gridColumn: '1 / -1' }}><strong>Chất liệu:</strong> {selectedSku.material}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eae6df', paddingTop: '14px' }}>
              <button onClick={() => setIsOpenModal(false)} style={{ padding: '9px 20px', borderRadius: '8px', background: '#1c1c1c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Đóng cửa sổ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkuManagement;