import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Home,
  Check,
} from "lucide-react";
import { addressAPI, getApiErrorMessage } from "../../services/api";
import AddressModal from "../../components/customer/AddressModal";
import "./AddressManagement.css";

export default function AddressManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await addressAPI.getAddresses();
      const list = res.data?.addresses || res.data || [];
      setAddresses(Array.isArray(list) ? list : []);
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.",
      );
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?redirect=/addresses");
      return;
    }
    fetchAddresses();
  }, [fetchAddresses, navigate]);

  const handleOpenCreate = () => {
    setAddressToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setAddressToEdit(addr);
    setIsModalOpen(true);
  };

  const handleDelete = async (addr) => {
    const id = addr._id || addr.id;
    if (
      !window.confirm(
        `Xác nhận xóa địa chỉ nhận hàng của "${addr.receiverName}"?`,
      )
    ) {
      return;
    }

    setActionLoadingId(id);
    try {
      await addressAPI.deleteAddress(id);
      await fetchAddresses();
    } catch (err) {
      alert("Lỗi khi xóa: " + getApiErrorMessage(err, "Không thể xóa địa chỉ."));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSetDefault = async (addr) => {
    const id = addr._id || addr.id;
    setActionLoadingId(id);
    try {
      await addressAPI.setDefaultAddress(id);
      await fetchAddresses();
    } catch (err) {
      alert(
        "Lỗi thiết lập mặc định: " +
        getApiErrorMessage(err, "Không thể đặt làm mặc định."),
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="address-page container">
      {/* Breadcrumb & Navigation */}
      <div className="address-page__nav">
        {redirectUrl ? (
          <Link to={redirectUrl} className="address-page__back-link">
            <ArrowLeft size={16} /> Quay lại Trang Thanh Toán (Checkout)
          </Link>
        ) : (
          <Link to="/" className="address-page__back-link">
            <ArrowLeft size={16} /> Quay lại Trang Chủ
          </Link>
        )}
      </div>

      {/* Header */}
      <div className="address-page__header">
        <div>
          <span className="address-page__badge">TÀI KHOẢN KHÁCH HÀNG</span>
          <h1 className="address-page__title">Sổ Địa Chỉ Giao Hàng</h1>
          <p className="address-page__subtitle">
            Quản lý địa chỉ giao hàng White-Glove để đơn hàng của quý khách được giao nhận chính xác và chu đáo nhất.
          </p>
        </div>

        <button
          type="button"
          className="address-page__create-btn"
          onClick={handleOpenCreate}
        >
          <Plus size={18} /> Thêm địa chỉ mới
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="address-page__error">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="address-page__loading">
          Đang tải danh sách địa chỉ từ hệ thống LUMORA...
        </div>
      ) : addresses.length === 0 ? (
        <div className="address-page__empty">
          <div className="address-page__empty-icon">
            <Home size={36} />
          </div>
          <h3 className="address-page__empty-title">
            Chưa có địa chỉ giao hàng nào
          </h3>
          <p className="address-page__empty-desc">
            Lưu địa chỉ nhận hàng để rút ngắn thời gian đặt các sản phẩm nội thất cao cấp của bạn.
          </p>
          <button
            type="button"
            className="address-page__create-btn"
            onClick={handleOpenCreate}
          >
            <Plus size={18} /> Thêm địa chỉ đầu tiên
          </button>
        </div>
      ) : (
        <div className="address-page__grid">
          {addresses.map((addr) => {
            const id = addr._id || addr.id;
            const isProcessing = actionLoadingId === id;

            return (
              <div
                key={id}
                className={`address-card ${addr.isDefault ? "address-card--default" : ""
                  }`}
              >
                <div className="address-card__header">
                  <div className="address-card__title-group">
                    <span className="address-card__name">
                      {addr.receiverName}
                    </span>
                    {addr.isDefault && (
                      <span className="address-card__badge-default">
                        <ShieldCheck size={14} /> Mặc định
                      </span>
                    )}
                  </div>
                  <span className="address-card__phone">{addr.phone}</span>
                </div>

                <div className="address-card__body">
                  <div className="address-card__info-row">
                    <MapPin size={17} className="address-card__pin shrink-0" />
                    <p className="address-card__address-text">
                      {addr.addressLine}, {addr.ward}, {addr.city}
                    </p>
                  </div>
                </div>

                <div className="address-card__actions">
                  <div className="address-card__actions-left">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        className="address-card__btn-default"
                        onClick={() => handleSetDefault(addr)}
                        disabled={isProcessing}
                      >
                        <Check size={14} /> Thiết lập mặc định
                      </button>
                    )}
                  </div>
                  <div className="address-card__actions-right">
                    <button
                      type="button"
                      className="address-card__btn-action"
                      onClick={() => handleOpenEdit(addr)}
                      disabled={isProcessing}
                    >
                      <Edit2 size={15} /> Sửa
                    </button>
                    <button
                      type="button"
                      className="address-card__btn-action address-card__btn-action--danger"
                      onClick={() => handleDelete(addr)}
                      disabled={isProcessing}
                    >
                      <Trash2 size={15} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addressToEdit={addressToEdit}
        onSuccess={fetchAddresses}
      />
    </div>
  );
}
