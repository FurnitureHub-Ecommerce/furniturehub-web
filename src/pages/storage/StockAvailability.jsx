import React, { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import { PackageCheck, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const StockAvailability = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boLoc, setBoLoc] = useState('ALL');

  // Phân trang
  const [trangHienTai, setTrangHienTai] = useState(1);
  const soLuongMoiTrang = 8;

  useEffect(() => {
    const fetchStockAvailability = async () => {
      try {
        setLoading(true);
        const productsRes = await productAPI.getProducts();

        let products = [];
        if (Array.isArray(productsRes)) {
          products = productsRes;
        } else if (Array.isArray(productsRes?.products)) {
          products = productsRes.products;
        } else if (Array.isArray(productsRes?.data)) {
          products = productsRes.data;
        } else if (Array.isArray(productsRes?.data?.content)) {
          products = productsRes.data.content;
        } else {
          products = [];
        }

        // 🚀 Dùng Promise.all để gọi song song tất cả các API biến thể cùng một lúc (tốc độ cực nhanh)
        const variantPromises = products.map(async (prod) => {
          const prodId = prod._id || prod.id;
          if (!prodId) return [];

          try {
            const variantsRes = await productAPI.getProductVariants(prodId);

            let variants = [];
            if (Array.isArray(variantsRes)) {
              variants = variantsRes;
            } else if (Array.isArray(variantsRes?.variants)) {
              variants = variantsRes.variants;
            } else if (Array.isArray(variantsRes?.data)) {
              variants = variantsRes.data;
            } else {
              variants = [];
            }

            return variants.map((v) => ({
              id: v.sku || v._id || v.id,
              name: prod.name,
              specs: `${v.color || ''} - ${v.size || ''} - ${v.material || ''}`.trim(),
              location: v.location || 'Kho A - Vịnh Mặc Định',
              stock: v.stock ?? 20,
            }));
          } catch (err) {
            console.error(`Lỗi khi lấy biến thể của sản phẩm ${prodId}:`, err);
            return [];
          }
        });

        // Chờ tất cả các request song song hoàn tất
        const allResults = await Promise.all(variantPromises);
        const allVariants = allResults.flat(); // Gộp phẳng các mảng kết quả lại

        setSkuProducts(allVariants);
      } catch (error) {
        console.error('Lỗi tải dữ liệu tình trạng sẵn có:', error);
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

  const xuLyDoiBoLoc = (loai) => {
    setBoLoc(loai);
    setTrangHienTai(1);
  };

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .fade-in-content {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .filter-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
          border: 1px solid #dcd6cd;
          background: #fff;
          color: #555;
        }
        .filter-btn:hover {
          background: #f4f1ea;
          color: #111;
          border-color: #b8b0a2;
          transform: translateY(-1px);
        }
        .filter-btn.active {
          background: #1c1c1c;
          color: #fff;
          border-color: #1c1c1c;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }
      `}</style>

      <header className="dash-header">
        <div>
          <span className="subtitle">TÌNH TRẠNG SẴN CÓ THỜI GIAN THỰC</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>
            Kiểm Tra Tình Trạng Sẵn Có Của Hàng Hóa
          </h2>
          <p>Theo dõi nhanh số lượng hàng có thể xuất bán hoặc phân bổ ngay tại các vị trí trong kho.</p>
        </div>

        <div className="actions" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`filter-btn ${boLoc === 'ALL' ? 'active' : ''}`}
            onClick={() => xuLyDoiBoLoc('ALL')}
          >
            Tất Cả
          </button>
          <button 
            className={`filter-btn ${boLoc === 'AVAILABLE' ? 'active' : ''}`}
            onClick={() => xuLyDoiBoLoc('AVAILABLE')}
          >
            Còn Hàng Sẵn Sàng
          </button>
          <button 
            className={`filter-btn ${boLoc === 'OUT' ? 'active' : ''}`}
            onClick={() => xuLyDoiBoLoc('OUT')}
          >
            Hết Hàng
          </button>
        </div>
      </header>

      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>Ma Trận Hàng Sẵn Sàng</h3>
          </div>
          {!loading && (
            <span style={{ fontSize: '13px', color: '#666' }}>
              Hiển thị {chiSoBatDau + 1} - {Math.min(chiSoBatDau + soLuongMoiTrang, danhSachLoc.length)} trong tổng số <strong>{danhSachLoc.length}</strong> SKU
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid #e3ded3',
              borderTop: '3px solid #1c1c1c',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}></div>
            <span style={{ fontSize: '14px', color: '#777', fontWeight: '500' }}>Đang tải dữ liệu kho hàng cực nhanh...</span>
          </div>
        ) : (
          <div className="fade-in-content">
            <table className="storage-table" style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
              <thead>
                <tr>
                  <th>MÃ SKU & TÊN SẢN PHẨM</th>
                  <th>QUY CÁCH</th>
                  <th>VỊ TRÍ LƯU TRỮ</th>
                  <th>SỐ LƯỢNG KHẢ DỤNG</th>
                  <th>TRẠNG THÁI GIAO DỊCH</th>
                </tr>
              </thead>
              <tbody>
                {danhSachPhanTrang.length > 0 ? (
                  danhSachPhanTrang.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <strong>{prod.name}</strong>
                        <br />
                        <small style={{ color: '#888' }}>{prod.id}</small>
                      </td>
                      <td>{prod.specs}</td>
                      <td><span className="badge">{prod.location}</span></td>
                      <td><strong>{prod.stock}</strong> đơn vị</td>
                      <td>
                        {prod.stock > 0 ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: '600', fontSize: '13px' }}>
                            <CheckCircle2 size={16} /> Sẵn Sàng Xuất Kho
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: '600', fontSize: '13px' }}>
                            <AlertCircle size={16} /> Chờ Nhập Bổ Sung
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                      Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {tongSoTrang > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '28px', borderTop: '1px solid #eaeaea', paddingTop: '20px' }}>
                <button
                  onClick={() => setTrangHienTai((prev) => Math.max(prev - 1, 1))}
                  disabled={trangHienTai === 1}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '4px',
                    border: '1px solid #dcd6cd', background: trangHienTai === 1 ? '#f5f4f0' : '#fff',
                    color: trangHienTai === 1 ? '#a8a29e' : '#1c1c1c', cursor: trangHienTai === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500'
                  }}
                >
                  <ChevronLeft size={14} /> Trước
                </button>

                <span style={{ fontSize: '13px', fontWeight: '600', color: '#443e38' }}>
                  Trang <strong style={{ color: '#1c1c1c' }}>{trangHienTai}</strong> / {tongSoTrang}
                </span>

                <button
                  onClick={() => setTrangHienTai((prev) => Math.min(prev + 1, tongSoTrang))}
                  disabled={trangHienTai === tongSoTrang}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '4px',
                    border: '1px solid #dcd6cd', background: trangHienTai === tongSoTrang ? '#f5f4f0' : '#fff',
                    color: trangHienTai === tongSoTrang ? '#a8a29e' : '#1c1c1c', cursor: trangHienTai === tongSoTrang ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500'
                  }}
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default StockAvailability;