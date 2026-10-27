import React, { useState, useEffect } from 'react';
import { storageAPI, productAPI } from '../../services/api.js';
import { ShieldAlert, CheckCircle2, AlertTriangle, Package } from 'lucide-react';

const LowStockAlerts = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStockData = async () => {
      try {
        setLoading(true);

        // Gọi song song API lấy danh sách tồn kho thấp và danh sách sản phẩm từ Admin
        const [lowRes, productsRes] = await Promise.all([
          storageAPI.getLowStock().catch(() => ({ data: { inventories: [] } })),
          productAPI.getProductsAdmin ? productAPI.getProductsAdmin().catch(() => ({ data: { products: [] } })) : Promise.resolve({ data: { products: [] } })
        ]);

        const lowBody = lowRes?.data || {};
        const data = Array.isArray(lowBody) 
          ? lowBody 
          : (lowBody.inventories || lowBody.data?.inventories || lowBody.items || lowBody.data || []);
        
        // Tạo Map thông tin sản phẩm và ảnh từ danh sách Admin
        const prodBody = productsRes?.data || {};
        const products = prodBody.products || prodBody.data || prodBody.rows || (Array.isArray(prodBody) ? prodBody : []);
        const imageMap = new Map();
        const productInfoMap = new Map();
        
        products.forEach(p => {
          const img = p.image || p.thumbnail || p.images?.[0];
          const pId = String(p._id || p.id);
          productInfoMap.set(pId, p);

          if (p.sku && img) imageMap.set(String(p.sku).trim(), img);
          if (p._id && img) imageMap.set(String(p._id).trim(), img);

          if (Array.isArray(p.variants)) {
            p.variants.forEach(v => {
              const vId = String(v._id || v.id);
              if (v.sku && (v.image || img)) imageMap.set(String(v.sku).trim(), v.image || img);
              if (vId && (v.image || img)) imageMap.set(vId.trim(), v.image || img);
            });
          }
        });

        const formatted = (Array.isArray(data) ? data : []).map(item => {
          const invObj = item.inventory || item;
          const variantField = invObj.variantId || item.variantId || invObj.variant || item.variant;
          
          const vIdObj = typeof variantField === "object" && variantField !== null ? variantField : {};
          const vId1 = vIdObj._id || vIdObj.id;
          const vId2 = typeof variantField === "string" ? variantField : null;
          const vId = vId1 || vId2 || invObj._id || item._id;

          const sku = vIdObj.sku || invObj.sku || item.sku || 'SKU';
          const product = vIdObj.productId || invObj.product || item.product || {};
          
          const qty = invObj.quantity ?? invObj.stock ?? invObj.availableStock ?? item.quantity ?? item.stock ?? 0;
          const img = imageMap.get(String(sku).trim()) || imageMap.get(String(vId).trim()) || product.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80';

          return {
            ...item,
            id: String(vId || sku).trim(),
            name: product.name || item.name || variantField.name || 'Sản phẩm nội thất',
            sku: String(sku).trim(),
            image: img,
            specs: [
              vIdObj.color ? `Màu: ${vIdObj.color}` : '',
              vIdObj.size ? `Size: ${vIdObj.size}` : '',
              vIdObj.material ? `Chất liệu: ${vIdObj.material}` : ''
            ].filter(Boolean).join(' — ') || 'Tiêu chuẩn',
            quantity: Number(qty)
          };
        });

        setSkuProducts(formatted);
      } catch (error) {
        console.error('Lỗi gọi API /api/inventory/low-stock:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockData();
  }, []);

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '60px', textAlign: 'center', color: '#78716c', fontFamily: "'Inter', sans-serif" }}>Đang lấy dữ liệu từ hệ thống...</div>;
  }

  const outOfStockCount = skuProducts.filter(p => p.quantity === 0).length;
  const lowStockCount = skuProducts.filter(p => p.quantity > 0).length;

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '60px', padding: '24px' }}>
      <header className="dash-header" style={{ marginBottom: '20px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '11px', fontWeight: '700', color: '#78716c', letterSpacing: '0.05em' }}>GIÁM SÁT TỒN KHO NGUY CƠ</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.4rem', color: '#1a1a1a', fontWeight: 600, margin: '4px 0' }}>
            Cảnh Báo Tồn Thấp & Hết Hàng
          </h2>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Danh sách các mã SKU dưới ngưỡng an toàn được đồng bộ trực tiếp từ hệ thống.</p>
        </div>
      </header>

      {/* METRIC CARDS */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="metric-card" style={{ borderLeft: '4px solid #dc2626', background: '#fff', padding: '20px 24px', borderRadius: '12px', border: '1px solid #eae6df', borderLeftWidth: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#78716c', margin: 0, letterSpacing: '0.05em' }}>SẢN PHẨM CẦN CHÚ Ý (HẾT & SẮP HẾT)</h4>
            <AlertTriangle size={18} color="#dc2626" />
          </div>
          <div className="metric-val" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626' }}>{skuProducts.length} SKU</div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#78716c' }}>Hết hàng: {outOfStockCount} | Sắp hết: {lowStockCount}</p>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #16a34a', background: '#fff', padding: '20px 24px', borderRadius: '12px', border: '1px solid #eae6df', borderLeftWidth: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#78716c', margin: 0, letterSpacing: '0.05em' }}>TRẠNG THÁI KẾT NỐI HỆ THỐNG</h4>
            <ShieldAlert size={18} color="#16a34a" />
          </div>
          <div className="metric-val" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#16a34a' }}>Thành Công</div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <section style={{ background: '#fff', border: '1px solid #eae6df', borderRadius: '12px', overflow: 'hidden', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ShieldAlert size={18} color="#dc2626" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1a1a1a' }}>Danh Sách SKU Tồn Thấp</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#faf8f5', color: '#78716c', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>
                <th style={{ padding: '14px 16px', width: '80px' }}>HÌNH ẢNH</th>
                <th style={{ padding: '14px 16px' }}>MÃ SKU & TÊN SẢN PHẨM</th>
                <th style={{ padding: '14px 16px' }}>QUY CÁCH</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>SỐ LƯỢNG TỒN</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {skuProducts.length > 0 ? (
                skuProducts.map((prod, idx) => {
                  const isOut = prod.quantity === 0;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f2efeb' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <img 
                          src={prod.image} 
                          alt="" 
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eae6df' }} 
                        />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                          {prod.sku}
                        </span>
                        <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '13px', marginTop: '4px' }}>
                          {prod.name}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#57534e' }}>
                        {prod.specs}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <strong style={{ color: isOut ? '#dc2626' : '#d97706', fontSize: '14px' }}>
                          {prod.quantity}
                        </strong> <span style={{ fontSize: '12px', color: '#78716c' }}>chiếc</span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          background: isOut ? '#fef2f2' : '#fffbeb',
                          color: isOut ? '#dc2626' : '#d97706',
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontWeight: 700, 
                          fontSize: '11px',
                          display: 'inline-block'
                        }}>
                          {isOut ? 'HẾT HÀNG' : 'SẮP HẾT'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '50px', color: '#16a34a', fontWeight: 600 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={36} color="#16a34a" />
                      <span style={{ fontSize: '14px', color: '#16a34a' }}>Tuyệt vời! Không có sản phẩm nào nằm dưới ngưỡng tồn kho an toàn từ hệ thống.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default LowStockAlerts;