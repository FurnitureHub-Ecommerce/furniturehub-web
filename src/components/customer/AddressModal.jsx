import React, { useState, useEffect } from "react";
import { X, MapPin, User, Phone, Home, Check, AlertCircle } from "lucide-react";
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
  const [formData, setFormData] = useState({
    receiverName: "",
    phone: "",
    addressLine: "",
    ward: "",
    city: "Hồ Chí Minh",
    isDefault: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        receiverName: addressToEdit.receiverName || "",
        phone: addressToEdit.phone || "",
        addressLine: addressToEdit.addressLine || "",
        ward: addressToEdit.ward || "",
        city: addressToEdit.city || "Hồ Chí Minh",
        isDefault: Boolean(addressToEdit.isDefault),
      });
    } else {
      setFormData({
        receiverName: "",
        phone: "",
        addressLine: "",
        ward: "",
        city: "Hồ Chí Minh",
        isDefault: false,
      });
    }
    setError(null);
  }, [addressToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validatePhone = (phone) => {
    // VN Phone: 0xxx or +84xxx, 10-11 digits
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    return phoneRegex.test(phone.trim().replace(/\s+/g, ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend validations
    if (!formData.receiverName.trim()) {
      setError("Vui lòng nhập họ và tên người nhận");
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/\s+/g, "");
    if (!validatePhone(cleanPhone)) {
      setError("Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678)");
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
        resultAddress = res.data?.address || res.data || { ...payload, _id: id };

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
            // Non-blocking if setting default fails
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
    <div className="address-modal__overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="address-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="address-modal__header">
          <div className="address-modal__title-wrap">
            <span className="address-modal__badge">SỔ ĐỊA CHỈ LUMORA</span>
            <h2 className="address-modal__title">
              {addressToEdit ? "Cập Nhật Địa Chỉ Nhận Hàng" : "Thêm Địa Chỉ Giao Hàng Mới"}
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
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-[#E2DBD0] rounded-lg text-[#252525] focus:outline-none focus:border-[#8A6A48] focus:ring-2 focus:ring-[#8A6A48]/20 transition-all box-border"
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
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-[#E2DBD0] rounded-lg text-[#252525] focus:outline-none focus:border-[#8A6A48] focus:ring-2 focus:ring-[#8A6A48]/20 transition-all box-border"
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
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-[#E2DBD0] rounded-lg text-[#252525] focus:outline-none focus:border-[#8A6A48] focus:ring-2 focus:ring-[#8A6A48]/20 transition-all box-border"
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
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-[#E2DBD0] rounded-lg text-[#252525] focus:outline-none focus:border-[#8A6A48] focus:ring-2 focus:ring-[#8A6A48]/20 transition-all box-border"
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
              className="w-full px-4 py-2.5 text-sm bg-white border border-[#E2DBD0] rounded-lg text-[#252525] focus:outline-none focus:border-[#8A6A48] focus:ring-2 focus:ring-[#8A6A48]/20 transition-all box-border resize-y min-h-[75px]"
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
