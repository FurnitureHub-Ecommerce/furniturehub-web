import { useState } from "react";
import {
  X,
  MapPin,
  User,
  Phone,
  Home,
  Check,
  AlertCircle,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { addressAPI, getApiErrorMessage } from "../../services/api";
import "./AddressModal.css";

const POPULAR_CITIES = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Bình Dương",
  "Đồng Nai",
  "Cần Thơ",
  "Hải Phòng",
  "Bà Rịa - Vũng Tàu",
  "Khánh Hòa",
  "Lâm Đồng",
];

export default function AddressModal({
  isOpen,
  onClose,
  addressToEdit = null,
  onSuccess,
}) {
  const currentEditId = addressToEdit?._id || addressToEdit?.id || null;
  const [prevAddressId, setPrevAddressId] = useState(currentEditId);
  const [formData, setFormData] = useState(() => ({
    receiverName: addressToEdit?.receiverName || "",
    phone: addressToEdit?.phone || "",
    addressLine: addressToEdit?.addressLine || "",
    ward: addressToEdit?.ward || "",
    city: addressToEdit?.city || "Hồ Chí Minh",
    isDefault: Boolean(addressToEdit?.isDefault),
  }));

  if (currentEditId !== prevAddressId) {
    setPrevAddressId(currentEditId);
    setFormData({
      receiverName: addressToEdit?.receiverName || "",
      phone: addressToEdit?.phone || "",
      addressLine: addressToEdit?.addressLine || "",
      ward: addressToEdit?.ward || "",
      city: addressToEdit?.city || "Hồ Chí Minh",
      isDefault: Boolean(addressToEdit?.isDefault),
    });
  }

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    return phoneRegex.test(phone.trim().replace(/\s+/g, ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.receiverName.trim()) {
      setError("Vui lòng nhập họ và tên người nhận");
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/\s+/g, "");
    if (!validatePhone(cleanPhone)) {
      setError(
        "Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678)",
      );
      return;
    }

    if (!formData.addressLine.trim()) {
      setError("Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)");
      return;
    }

    if (!formData.ward.trim()) {
      setError("Vui lòng nhập Phường / Xã");
      return;
    }

    if (!formData.city.trim()) {
      setError("Vui lòng chọn hoặc nhập Tỉnh / Thành phố");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        receiverName: formData.receiverName.trim(),
        phone: cleanPhone,
        addressLine: formData.addressLine.trim(),
        ward: formData.ward.trim(),
        city: formData.city.trim(),
      };

      let resultAddress = null;

      if (addressToEdit?._id || addressToEdit?.id) {
        const id = addressToEdit._id || addressToEdit.id;
        const res = await addressAPI.updateAddress(id, payload);
        resultAddress = res.data?.address ||
          res.data || { ...payload, _id: id };

        if (formData.isDefault && !addressToEdit.isDefault) {
          await addressAPI.setDefaultAddress(id);
        }
      } else {
        const res = await addressAPI.createAddress(payload);
        resultAddress = res.data?.address || res.data;
        const createdId = resultAddress?._id || resultAddress?.id;

        if (formData.isDefault && createdId) {
          try {
            await addressAPI.setDefaultAddress(createdId);
          } catch {
            // Non-blocking
          }
        }
      }

      if (onSuccess) {
        onSuccess(resultAddress);
      }
      onClose();
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Không thể lưu địa chỉ. Vui lòng kiểm tra lại thông tin.",
      );
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="address-modal__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="address-modal__container animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="address-modal__header">
          <div className="address-modal__title-wrap">
            <span className="address-modal__badge">SỔ ĐỊA CHỈ LUMORA</span>
            <h2
              className="address-modal__title"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {addressToEdit
                ? "Cập Nhật Địa Chỉ Nhận Hàng"
                : "Thêm Địa Chỉ Giao Hàng Mới"}
            </h2>
          </div>
          <button
            type="button"
            className="address-modal__close-btn"
            onClick={onClose}
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="address-modal__error">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="address-modal__form">
          <div className="address-modal__grid-2">
            <div className="address-modal__field">
              <label htmlFor="receiverName">
                Họ và tên người nhận <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                <input
                  id="receiverName"
                  name="receiverName"
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.receiverName}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "3rem" }}
                  className="w-full pl-12 pr-4 py-2.5 text-sm bg-white border border-[#E2DBD0] rounded-lg text-[#252525] focus:outline-none focus:border-[#8A6A48] focus:ring-2 focus:ring-[#8A6A48]/20 transition-all box-border"
                />
              </div>
            </div>

            <div className="address-modal__field">
              <label htmlFor="phone">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0912 345 678"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "3rem" }}
                  className="w-full pl-12 pr-4 py-2.5 text-sm bg-white border border-[#E2DBD0] rounded-lg text-[#252525] focus:outline-none focus:border-[#8A6A48] focus:ring-2 focus:ring-[#8A6A48]/20 transition-all box-border"
                />
              </div>
            </div>
          </div>

          <div className="address-modal__grid-2">
            <div className="address-modal__field">
              <label htmlFor="city">
                Tỉnh / Thành phố <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                <input
                  id="city"
                  name="city"
                  type="text"
                  list="city-suggestions"
                  placeholder="Chọn hoặc nhập Tỉnh / TP"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "3rem" }}
                  className="w-full pl-12 pr-4 py-2.5 text-sm bg-white border border-[#E2DBD0] rounded-lg text-[#252525] focus:outline-none focus:border-[#8A6A48] focus:ring-2 focus:ring-[#8A6A48]/20 transition-all box-border"
                />
                <datalist id="city-suggestions">
                  {POPULAR_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="address-modal__field">
              <label htmlFor="ward">
                Phường / Xã / Thị trấn <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                <input
                  id="ward"
                  name="ward"
                  type="text"
                  placeholder="Ví dụ: Phường Bến Nghé"
                  value={formData.ward}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: "3rem" }}
                  className="w-full pl-12 pr-4 py-2.5 text-sm bg-white border border-[#E2DBD0] rounded-lg text-[#252525] focus:outline-none focus:border-[#8A6A48] focus:ring-2 focus:ring-[#8A6A48]/20 transition-all box-border"
                />
              </div>
            </div>
          </div>

          <div className="address-modal__field">
            <label htmlFor="addressLine">
              Số nhà, tên đường, tòa nhà <span className="text-red-500">*</span>
            </label>
            <textarea
              id="addressLine"
              name="addressLine"
              rows={3}
              placeholder="Ví dụ: Căn hộ 12B, Tháp Ruby, 123 Đường Lê Lợi"
              value={formData.addressLine}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2DBD0] rounded-lg text-[#252525] focus:outline-none focus:border-[#8A6A48] focus:ring-2 focus:ring-[#8A6A48]/20 transition-all box-border resize-y min-h-18.75"
            />
          </div>

          <label className="address-modal__checkbox-label">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
            />
            <span>Đặt làm địa chỉ nhận hàng mặc định</span>
          </label>

          <div className="address-modal__actions">
            <button
              type="button"
              className="address-modal__btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="address-modal__btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                "Đang lưu thông tin..."
              ) : (
                <>
                  <Check size={16} />
                  {addressToEdit ? "Lưu thay đổi" : "Lưu địa chỉ"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========================================================
// COMPONENT XÁC NHẬN XÓA ĐỊA CHỈ (CUSTOM CONFIRM MODAL)
// ========================================================
// ========================================================
// COMPONENT XÁC NHẬN XÓA ĐỊA CHỈ (CUSTOM CONFIRM MODAL)
// ========================================================
export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          maxWidth: "420px",
          width: "100%",
          padding: "32px 24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e5e7eb",
          textAlign: "center",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
          }}
        >
          <Trash2 size={24} />
        </div>

        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.25rem",
            fontWeight: "bold",
            color: "#1c1c1c",
            marginBottom: "8px",
          }}
        >
          {title || "Xác nhận xóa"}
        </h3>

        <p 
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "0.85rem",
            color: "#6b7280",
            marginBottom: "24px",
            lineHeight: "1.5",
          }}
        >
          {message ||
            "Bạn có chắc chắn muốn xóa địa chỉ này không? Hành động này không thể hoàn tác."}
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          {/* Nút Hủy bỏ */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px 20px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              fontSize: "0.82rem",
              fontWeight: 600,
              fontFamily: "'Montserrat', sans-serif",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              cursor: "pointer",
              transition: "all 0.2s ease",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Hủy bỏ
          </button>

          {/* Nút Xác nhận xóa */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px 20px",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              fontSize: "0.82rem",
              fontWeight: 600,
              fontFamily: "'Montserrat', sans-serif",
              borderRadius: "10px",
              border: "none",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isLoading ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
