import React, { useEffect, useState } from 'react';
import { loadStorageVariants } from '../../services/storageData';
import { BarChart3, ShieldCheck, TrendingUp, PackageCheck, AlertTriangle, Layers } from 'lucide-react';

const InventoryStatistics = () => {
  const [inventory, setInventory] = useState(null);

  useEffect(() => {
    loadStorageVariants().then((variants) => setInventory(variants));
  }, []);

  const variants = inventory || [];
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
    { label: 'TỔNG SỐ SKU', value: inventory === null ? 'Đang tải...' : totalSku, sub: 'Đồng bộ từ Database sản phẩm', icon: <Layers size={22} color="#2563eb" /> },
    { label: 'HÀNG TỒN KHO (TỔNG)', value: stockItems.length ? totalStock.toLocaleString() : 'Chưa cập nhật', sub: 'Tổng số lượng thực tế trong kho', icon: <PackageCheck size={22} color="#16a34a" /> },
    { label: 'CẢNH BÁO TỒN THẤP', value: stockItems.length ? `${lowStockItems.length} SKU` : 'Chưa cập nhật', sub: 'Sản phẩm dưới mức tối thiểu', icon: <AlertTriangle size={22} color="#d97706" /> },
  ];

  const maxCount = Math.max(stableItems.length, lowStockItems.length, outOfStockItems.length, 5);
  const maxTopStock = topStockProducts.length > 0 ? Math.max(...topStockProducts.map(p => Number(p.stock) || 1)) : 100;
  const chartMaxX = Math.ceil(maxTopStock * 1.2 / 10) * 10;

  // Danh sách màu sắc tương ứng cho từng sản phẩm trong Top 5
  const barColors = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="dashboard-main" style={{ paddingBottom: '40px' }}>
      {/* Header trang thống kê */}
      <header className="dash-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>THỐNG KÊ & TỔNG HỢP HỆ THỐNG</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600, margin: '4px 0 8px 0' }}>
            Thống Kê Nâng Cao & Tổng Hợp
          </h2>
          <p style={{ color: '#4b5563', fontSize: '15px' }}>Phân tích xu hướng biến động và các chỉ số vận hành sản phẩm quan trọng theo thời gian thực.</p>
        </div>
      </header>

      {/* Các thẻ Metric tổng quan */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {storageMetrics.map((item, idx) => (
          <div key={idx} className="metric-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>{item.label}</h4>
              <div style={{ padding: '8px', background: '#f3f4f6', borderRadius: '8px', display: 'flex' }}>{item.icon}</div>
            </div>
            <div className="metric-val" style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{item.value}</div>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Hàng 1: Biểu đồ trạng thái & Chỉ số vận hành */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Biểu đồ Cột Đứng: Phân Phối Trạng Thái Tồn Kho */}
        <section className="sku-section" style={{ margin: 0, background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#111827' }}>Phân Phối Trạng Thái Tồn Kho</h3>
            </div>
            <span style={{ fontSize: '12px', background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
              Tổng SKU: {totalSku}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '13px', color: '#4b5563' }}>
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
              <line x1="40" y1="20" x2="430" y2="20" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="70" x2="430" y2="70" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="120" x2="430" y2="120" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="170" x2="430" y2="170" stroke="#e5e7eb" strokeWidth="1.5" />

              <text x="30" y="24" textAnchor="end" fill="#9ca3af" fontSize="10">{maxCount}</text>
              <text x="30" y="74" textAnchor="end" fill="#9ca3af" fontSize="10">{Math.round(maxCount * 0.75)}</text>
              <text x="30" y="124" textAnchor="end" fill="#9ca3af" fontSize="10">{Math.round(maxCount * 0.25)}</text>
              <text x="30" y="174" textAnchor="end" fill="#9ca3af" fontSize="10">0</text>

              {/* Cột 1 */}
              {(() => {
                const h = Math.round((stableItems.length / maxCount) * 150);
                const y = 170 - h;
                return (
                  <g>
                    <rect x="90" y={y} width="55" height={h} rx="4" fill="#16a34a" />
                    <text x="117.5" y={y - 8} textAnchor="middle" fill="#111827" fontSize="12" fontWeight="700">{stableItems.length}</text>
                    <text x="117.5" y="190" textAnchor="middle" fill="#4b5563" fontSize="12" fontWeight="600">Ổn định</text>
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
                    <text x="237.5" y={y - 8} textAnchor="middle" fill="#111827" fontSize="12" fontWeight="700">{lowStockItems.length}</text>
                    <text x="237.5" y="190" textAnchor="middle" fill="#4b5563" fontSize="12" fontWeight="600">Sắp hết</text>
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
                    <text x="357.5" y={y - 8} textAnchor="middle" fill="#111827" fontSize="12" fontWeight="700">{outOfStockItems.length}</text>
                    <text x="357.5" y="190" textAnchor="middle" fill="#4b5563" fontSize="12" fontWeight="600">Hết hàng</text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </section>

        {/* Chỉ số vận hành & An toàn */}
        <section className="sku-section" style={{ margin: 0, background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldCheck size={20} color="#16a34a" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#111827' }}>Chỉ Số Vận Hành & An Toàn</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Đánh giá mức độ sẵn sàng và độ tin cậy của dữ liệu kho hàng.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#374151' }}>
            <div style={{ padding: '14px 16px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Tỷ lệ hàng sẵn sàng:</span>
              <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '15px' }}>{totalSku ? `${100 - getPercent(outOfStockItems.length)}%` : '0%'}</span>
            </div>
            <div style={{ padding: '14px 16px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Độ chính xác dữ liệu:</span>
              <span style={{ fontWeight: '700', color: '#2563eb', fontSize: '15px' }}>100% Đồng bộ dữ liệu</span>
            </div>
          </div>
        </section>

      </div>

      {/* Hàng 2: Biểu Đồ Cột Ngang Đa Sắc Màu & Bảng Chi Tiết Kèm Chú Thích */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '24px' }}>
        
        {/* Biểu Đồ Cột Ngang Đa Sắc Màu & Note Chú Thích Bên Dưới */}
        <section className="sku-section" style={{ margin: 0, background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <TrendingUp size={20} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#111827' }}>Biểu Đồ Top 5 Tồn Kho</h3>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '175px' }}>
            <svg viewBox="0 0 400 170" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Lưới định mức dọc */}
              <line x1="90" y1="5" x2="90" y2="145" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="160" y1="5" x2="160" y2="145" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="230" y1="5" x2="230" y2="145" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="300" y1="5" x2="300" y2="145" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="370" y1="5" x2="370" y2="145" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />

              {/* Trục X giá trị ở dưới */}
              <text x="90" y="162" textAnchor="middle" fill="#9ca3af" fontSize="10">0</text>
              <text x="160" y="162" textAnchor="middle" fill="#9ca3af" fontSize="10">{Math.round(chartMaxX * 0.25)}</text>
              <text x="230" y="162" textAnchor="middle" fill="#9ca3af" fontSize="10">{Math.round(chartMaxX * 0.5)}</text>
              <text x="300" y="162" textAnchor="middle" fill="#9ca3af" fontSize="10">{Math.round(chartMaxX * 0.75)}</text>
              <text x="370" y="162" textAnchor="middle" fill="#9ca3af" fontSize="10">{chartMaxX}</text>

              {topStockProducts.map((prod, idx) => {
                const stockVal = Number(prod.stock) || 0;
                const barMaxWidth = 280;
                const barW = Math.round((stockVal / chartMaxX) * barMaxWidth);
                const yPos = 10 + idx * 28;
                const shortName = ` #${idx + 1}`;
                const barColor = barColors[idx % barColors.length];

                return (
                  <g key={idx}>
                    <text x="82" y={yPos + 11} textAnchor="end" fill="#374151" fontSize="11" fontWeight="700">
                      {shortName}
                    </text>
                    <rect 
                      x="90" 
                      y={yPos} 
                      width={Math.max(barW, 4)} 
                      height="16" 
                      rx="4" 
                      fill={barColor} 
                    />
                    <text 
                      x={90 + Math.max(barW, 4) + 8} 
                      y={yPos + 12} 
                      fill={barColor} 
                      fontSize="11" 
                      fontWeight="700"
                    >
                      {stockVal}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Phần Ghi Chú Chú Thích Tên Đầy Đủ Ở Dưới Biểu Đồ */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '2px' }}>Chú thích sản phẩm:</span>
            {topStockProducts.map((prod, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: barColors[idx % barColors.length], display: 'inline-block', flexShrink: 0 }}></span>
                <span style={{ fontWeight: '600', color: '#111827' }}>#{idx + 1}:</span>
                <span style={{ color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={prod.name}>
                  {prod.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Bảng Chi Tiết: Top 5 Sản Phẩm Có Số Lượng Tồn Nhiều Nhất */}
        <section className="sku-section" style={{ margin: 0, background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <TrendingUp size={20} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#111827' }}>Chi Tiết Top 5 Tồn Kho Nhiều Nhất</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="storage-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left', color: '#6b7280', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 12px' }}>HẠNG</th>
                  <th style={{ padding: '10px 12px' }}>TÊN SẢN PHẨM & MÃ SKU</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>TỒN KHO</th>
                </tr>
              </thead>
              <tbody>
                {topStockProducts.length > 0 ? (
                  topStockProducts.map((prod, index) => (
                    <tr key={prod.id || index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          display: 'inline-flex', width: '24px', height: '24px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', 
                          background: index === 0 ? '#fef3c7' : index === 1 ? '#f3f4f6' : index === 2 ? '#ffedd5' : '#f9fafb',
                          color: index === 0 ? '#d97706' : index === 1 ? '#4b5563' : index === 2 ? '#c2410c' : '#6b7280',
                          fontWeight: '700', fontSize: '11px'
                        }}>
                          #{index + 1}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ color: '#111827', fontWeight: '600', fontSize: '13px' }}>{prod.name}</strong>
                        <br />
                        <small style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '11px' }}>{prod.id}</small>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <strong style={{ color: '#2563eb', fontSize: '14px' }}>{prod.stock}</strong> <span style={{ color: '#6b7280', fontSize: '12px' }}>chiếc</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Chưa có dữ liệu tồn kho.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default InventoryStatistics;