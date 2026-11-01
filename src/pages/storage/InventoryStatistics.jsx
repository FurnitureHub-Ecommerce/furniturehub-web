import React, { useEffect, useState } from 'react';
import { storageAPI, productAPI } from '../../services/api';
import { BarChart3, ShieldCheck, TrendingUp, PackageCheck, AlertTriangle, Layers, ArrowUpRight } from 'lucide-react';

const InventoryStatistics = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [totalExportedQty, setTotalExportedQty] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatisticsData = async () => {
      try {
        setLoading(true);

        // Gọi song song API kho, sản phẩm admin và lịch sử giao dịch
        const [invRes, productsRes, txRes] = await Promise.all([
          storageAPI.getInventory().catch(() => ({ data: { inventories: [] } })),
          productAPI.getProductsAdmin ? productAPI.getProductsAdmin().catch(() => ({ data: { products: [] } })) : Promise.resolve({ data: { products: [] } }),
          storageAPI.getInventoryTransactions ? storageAPI.getInventoryTransactions().catch(() => ({ data: { transactions: [] } })) : Promise.resolve({ data: { transactions: [] } })
        ]);

        // 1. Xử lý tồn kho (Chuẩn hóa vét cạn giống ImportExportStock)
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
              return Promise.all(
                variants.map(async (variant) => {
                  const variantId = variant._id || variant.id || variant.variantId;
                  const sku = variant.sku || variant.code || 'SKU';
                  
                  let currentStock =
                    stockMap.get(String(variantId).trim()) ??
                    stockMap.get(String(sku).trim()) ??
                    0;

                  // Gọi vét cạn API chi tiết nếu chưa có trong mảng chung
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

                  return {
                    id: String(sku).trim(),
                    variantId: String(variantId).trim(),
                    name: productName,
                    stock: Number(currentStock)
                  };
                })
              );
            }
          } catch (e) {
            console.error("Lỗi lấy variants:", e);
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
            variantId: fallbackId,
            name: productName,
            stock: Number(fallbackStock)
          }];
        });

        const nestedVariants = await Promise.all(variantPromises);
        const allVariants = nestedVariants.flat().filter(Boolean);
        setSkuProducts(allVariants);

        // 2. Xử lý thống kê sản phẩm bán được nhiều nhất từ lịch sử giao dịch (transactions)
        const txBody = txRes?.data || {};
        const txData = txBody.transactions || txBody.data || txBody.rows || (Array.isArray(txBody) ? txBody : []);
        
        const exportMap = new Map();
        let totalExpCount = 0;

        (Array.isArray(txData) ? txData : []).forEach(tx => {
          const typeStr = String(tx.type || tx.action || '').toUpperCase();
          if (typeStr.includes('EXPORT') || typeStr.includes('XUẤT') || typeStr.includes('DEDUCTION')) {
            const qty = Number(tx.quantity || tx.amount || 0);
            totalExpCount += qty;

            const variant = tx.variantId || tx.variant || {};
            const product = variant.productId || tx.product || {};
            const sku = variant.sku || 'SKU-001';
            const prodName = product.name || tx.productName || variant.name || 'Sản phẩm nội thất';

            const key = sku;
            if (exportMap.has(key)) {
              exportMap.set(key, { ...exportMap.get(key), sold: exportMap.get(key).sold + qty });
            } else {
              exportMap.set(key, { id: sku, name: prodName, sold: qty });
            }
          }
        });

        setTotalExportedQty(totalExpCount);
        const sortedBestSellers = Array.from(exportMap.values())
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 5);
        setBestSellers(sortedBestSellers);

      } catch (error) {
        console.error('Lỗi tải dữ liệu thống kê:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatisticsData();
  }, []);

  const variants = skuProducts;
  const totalSku = variants.length;
  const stockItems = variants.filter((variant) => variant.stock !== null && variant.stock !== undefined);
  const totalStock = stockItems.reduce((total, variant) => total + Number(variant.stock || 0), 0);

  const stableItems = stockItems.filter((v) => Number(v.stock) > 15);
  const lowStockItems = stockItems.filter((v) => Number(v.stock) > 0 && Number(v.stock) <= 15);
  const outOfStockItems = stockItems.filter((v) => Number(v.stock) === 0);

  const getPercent = (count) => (totalSku > 0 ? Math.round((count / totalSku) * 100) : 0);

  const topStockProducts = [...stockItems]
    .sort((a, b) => Number(b.stock) - Number(a.stock))
    .slice(0, 5);

  const storageMetrics = [
    { label: 'TỔNG SỐ SKU', value: loading ? 'Đang tải...' : totalSku, sub: 'Đồng bộ từ dữ liệu sản phẩm', icon: <Layers size={22} color="#2563eb" /> },
    { label: 'HÀNG TỒN KHO (TỔNG)', value: loading ? 'Đang tải...' : totalStock.toLocaleString(), sub: 'Tổng số lượng thực tế trong kho', icon: <PackageCheck size={22} color="#16a34a" /> },
    { label: 'TỔNG ĐÃ XUẤT BÁN', value: loading ? 'Đang tải...' : totalExportedQty.toLocaleString(), sub: 'Tổng số lượng xuất kho thực tế', icon: <ArrowUpRight size={22} color="#dc2626" /> },
    { label: 'CẢNH BÁO TỒN THẤP', value: loading ? 'Đang tải...' : `${lowStockItems.length} SKU`, sub: 'Sản phẩm dưới mức tối thiểu', icon: <AlertTriangle size={22} color="#d97706" /> },
  ];

  const maxCount = Math.max(stableItems.length, lowStockItems.length, outOfStockItems.length, 5);
  const maxTopStock = topStockProducts.length > 0 ? Math.max(...topStockProducts.map(p => Number(p.stock) || 1)) : 100;
  const chartMaxX = Math.ceil(maxTopStock * 1.2 / 10) * 10 || 100;

  const maxBestSeller = bestSellers.length > 0 ? Math.max(...bestSellers.map(p => Number(p.sold) || 1)) : 100;
  const bestSellerMaxX = Math.ceil(maxBestSeller * 1.2 / 10) * 10 || 100;

  const barColors = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];
  const sellerColors = ['#dc2626', '#ea580c', '#d97706', '#16a34a', '#2563eb'];

  return (
    <div className="dashboard-main" style={{ paddingBottom: '40px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header trang thống kê */}
      <header className="dash-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '11px', fontWeight: '700', color: '#78716c', letterSpacing: '0.05em' }}>THỐNG KÊ & TỔNG HỢP HỆ THỐNG</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#1a1a1a', fontWeight: 600, margin: '4px 0 8px 0' }}>
            Thống Kê Nâng Cao & Tổng Hợp
          </h2>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Phân tích xu hướng biến động, hàng tồn kho và sản phẩm bán chạy theo thời gian thực.</p>
        </div>
      </header>

      {/* Các thẻ Metric tổng quan (4 cột) */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {storageMetrics.map((item, idx) => (
          <div key={idx} className="metric-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eae6df', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#78716c', letterSpacing: '0.05em' }}>{item.label}</h4>
              <div style={{ padding: '8px', background: '#faf8f5', borderRadius: '8px', display: 'flex' }}>{item.icon}</div>
            </div>
            <div className="metric-val" style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>{item.value}</div>
            <p style={{ margin: 0, fontSize: '12px', color: '#78716c' }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Hàng 1: Biểu đồ trạng thái & Chỉ số vận hành */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Biểu đồ Cột Đứng: Phân Phối Trạng Thái Tồn Kho */}
        <section className="sku-section" style={{ margin: 0, background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eae6df' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={20} color="#1c1c1c" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a' }}>Phân Phối Trạng Thái Tồn Kho</h3>
            </div>
            <span style={{ fontSize: '12px', background: '#faf8f5', color: '#57534e', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', border: '1px solid #eae6df' }}>
              Tổng SKU: {totalSku}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '13px', color: '#57534e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#16a34a', display: 'inline-block' }}></span>
              <span>Ổn định ({stableItems.length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#d97706', display: 'inline-block' }}></span>
              <span>Sắp hết ({lowStockItems.length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#dc2626', display: 'inline-block' }}></span>
              <span>Hết hàng ({outOfStockItems.length})</span>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '210px' }}>
            <svg viewBox="0 0 450 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line x1="40" y1="20" x2="430" y2="20" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="70" x2="430" y2="70" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="120" x2="430" y2="120" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="170" x2="430" y2="170" stroke="#eae6df" strokeWidth="1.5" />

              <text x="30" y="24" textAnchor="end" fill="#78716c" fontSize="10">{maxCount}</text>
              <text x="30" y="74" textAnchor="end" fill="#78716c" fontSize="10">{Math.round(maxCount * 0.75)}</text>
              <text x="30" y="124" textAnchor="end" fill="#78716c" fontSize="10">{Math.round(maxCount * 0.25)}</text>
              <text x="30" y="174" textAnchor="end" fill="#78716c" fontSize="10">0</text>

              {/* Cột 1 */}
              {(() => {
                const h = Math.round((stableItems.length / maxCount) * 150);
                const y = 170 - h;
                return (
                  <g>
                    <rect x="90" y={y} width="55" height={h} rx="4" fill="#16a34a" />
                    <text x="117.5" y={y - 8} textAnchor="middle" fill="#1a1a1a" fontSize="12" fontWeight="700">{stableItems.length}</text>
                    <text x="117.5" y="190" textAnchor="middle" fill="#57534e" fontSize="12" fontWeight="600">Ổn định</text>
                  </g>
                );
              })()}

              {/* Cột 2 */}
              {(() => {
                const h = Math.round((lowStockItems.length / maxCount) * 150);
                const y = 170 - h;
                return (
                  <g>
                    <rect x="210" y={y} width="55" height={h} rx="4" fill="#d97706" />
                    <text x="237.5" y={y - 8} textAnchor="middle" fill="#1a1a1a" fontSize="12" fontWeight="700">{lowStockItems.length}</text>
                    <text x="237.5" y="190" textAnchor="middle" fill="#57534e" fontSize="12" fontWeight="600">Sắp hết</text>
                  </g>
                );
              })()}

              {/* Cột 3 */}
              {(() => {
                const h = Math.round((outOfStockItems.length / maxCount) * 150);
                const y = 170 - Math.max(h, 3);
                return (
                  <g>
                    <rect x="330" y={y} width="55" height={Math.max(h, 3)} rx="4" fill="#dc2626" />
                    <text x="357.5" y={y - 8} textAnchor="middle" fill="#1a1a1a" fontSize="12" fontWeight="700">{outOfStockItems.length}</text>
                    <text x="357.5" y="190" textAnchor="middle" fill="#57534e" fontSize="12" fontWeight="600">Hết hàng</text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </section>

        {/* Chỉ số vận hành & An toàn */}
        <section className="sku-section" style={{ margin: 0, background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eae6df', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldCheck size={20} color="#16a34a" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a' }}>Chỉ Số Vận Hành & An Toàn</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Đánh giá mức độ sẵn sàng và độ tin cậy của dữ liệu kho hàng.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#333' }}>
            <div style={{ padding: '14px 16px', background: '#faf8f5', border: '1px solid #eae6df', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Tỷ lệ hàng sẵn sàng:</span>
              <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '15px' }}>{totalSku ? `${100 - getPercent(outOfStockItems.length)}%` : '0%'}</span>
            </div>
            <div style={{ padding: '14px 16px', background: '#faf8f5', border: '1px solid #eae6df', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Độ chính xác dữ liệu:</span>
              <span style={{ fontWeight: '700', color: '#1c1c1c', fontSize: '15px' }}>100% Đồng bộ</span>
            </div>
          </div>
        </section>

      </div>

      {/* Hàng 2: Top 5 Tồn Kho & Top 5 Sản Phẩm Bán Chạy (Bán Được Nhiều Nhất) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* 1. Biểu đồ Top 5 Tồn Kho Nhiều Nhất */}
        <section className="sku-section" style={{ margin: 0, background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eae6df', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <TrendingUp size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a' }}>Top 5 Sản Phẩm Tồn Kho Nhiều Nhất</h3>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '175px' }}>
            <svg viewBox="0 0 400 170" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line x1="90" y1="5" x2="90" y2="145" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="160" y1="5" x2="160" y2="145" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="230" y1="5" x2="230" y2="145" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="300" y1="5" x2="300" y2="145" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="370" y1="5" x2="370" y2="145" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />

              <text x="90" y="162" textAnchor="middle" fill="#78716c" fontSize="10">0</text>
              <text x="160" y="162" textAnchor="middle" fill="#78716c" fontSize="10">{Math.round(chartMaxX * 0.25)}</text>
              <text x="230" y="162" textAnchor="middle" fill="#78716c" fontSize="10">{Math.round(chartMaxX * 0.5)}</text>
              <text x="300" y="162" textAnchor="middle" fill="#78716c" fontSize="10">{Math.round(chartMaxX * 0.75)}</text>
              <text x="370" y="162" textAnchor="middle" fill="#78716c" fontSize="10">{chartMaxX}</text>

              {topStockProducts.map((prod, idx) => {
                const stockVal = Number(prod.stock) || 0;
                const barMaxWidth = 280;
                const barW = Math.round((stockVal / chartMaxX) * barMaxWidth);
                const yPos = 10 + idx * 28;
                const barColor = barColors[idx % barColors.length];

                return (
                  <g key={idx}>
                    <text x="82" y={yPos + 11} textAnchor="end" fill="#333" fontSize="11" fontWeight="700">#{idx + 1}</text>
                    <rect x="90" y={yPos} width={Math.max(barW, 4)} height="16" rx="4" fill={barColor} />
                    <text x={90 + Math.max(barW, 4) + 8} y={yPos + 12} fill={barColor} fontSize="11" fontWeight="700">{stockVal}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid #eae6df', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#78716c', textTransform: 'uppercase', marginBottom: '2px' }}>Chú thích:</span>
            {topStockProducts.map((prod, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: barColors[idx % barColors.length], display: 'inline-block', flexShrink: 0 }}></span>
                <span style={{ fontWeight: '600', color: '#1a1a1a' }}>#{idx + 1} ({prod.id}):</span>
                <span style={{ color: '#57534e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={prod.name}>{prod.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Thống kê Top 5 Sản Phẩm Bán Được Nhiều Nhất (Bán Chạy) */}
        <section className="sku-section" style={{ margin: 0, background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eae6df', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <ArrowUpRight size={20} color="#dc2626" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a' }}>Top 5 Sản Phẩm Bán Chạy (Xuất Nhiều Nhất)</h3>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '175px' }}>
            <svg viewBox="0 0 400 170" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line x1="90" y1="5" x2="90" y2="145" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="160" y1="5" x2="160" y2="145" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="230" y1="5" x2="230" y2="145" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="300" y1="5" x2="300" y2="145" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="370" y1="5" x2="370" y2="145" stroke="#f2efeb" strokeWidth="1" strokeDasharray="3 3" />

              <text x="90" y="162" textAnchor="middle" fill="#78716c" fontSize="10">0</text>
              <text x="160" y="162" textAnchor="middle" fill="#78716c" fontSize="10">{Math.round(bestSellerMaxX * 0.25)}</text>
              <text x="230" y="162" textAnchor="middle" fill="#78716c" fontSize="10">{Math.round(bestSellerMaxX * 0.5)}</text>
              <text x="300" y="162" textAnchor="middle" fill="#78716c" fontSize="10">{Math.round(bestSellerMaxX * 0.75)}</text>
              <text x="370" y="162" textAnchor="middle" fill="#78716c" fontSize="10">{bestSellerMaxX}</text>

              {bestSellers.length > 0 ? (
                bestSellers.map((prod, idx) => {
                  const soldVal = Number(prod.sold) || 0;
                  const barMaxWidth = 280;
                  const barW = Math.round((soldVal / bestSellerMaxX) * barMaxWidth);
                  const yPos = 10 + idx * 28;
                  const sellerColor = sellerColors[idx % sellerColors.length];

                  return (
                    <g key={idx}>
                      <text x="82" y={yPos + 11} textAnchor="end" fill="#333" fontSize="11" fontWeight="700">#{idx + 1}</text>
                      <rect x="90" y={yPos} width={Math.max(barW, 4)} height="16" rx="4" fill={sellerColor} />
                      <text x={90 + Math.max(barW, 4) + 8} y={yPos + 12} fill={sellerColor} fontSize="11" fontWeight="700">{soldVal}</text>
                    </g>
                  );
                })
              ) : (
                <text x="200" y="85" textAnchor="middle" fill="#78716c" fontSize="12">Chưa có giao dịch xuất kho nào.</text>
              )}
            </svg>
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid #eae6df', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#78716c', textTransform: 'uppercase', marginBottom: '2px' }}>Chú thích sản phẩm bán chạy:</span>
            {bestSellers.length > 0 ? (
              bestSellers.map((prod, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: sellerColors[idx % sellerColors.length], display: 'inline-block', flexShrink: 0 }}></span>
                  <span style={{ fontWeight: '600', color: '#1a1a1a' }}>#{idx + 1} ({prod.id}):</span>
                  <span style={{ color: '#57534e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={prod.name}>{prod.name} ({prod.sold} đã bán)</span>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '12px', color: '#78716c' }}>Hệ thống chưa ghi nhận sản phẩm xuất kho.</span>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default InventoryStatistics;