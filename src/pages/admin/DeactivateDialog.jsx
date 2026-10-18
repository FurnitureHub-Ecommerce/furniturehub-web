import { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "../../services/api.js";
import "./DeactivateDialog.css";

export default function DeactivateDialog({ kind, name, consequence, onClose, onConfirm }) {
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
      const serverMessage = failure.response?.data?.errors?.[0]?.message ?? failure.response?.data?.message;
      const statusMessage = { 400: "Yêu cầu vô hiệu hóa không hợp lệ.", 404: `${kind} không còn tồn tại. Vui lòng tải lại.`, 409: `${kind} đang xung đột dữ liệu và chưa thể vô hiệu hóa.` }[failure.response?.status];
      setError(typeof serverMessage === "string" && serverMessage.trim() ? serverMessage : statusMessage ?? getApiErrorMessage(failure, `Không thể vô hiệu hóa ${kind}.`));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return <dialog ref={dialog} className="la-deactivate-dialog" aria-labelledby="la-deactivate-title"
    onCancel={event => { event.preventDefault(); if (!submitting.current) onClose(); }}>
    <form onSubmit={submit}>
      <h2 id="la-deactivate-title">Vô hiệu hóa {kind}?</h2>
      <p className="la-deactivate-name">{name}</p>
      <p>{consequence}</p>
      <p>Chưa có cơ chế kích hoạt lại được xác nhận cho màn hình này.</p>
      {error && <p className="la-deactivate-error" role="alert">{error}</p>}
      <footer><button type="button" disabled={saving} onClick={onClose}>Hủy</button><button type="submit" disabled={saving}>{saving ? "Đang vô hiệu hóa…" : "Vô hiệu hóa"}</button></footer>
    </form>
  </dialog>;
}
