import React, { useState, useEffect } from 'react';
import { storageAPI, productAPI } from '../../services/api.js';
import { PackageCheck } from 'lucide-react';

const StockAvailability = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boLoc, setBoLoc] = useState('ALL');
  const [trangHienTai, setTrangHienTai] = useState(1);
  const soLuongMoiTrang = 8;

  useEffect(() => {
    const fetchStockAvailability = async () => {
      try {
        setLoading(true);
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

                return {
                  id: sku,
                  name: productName,
                  image: variant.image || productImage,
                  specs: [variant.color, variant.size, variant.material].filter(Boolean).join(' — ') || 'Tiêu chuẩn',
                  stock: currentStock
                };
              });
            }
          } catch (e) {
            console.error("Lỗi:", e);
          }

          return [{
            id: product.sku || 'SKU',
            name: productName,
            image: productImage,
            specs: 'Tiêu chuẩn',
            stock: stockMap.get(String(prodId)) ?? 0
          }];
        });

        const nestedVariants = await Promise.all(variantPromises);
        setSkuProducts(nestedVariants.flat().filter(Boolean));
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStockAvailability();
  }, []);

  const danhSachLoc = skuProducts.filter((item) => {
    if (boLoc === 'AVAILABLE') return item.stock > 0;
    if (boLoc === 'OUT') return item.stock === 0;
    return true;
  });

  const tongSoTrang = Math.ceil(danhSachLoc.length / soLuongMoiTrang) || 1;
  const chiSoBatDau = (trangHienTai - 1) * soLuongMoiTrang;
  const danhSachPhanTrang = danhSachLoc.slice(chiSoBatDau, chiSoBatDau + soLuongMoiTrang);

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: "60px" }}>
      <header className="dash-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>TÌNH TRẠNG SẴN CÓ THỜI GIAN THỰC</span>
          <h2 style={{  fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600, margin: '4px 0 8px 0' }}>
            Kiểm Tra Tình Trạng Sẵn Có Của Hàng Hóa
          </h2>
          <p style={{ color: '#666', fontSize: '13px', margin: 0,  }}>Theo dõi nhanh số lượng hàng có thể xuất bán hoặc phân bổ ngay tại các sản phẩm.</p>
        </div>
      </header>

      <section className="sku-section" style={{ background: 'transparent', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={28} color="#1c1c1c" />
            <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600, color: '#1c1c1c',  fontFamily: "'Playfair Display', serif"}}>Ma Trận Hàng Sẵn Sàng</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px',  fontFamily: "'Playfair Display', serif" }}>
            <button className={`filter-btn ${boLoc === 'ALL' ? 'active' : ''}`} onClick={() => { setBoLoc('ALL'); setTrangHienTai(1); }} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: boLoc === 'ALL' ? '#1c1c1c' : '#fff', color: boLoc === 'ALL' ? '#fff' : '#666', border: '1px solid #e2ded8', fontWeight: 600 }}>Tất Cả</button>
            <button className={`filter-btn ${boLoc === 'AVAILABLE' ? 'active' : ''}`} onClick={() => { setBoLoc('AVAILABLE'); setTrangHienTai(1); }} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: boLoc === 'AVAILABLE' ? '#1c1c1c' : '#fff', color: boLoc === 'AVAILABLE' ? '#fff' : '#666', border: '1px solid #e2ded8', fontWeight: 600 }}>Còn Hàng</button>
            <button className={`filter-btn ${boLoc === 'OUT' ? 'active' : ''}`} onClick={() => { setBoLoc('OUT'); setTrangHienTai(1); }} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: boLoc === 'OUT' ? '#1c1c1c' : '#fff', color: boLoc === 'OUT' ? '#fff' : '#666', border: '1px solid #e2ded8', fontWeight: 600 }}>Hết Hàng</button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#888' }}>Đang tải dữ liệu từ API Backend...</div>
        ) : (
          <div>
            <table className="storage-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eae6df' }}>
              <thead>
                <tr style={{ background: '#faf8f5', color: '#78716c', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', width: '100px' }}>HÌNH ẢNH</th>
                  <th style={{ padding: '14px 16px' }}>MÃ SKU & TÊN SẢN PHẨM</th>
                  <th style={{ padding: '14px 16px' }}>QUY CÁCH</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>TỒN </th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {danhSachPhanTrang.length > 0 ? (
                  danhSachPhanTrang.map((prod, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f2efeb' }}>
                      <td style={{ padding: '16px' }}>
                        <img src={prod.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eae6df' }} />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <strong style={{ color: '#1c1c1c', fontWeight: 600 }}>{prod.name}</strong>
                        <br />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>{prod.id}</span>
                      </td>
                      <td style={{ padding: '16px' }}>{prod.specs}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <strong style={{ color: prod.stock > 0 ? '#16a34a' : '#dc2626' }}>{prod.stock.toLocaleString()}</strong> cái
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {prod.stock > 0 ? (
                          <span style={{ color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '11px' }}>Sẵn Sàng </span>
                        ) : (
                          <span style={{ color: '#dc2626', background: '#fef2f2', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '11px' }}>Hết Hàng</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#8c857b' }}>Không tìm thấy sản phẩm phù hợp.</td></tr>
                )}
              </tbody>
            </table>

            {tongSoTrang > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                <button onClick={() => setTrangHienTai(p => Math.max(p - 1, 1))} disabled={trangHienTai === 1} style={{ padding: '6px 12px', cursor: 'pointer' }}>Trước</button>
                <span>Trang {trangHienTai} / {tongSoTrang}</span>
                <button onClick={() => setTrangHienTai(p => Math.min(p + 1, tongSoTrang))} disabled={trangHienTai === tongSoTrang} style={{ padding: '6px 12px', cursor: 'pointer' }}>Sau</button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default StockAvailability;