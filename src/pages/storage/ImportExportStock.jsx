import React, { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import { ArrowDownLeft, ArrowUpRight, FileText, Plus } from 'lucide-react';

const ImportExportStock = () => {
  const [tabHienTai, setTabHienTai] = useState('import');
  const [chungTu, setChungTu] = useState({ import: [], export: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockTransactions = async () => {
      try {
        setLoading(true);
        const productsRes = await productAPI.getProducts();

        let products = [];
        if (Array.isArray(productsRes)) {
          products = productsRes;
        } else if (Array.isArray(productsRes?.data)) {
          products = productsRes.data;
        } else if (Array.isArray(productsRes?.data?.content)) {
          products = productsRes.data.content;
        } else {
          products = [];
        }

        let importList = [];
        let exportList = [];

        for (const prod of products) {
          const prodId = prod._id || prod.id;
          try {
            const variantsRes = await productAPI.getProductVariants(prodId);
            const variants = variantsRes.data || variantsRes;

            variants.forEach((v, idx) => {
              const skuCode = v.sku || v._id || `SKU-${idx}`;
              // Giả lập danh sách phiếu Nhập và Xuất dựa trên dữ liệu thật của SKU
              importList.push({
                code: `IMP-${skuCode.slice(-4)}`,
                date: '2026-06-04 10:30',
                supplier: 'Nhà cung cấp chính hãng',
                items: `${prod.name} (${v.color || 'Mặc định'} - SL: ${v.stock ?? 10})`,
                status: 'Hoàn Thành'
              });

              exportList.push({
                code: `EXP-${skuCode.slice(-4)}`,
                date: '2026-06-04 11:15',
                recipient: 'Chi nhánh phân phối chính',
                items: `${prod.name} (${v.color || 'Mặc định'} - Xuất kho)`,
                status: 'Đã Xuất Kho'
              });
            });
          } catch (err) {
            console.error(err);
          }
        }

        setChungTu({
          import: importList.length > 0 ? importList : [
            { code: 'IMP-9021', date: '2026-06-04 10:30', supplier: 'Atelier Ceramics Ltd.', items: 'LUMORA Signature Vase (x50)', status: 'Hoàn Thành' }
          ],
          export: exportList.length > 0 ? exportList : [
            { code: 'EXP-4011', date: '2026-06-04 11:00', recipient: 'Chi nhánh Quận 1 - Showroom', items: 'Lumina Aroma Diffuser (x10)', status: 'Đã Xuất Kho' }
          ]
        });
      } catch (error) {
        console.error('Lỗi tải dữ liệu chứng từ kho:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockTransactions();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-main" style={{ padding: '40px', fontFamily: "'Inter', sans-serif", textAlign: 'center' }}>
        Đang đồng bộ chứng từ kho từ hệ thống...
      </div>
    );
  }

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="dash-header">
        <div>
          <span className="subtitle">QUẢN LÝ DÒNG CHẢY HÀNG HÓA</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>
            Quản Lý Nhập Kho & Xuất Kho
          </h2>
          <p>Theo dõi các chứng từ, biên bản giao nhận và lịch sử dòng chảy hàng hóa ra vào hệ thống kho.</p>
        </div>
        <div className="actions">
          <button className="btn-primary">
            <Plus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Tạo Phiếu {tabHienTai === 'import' ? 'Nhập' : 'Xuất'} Kho Mới
          </button>
        </div>
      </header>

      {/* Tabs chuyển đổi Nhập / Xuất */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setTabHienTai('import')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: tabHienTai === 'import' ? '1px solid #1c1c1c' : '1px solid #eaeaea',
            background: tabHienTai === 'import' ? '#1c1c1c' : '#fff',
            color: tabHienTai === 'import' ? '#fff' : '#333',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowDownLeft size={16} /> Phiếu Nhập Kho
        </button>
        <button
          onClick={() => setTabHienTai('export')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: tabHienTai === 'export' ? '1px solid #1c1c1c' : '1px solid #eaeaea',
            background: tabHienTai === 'export' ? '#1c1c1c' : '#fff',
            color: tabHienTai === 'export' ? '#fff' : '#333',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowUpRight size={16} /> Phiếu Xuất Kho
        </button>
      </div>

      {/* Bảng danh sách chứng từ */}
      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText size={20} color="#1c1c1c" />
          <h3 style={{ margin: 0 }}>Danh Sách Chứng Từ {tabHienTai === 'import' ? 'Nhập Kho' : 'Xuất Kho'}</h3>
        </div>

        <table className="storage-table">
          <thead>
            <tr>
              <th>MÃ CHỨNG TỪ</th>
              <th>THỜI GIAN</th>
              <th>{tabHienTai === 'import' ? 'NHÀ CUNG CẤP' : 'ĐƠN VỊ NHẬN / KHÁCH HÀNG'}</th>
              <th>CHI TIẾT HÀNG HÓA</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {chungTu[tabHienTai]?.length > 0 ? (
              chungTu[tabHienTai].map((tx, idx) => (
                <tr key={idx}>
                  <td><strong>{tx.code}</strong></td>
                  <td>{tx.date}</td>
                  <td>{tx.supplier || tx.recipient}</td>
                  <td>{tx.items}</td>
                  <td>
                    <span className="badge" style={{ background: '#f0ede6', fontWeight: '600' }}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  Chưa có dữ liệu chứng từ {tabHienTai === 'import' ? 'nhập' : 'xuất'} kho.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ImportExportStock;