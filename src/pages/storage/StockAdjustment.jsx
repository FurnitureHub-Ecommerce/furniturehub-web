import React, { useEffect, useState } from 'react';
import { storageAPI, productAPI } from '../../services/api';
import { Sliders, CheckCircle2, ShieldAlert, CheckCircle } from 'lucide-react';

const StockAdjustment = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [skuChon, setSkuChon] = useState('');
  const [soLuong, setSoLuong] = useState('');
  const [lyDo, setLyDo] = useState('');
  const [thongBao, setThongBao] = useState('');

  useEffect(() => {
    const fetchVariants = async () => {
      try {
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
                  id: variantId,
                  sku: sku,
                  name: productName,
                  stock: currentStock
                };
              });
            }
          } catch (e) {
            console.error("Lỗi:", e);
          }

          return [{
            id: prodId,
            sku: product.sku || 'SKU',
            name: productName,
            stock: stockMap.get(String(prodId)) ?? 0
          }];
        });

        const nestedVariants = await Promise.all(variantPromises);
        const list = nestedVariants.flat().filter(Boolean);
        setSkuProducts(list);
        if (list.length > 0) setSkuChon(list[0].id);
      } catch (error) {
        console.error('Lỗi tải danh sách SKU:', error);
        setThongBao('Không thể tải danh sách SKU từ hệ thống.');
      }
    };
    fetchVariants();
  }, []);

  const xuLyGui = async (e) => {
    e.preventDefault();
    if (!soLuong || !lyDo || !skuChon) {
      setThongBao('Vui lòng nhập đầy đủ thông tin điều chỉnh!');
      return;
    }

    try {
      const payload = {
        quantity: Number(soLuong),
        note: `Điều chỉnh tồn kho: ${lyDo}`
      };
      // Gọi API xuất/nhập điều chỉnh tùy theo số lượng
      if (Number(soLuong) >= 0) {
        await storageAPI.importInventory(skuChon, payload);
      } else {
        await storageAPI.exportInventory(skuChon, { ...payload, quantity: Math.abs(Number(soLuong)) });
      }

      setThongBao(`Đã tạo phiếu điều chỉnh thành công!`);
      setSoLuong('');
      setLyDo('');
    } catch (error) {
      console.error("Lỗi điều chỉnh:", error);
      setThongBao('Lỗi: Không thể thực hiện điều chỉnh kho từ Backend.');
    }
  };

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '60px' }}>
      <header className="dash-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>ĐỐI SOÁT & KIỂM KÊ KHO</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600, margin: '4px 0 8px 0' }}>
            Điều Chỉnh Tồn Kho Thực Tế
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Cập nhật lại số lượng hàng hóa khi có chênh lệch kiểm kê định kỳ hoặc phát sinh lỗi.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        <section className="sku-section" style={{ margin: 0, background: '#fff', padding: '28px', borderRadius: '12px', border: '1px solid #eae6df', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #eae6df', paddingBottom: '14px' }}>
            <Sliders size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1c1c1c' }}>Tạo Phiếu Điều Chỉnh</h3>
          </div>

          {thongBao && (
            <div style={{ padding: '12px 16px', background: thongBao.includes('thành công') ? '#f0fdf4' : '#fef2f2', color: thongBao.includes('thành công') ? '#16a34a' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${thongBao.includes('thành công') ? '#bbf7d0' : '#fecaca'}` }}>
              <CheckCircle2 size={16} /> {thongBao}
            </div>
          )}

          <form onSubmit={xuLyGui} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#78716c', marginBottom: '6px', letterSpacing: '0.05em' }}>CHỌN MÃ SKU *</label>
              <select
                value={skuChon}
                onChange={(e) => setSkuChon(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#faf8f5', fontSize: '13px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
              >
                {skuProducts.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.sku}] {item.name} — Tồn kho: {item.stock}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#78716c', marginBottom: '6px', letterSpacing: '0.05em' }}>SỐ LƯỢNG THAY ĐỔI *</label>
              <input
                type="number"
                placeholder="Nhập số lượng..."
                value={soLuong}
                onChange={(e) => setSoLuong(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#faf8f5', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#78716c', marginBottom: '6px', letterSpacing: '0.05em' }}>LÝ DO ĐIỀU CHỈNH *</label>
              <textarea
                placeholder="Nhập chi tiết lý do điều chỉnh kho..."
                value={lyDo}
                onChange={(e) => setLyDo(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#faf8f5', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px', width: '100%', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              Xác Nhận Điều Chỉnh Kho
            </button>
          </form>
        </section>

        <section className="sku-section" style={{ margin: 0, background: '#faf8f5', padding: '28px', borderRadius: '12px', border: '1px solid #eae6df', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eae6df', paddingBottom: '14px' }}>
            <ShieldAlert size={20} color="#d97706" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1c1c1c' }}>Quy Định Kiểm Kê & Điều Chỉnh</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ background: '#fef3c7', padding: '4px', borderRadius: '50%', display: 'flex', marginTop: '2px' }}>
                <CheckCircle size={14} color="#d97706" />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#57534e', lineHeight: '1.5' }}>
                Mọi thay đổi số lượng tồn kho đều phải có biên bản kiểm kê kèm chữ ký xác nhận của thủ kho.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StockAdjustment;