import { useEffect, useRef, useState } from 'react';
import { Folder, Package, Eye, Pencil, Plus, X, Save, Image, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategories, saveCategory } from '../../../services/admin/categories.service.js';
import './AdminCategories.css';

const defaults = { search: '', status: '', page: 1, pageSize: 5 };

function CategoryDialog({ category, readOnly, onClose, onSaved }) {
  const dialog = useRef(null);
  const [form, setForm] = useState({ name: category?.name ?? '', description: category?.description ?? '', isActive: category?.isActive ?? true });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    return () => { element.close(); previous?.focus(); };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (saving || readOnly) return;
    if (!form.name.trim()) { setError('Tên danh mục không được để trống.'); return; }
    setError(''); setSaving(true);
    try { 
      const saved = await saveCategory({ id: category?._id, ...form }); 
      onSaved(saved); 
    } catch (failure) { 
      setError(failure.message); 
      setSaving(false); 
    }
  }

  return (
    <dialog ref={dialog} className="lcat-dialog" onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}>
      <header>
        <div>
          <span className="lcat-eyebrow">ATELIER STRUCTURE ENGINE</span>
          <h2>{readOnly ? 'Xem Danh Mục' : category ? 'Chỉnh Sửa Danh Mục' : 'Thêm Mới Danh Mục'}</h2>
        </div>
        <button type="button" disabled={saving} onClick={onClose}><X size={19} /></button>
      </header>
      <form onSubmit={submit}>
        <div className="lcat-dialog-body">
          <label>Tên Danh Mục *
            <input autoFocus required readOnly={readOnly} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>Mô Tả
            <textarea rows={4} readOnly={readOnly} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} />
          </label>
          <label className="lcat-toggle">
            <span>Trạng Thái Kích Hoạt</span>
            <input type="checkbox" role="switch" disabled={readOnly || saving} checked={form.isActive} onChange={event => setForm({ ...form, isActive: event.target.checked })} />
          </label>
          {error && <p className="lcat-error" role="alert">{error}</p>}
        </div>
        <footer>
          <button type="button" disabled={saving} onClick={onClose}>{readOnly ? 'Đóng' : 'Hủy bỏ'}</button>
          {!readOnly && <button className="lcat-primary" disabled={saving}><Save size={15} />{saving ? 'Đang lưu…' : 'Lưu Danh Mục'}</button>}
        </footer>
      </form>
    </dialog>
  );
}

export default function AdminCategories() {
  const [query, setQuery] = useState(defaults);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    getCategories(query).then(data => { if (!cancelled) setState({ data, loading: false, error: '' }); }).catch(error => { if (!cancelled) setState({ data: null, loading: false, error: error.message }); });
    return () => { cancelled = true; };
  }, [query, revision]);

  function update(changes) { setState(current => ({ ...current, loading: true, error: '' })); setQuery(current => ({ ...current, page: 1, ...changes })); }
  function reload() { setState(current => ({ ...current, loading: true, error: '' })); setRevision(value => value + 1); }
  function saved(category) { setModal(null); setNotice(`Đã lưu danh mục “${category.name}”.`); update({ page: 1 }); }

  const data = state.data;

  return (
    <div className="lcat-page">
      <p className="lcat-eyebrow">QUẢN TRỊ DANH MỤC / DANH MỤC NỘI THẤT</p>
      <div className="lcat-intro">
        <div><h1>Quản Lý Danh Mục</h1></div>
        <button className="lcat-primary" onClick={() => setModal({ category: null, readOnly: false })}><Plus size={18} />Thêm Danh Mục Mới</button>
      </div>
      {notice && <p className="lcat-notice" role="status">{notice}</p>}
      
      <section className="lcat-filters">
        <input type="search" placeholder="Tìm danh mục…" value={query.search} onChange={event => update({ search: event.target.value })} />
        <select value={query.status} onChange={event => update({ status: event.target.value })}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
        <button onClick={reload} disabled={state.loading}>Tải lại</button>
      </section>

      <section className="lcat-table-box">
        {state.loading ? <div className="lcat-state">Đang tải danh mục…</div> : state.error ? <div className="lcat-state">{state.error}</div> : !data?.rows.length ? <div className="lcat-state">Không có danh mục phù hợp</div> : (
          <table>
            <thead>
              <tr>
                <th>DANH MỤC</th>
                <th>MÔ TẢ</th>
                <th>SẢN PHẨM</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map(category => (
                <tr key={category._id}>
                  <td><strong>{category.name}</strong></td>
                  <td>{category.description || 'Chưa có mô tả'}</td>
                  <td>{category.productCount} sản phẩm</td>
                  <td>{category.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</td>
                  <td>
                    <button onClick={() => setModal({ category, readOnly: true })}><Eye size={16} /></button>
                    <button onClick={() => setModal({ category, readOnly: false })}><Pencil size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      {modal && <CategoryDialog category={modal.category} readOnly={modal.readOnly} onClose={() => setModal(null)} onSaved={saved} />}
    </div>
  );
}