import React, { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import { ArrowDownLeft, ArrowUpRight, FileText, Plus, X, CheckCircle2 } from 'lucide-react';

const ImportExportStock = () => {
  const [tabHienTai, setTabHienTai] = useState('import');
  const [chungTu, setChungTu] = useState({ import: [], export: [] });
  const [loading, setLoading] = useState(true);

  // State quản lý Modal tạo phiếu mới
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [danhSachSanPham, setDanhSachSanPham] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    note: '',
    partner: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState('');

  // Lấy dữ liệu sản phẩm và khôi phục chứng từ đã lưu từ localStorage để không bị mất khi F5
  useEffect(() => {
    const fetchStockTransactions = async () => {
      try {
        setLoading(true);
        
        // 1. Kiểm tra xem localStorage đã có lịch sử phiếu tự tạo trước đó chưa
        const savedChungTu = localStorage.getItem('furniture_hub_stock_transactions');
        let initialImport = [];
        let initialExport = [];

        if (savedChungTu) {
          const parsed = JSON.parse(savedChungTu);
          initialImport = parsed.import || [];
          initialExport = parsed.export || [];
        }

        // 2. Gọi API lấy danh sách sản phẩm thực tế từ backend
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

        setDanhSachSanPham(products);

        const finalImport = initialImport;
        const finalExport = initialExport;

        setChungTu({ import: finalImport, export: finalExport });
        
        // Lưu lại vào localStorage
        localStorage.setItem('furniture_hub_stock_transactions', JSON.stringify({ import: finalImport, export: finalExport }));

      } catch (error) {
        console.error('Lỗi tải dữ liệu chứng từ kho:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockTransactions();
  }, []);

  // Xử lý khi submit form tạo phiếu mới và lưu vĩnh viễn vào localStorage
  const handleTaoPhieu = async (e) => {
    e.preventDefault();
    if (!formData.productId) {
      alert('Vui lòng chọn sản phẩm!');
      return;
    }

    try {
      setSubmitting(true);
      const selectedProd = danhSachSanPham.find(p => (p._id || p.id) === formData.productId);
      
      const now = new Date();
      const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const maNgẫuNhiên = Math.floor(1000 + Math.random() * 9000);
      const newRecord = {
        code: `${tabHienTai === 'import' ? 'IMP' : 'EXP'}-${maNgẫuNhiên}`,
        date: dateString,
        [tabHienTai === 'import' ? 'supplier' : 'recipient']: formData.partner || (tabHienTai === 'import' ? 'NCC Chính Hãng' : 'Showroom Trung Tâm'),
        items: `${selectedProd?.name || 'Sản phẩm kho'} (x${formData.quantity}) - ${formData.note || 'Giao dịch mới'}`,
        status: tabHienTai === 'import' ? 'Hoàn Thành' : 'Đã Xuất Kho'
      };

      // Cập nhật state mới
      const updatedList = [newRecord, ...chungTu[tabHienTai]];
      const newChungTuState = {
        ...chungTu,
        [tabHienTai]: updatedList
      };

      setChungTu(newChungTuState);

      // 🚀 Lưu thẳng vào localStorage để bấm F5 không bao giờ bị mất data
      localStorage.setItem('furniture_hub_stock_transactions', JSON.stringify(newChungTuState));

      setThongBaoThanhCong(`Tạo phiếu ${tabHienTai === 'import' ? 'nhập' : 'xuất'} kho thành công và đã lưu trữ!`);
      setTimeout(() => {
        setThongBaoThanhCong('');
        setIsOpenModal(false);
        setFormData({ productId: '', quantity: 1, note: '', partner: '' });
      }, 1500);

    } catch (err) {
      console.error('Lỗi tạo phiếu:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalScaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .dashboard-main {
          animation: pageFadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: pageFadeIn 0.25s ease-out forwards;
        }
        .modal-content {
          background: #fff;
          width: 100%;
          max-width: 520px;
          border-radius: 12px;
          padding: 28px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .tab-btn {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          transition: all 0.25s ease;
          border: 1px solid #dcd6cd;
          background: #fff;
          color: #555;
        }
        .tab-btn:hover {
          background: #f4f1ea;
          color: #111;
          border-color: #b8b0a2;
        }
        .tab-btn.active {
          background: #1c1c1c;
          color: #fff;
          border-color: #1c1c1c;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }
      `}</style>

      <header className="dash-header">
        <div>
          <span className="subtitle">QUẢN LÝ DÒNG CHẢY HÀNG HÓA</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>
            Quản Lý Nhập Kho & Xuất Kho
          </h2>
          <p>Theo dõi các chứng từ, biên bản giao nhận và lịch sử dòng chảy hàng hóa ra vào hệ thống kho.</p>
        </div>
        <div className="actions">
          <button 
            className="btn-primary" 
            onClick={() => setIsOpenModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', transition: 'transform 0.2s ease' }}
          >
            <Plus size={16} />
            Tạo Phiếu {tabHienTai === 'import' ? 'Nhập' : 'Xuất'} Kho Mới
          </button>
        </div>
      </header>

      {/* Tabs chuyển đổi Nhập / Xuất */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setTabHienTai('import')}
          className={`tab-btn ${tabHienTai === 'import' ? 'active' : ''}`}
        >
          <ArrowDownLeft size={16} /> Phiếu Nhập Kho
        </button>
        <button
          onClick={() => setTabHienTai('export')}
          className={`tab-btn ${tabHienTai === 'export' ? 'active' : ''}`}
        >
          <ArrowUpRight size={16} /> Phiếu Xuất Kho
        </button>
      </div>

      {/* Bảng danh sách chứng từ */}
      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText size={20} color="#1c1c1c" />
          <h3 style={{ margin: 0, fontFamily: "'Inter', sans-serif" }}>
            Danh Sách Chứng Từ {tabHienTai === 'import' ? 'Nhập Kho' : 'Xuất Kho'}
          </h3>
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
            <span style={{ fontSize: '14px', color: '#777', fontWeight: '500' }}>Đang đồng bộ chứng từ kho thông minh...</span>
          </div>
        ) : (
          <div>
            <table className="storage-table" style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
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
                    <tr key={idx} style={{ transition: 'background 0.2s' }}>
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
          </div>
        )}
      </section>

      {/* MODAL TẠO PHIẾU MỚI */}
      {isOpenModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
                Tạo Phiếu {tabHienTai === 'import' ? 'Nhập Kho' : 'Xuất Kho'} Mới
              </h3>
              <button 
                onClick={() => setIsOpenModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '50%' }}
              >
                <X size={20} color="#666" />
              </button>
            </div>

            {thongBaoThanhCong ? (
              <div style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', textAlign: 'center', color: '#16a34a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={32} />
                <span style={{ fontWeight: 600, fontSize: '15px' }}>{thongBaoThanhCong}</span>
              </div>
            ) : (
              <form onSubmit={handleTaoPhieu} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#333' }}>
                    Chọn Sản Phẩm *
                  </label>
                  <select 
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd6cd', fontSize: '14px', outline: 'none', background: '#fff' }}
                    required
                  >
                    <option value="">-- Chọn sản phẩm từ hệ thống kho --</option>
                    {danhSachSanPham.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#333' }}>
                    {tabHienTai === 'import' ? 'Nhà Cung Cấp' : 'Đơn Vị Nhận / Khách Hàng'}
                  </label>
                  <input 
                    type="text"
                    placeholder={tabHienTai === 'import' ? 'Nhập tên nhà cung cấp...' : 'Nhập đơn vị nhận hàng...'}
                    value={formData.partner}
                    onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd6cd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#333' }}>
                    Số Lượng
                  </label>
                  <input 
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd6cd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#333' }}>
                    Ghi Chú / Chi Tiết
                  </label>
                  <textarea 
                    rows="3"
                    placeholder="Nhập ghi chú giao dịch kho..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dcd6cd', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setIsOpenModal(false)}
                    style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #dcd6cd', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                  >
                    Hủy Bỏ
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                  >
                    {submitting ? 'Đang lưu...' : 'Xác Nhận Tạo'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExportStock;