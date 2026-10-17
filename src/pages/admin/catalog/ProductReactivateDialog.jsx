import { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "../../../services/api.js";

export default function ProductReactivateDialog({ name, onClose, onConfirm }) {
  const dialog = useRef(null);
  const submitting = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    return () => { element.close(); if (previous?.isConnected) previous.focus(); };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setSaving(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (failure) {
      setError(getApiErrorMessage(failure, "Không thể kích hoạt lại sản phẩm."));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return <dialog ref={dialog} className="lc-reactivate-dialog" aria-labelledby="lc-reactivate-title"
    onCancel={event => { event.preventDefault(); if (!submitting.current) onClose(); }}>
    <form onSubmit={submit}>
      <h2 id="lc-reactivate-title">Kích hoạt lại sản phẩm?</h2>
      <p className="lc-reactivate-name">{name}</p>
      <p>Sản phẩm sẽ được đánh dấu hoạt động nếu Backend chấp nhận. Danh sách sẽ được tải lại để xác nhận trạng thái.</p>
      {error && <p className="lc-product-error" role="alert">{error}</p>}
      <footer><button type="button" disabled={saving} onClick={onClose}>Hủy</button><button type="submit" disabled={saving}>{saving ? "Đang kích hoạt…" : "Kích hoạt lại"}</button></footer>
    </form>
  </dialog>;
}
