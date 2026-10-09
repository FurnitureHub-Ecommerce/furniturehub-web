import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import AddressModal from "./AddressModal";
import { addressAPI } from "../../services/api";
import "./AddressSelector.css";

export default function AddressSelector({
  addresses = [],
  selectedAddressId,
  onSelectAddress,
  onRefresh,
  loading = false,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const selectedAddress =
    addresses.find((a) => (a._id || a.id) === selectedAddressId) ||
    addresses.find((a) => a.isDefault) ||
    addresses[0] ||
    null;

  const handleOpenCreate = () => {
    setAddressToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, addr) => {
    e.stopPropagation();
    setAddressToEdit(addr);
    setIsModalOpen(true);
  };

  const handleDelete = async (e, addr) => {
    e.stopPropagation();
    const id = addr._id || addr.id;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa địa chỉ của "${addr.receiverName}"?`)) {
      return;
    }
    setActionLoadingId(id);
    try {
      await addressAPI.deleteAddress(id);
      if (onRefresh) await onRefresh();
    } catch (err) {
      alert("Lỗi khi xóa địa chỉ: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSetDefault = async (e, addr) => {
    e.stopPropagation();
    const id = addr._id || addr.id;
    setActionLoadingId(id);
    try {
      await addressAPI.setDefaultAddress(id);
      if (onRefresh) await onRefresh();
    } catch (err) {
      alert("Lỗi khi đặt địa chỉ mặc định: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleModalSuccess = async (savedAddress) => {
    if (onRefresh) {
      await onRefresh();
    }
    if (savedAddress?._id || savedAddress?.id) {
      onSelectAddress(savedAddress._id || savedAddress.id);
    }
    setIsListExpanded(false);
  };

  return (
    <div className="address-selector">
      <div className="address-selector__header">
        <div className="address-selector__title-row">
          <MapPin size={20} className="address-selector__pin-icon" />
          <h3 className="address-selector__title">Địa Chỉ Giao Hàng</h3>
        </div>
        {addresses.length > 0 && (
          <button
            type="button"
            className="address-selector__change-btn"
            onClick={() => setIsListExpanded(!isListExpanded)}
          >
            {isListExpanded ? "Thu gọn" : "Thay đổi / Quản lý"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="address-selector__loading">
          Đang tải thông tin địa chỉ giao hàng...
        </div>
      ) : addresses.length === 0 ? (
        <div className="address-selector__empty">
          <p className="address-selector__empty-text">
            Quý khách chưa lưu địa chỉ nhận hàng nào. Vui lòng thêm địa chỉ để tiếp tục đặt đơn.
          </p>
          <button
            type="button"
            className="address-selector__add-btn"
            onClick={handleOpenCreate}
          >
            <Plus size={16} /> Thêm địa chỉ mới
          </button>
        </div>
      ) : !isListExpanded && selectedAddress ? (
        /* Preview Single Selected Address */
        <div
          className="address-selector__card address-selector__card--selected"
          onClick={() => setIsListExpanded(true)}
          title="Nhấn để đổi địa chỉ khác"
        >
          <div className="address-selector__card-content">
            <div className="address-selector__card-top">
              <span className="address-selector__receiver-name">
                {selectedAddress.receiverName}
              </span>
              <span className="address-selector__divider">|</span>
              <span className="address-selector__phone">
                {selectedAddress.phone}
              </span>
              {selectedAddress.isDefault && (
                <span className="address-selector__badge-default">
                  <ShieldCheck size={13} /> Mặc định
                </span>
              )}
            </div>
            <p className="address-selector__address-line">
              {selectedAddress.addressLine}, {selectedAddress.ward},{" "}
              {selectedAddress.city}
            </p>
          </div>
          <ChevronRight size={18} className="address-selector__arrow-icon" />
        </div>
      ) : (
        /* Expanded List of All Addresses */
        <div className="address-selector__list">
          {addresses.map((addr) => {
            const id = addr._id || addr.id;
            const isSelected = id === (selectedAddress?._id || selectedAddress?.id);

            return (
              <div
                key={id}
                className={`address-selector__card ${
                  isSelected ? "address-selector__card--selected" : ""
                }`}
                onClick={() => {
                  onSelectAddress(id);
                  setIsListExpanded(false);
                }}
              >
                <div className="address-selector__radio">
                  <div
                    className={`address-selector__radio-circle ${
                      isSelected ? "address-selector__radio-circle--checked" : ""
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={16} />}
                  </div>
                </div>

                <div className="address-selector__card-content">
                  <div className="address-selector__card-top">
                    <span className="address-selector__receiver-name">
                      {addr.receiverName}
                    </span>
                    <span className="address-selector__divider">|</span>
                    <span className="address-selector__phone">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="address-selector__badge-default">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="address-selector__address-line">
                    {addr.addressLine}, {addr.ward}, {addr.city}
                  </p>

                  <div className="address-selector__item-actions">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        className="address-selector__text-btn"
                        onClick={(e) => handleSetDefault(e, addr)}
                        disabled={actionLoadingId === id}
                      >
                        Thiết lập mặc định
                      </button>
                    )}
                    <button
                      type="button"
                      className="address-selector__text-btn"
                      onClick={(e) => handleOpenEdit(e, addr)}
                    >
                      <Edit2 size={13} /> Sửa
                    </button>
                    <button
                      type="button"
                      className="address-selector__text-btn address-selector__text-btn--danger"
                      onClick={(e) => handleDelete(e, addr)}
                      disabled={actionLoadingId === id}
                    >
                      <Trash2 size={13} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            className="address-selector__add-btn address-selector__add-btn--full"
            onClick={handleOpenCreate}
          >
            <Plus size={16} /> Thêm địa chỉ nhận hàng mới
          </button>
        </div>
      )}

      {/* Address Form Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addressToEdit={addressToEdit}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
