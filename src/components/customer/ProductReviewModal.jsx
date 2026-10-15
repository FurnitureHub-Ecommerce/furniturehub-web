import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Send,
  LogIn,
} from "lucide-react";
import { createProductReview, getApiErrorMessage } from "../../services/api";
import "./ProductReviewModal.css";

const RATING_LABELS = {
  1: "Rất không hài lòng (1/5)",
  2: "Chưa ưng ý (2/5)",
  3: "Bình thường (3/5)",
  4: "Hài lòng (4/5)",
  5: "Tuyệt vời & Hài lòng tuyệt đối (5/5)",
};

const FALLBACK_PROD_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";

export default function ProductReviewModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const token = localStorage.getItem("token");
  const productId = product?._id || product?.id;

  // Khóa scroll khi mở modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setRating(5);
    setHoverRating(0);
    setComment("");
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  const currentDisplayRating = hoverRating || rating;
  const ratingDescription = RATING_LABELS[currentDisplayRating] || "Chọn số sao";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token) {
      setErrorMessage("Vui lòng đăng nhập tài khoản để gửi đánh giá sản phẩm.");
      return;
    }

    if (!productId) {
      setErrorMessage("Không tìm thấy thông tin sản phẩm hợp lệ.");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setErrorMessage("Vui lòng chọn số sao từ 1 đến 5.");
      return;
    }

    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setErrorMessage("Vui lòng nhập nhận xét của bạn về sản phẩm.");
      return;
    }

    if (trimmedComment.length < 5) {
      setErrorMessage("Nội dung nhận xét cần tối thiểu 5 ký tự.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createProductReview(productId, {
        rating: Number(rating),
        comment: trimmedComment,
      });

      setSuccessMessage("Cảm ơn bạn! Đánh giá đã được ghi nhận thành công.");

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(res?.data?.review || res?.data || res);
        }
        onClose();
      }, 1200);
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMessage(
          "Bạn đã gửi đánh giá cho sản phẩm này rồi. Mỗi khách hàng chỉ gửi 1 đánh giá cho mỗi sản phẩm."
        );
      } else {
        const msg = getApiErrorMessage(
          err,
          "Không thể gửi đánh giá vào lúc này. Vui lòng thử lại sau."
        );
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    onClose();
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  };

  const productImage =
    product?.gallery?.[0] ||
    product?.image ||
    (Array.isArray(product?.images) && product?.images[0]) ||
    FALLBACK_PROD_IMAGE;

  return (
    <div
      className="lumora-review-modal__overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="lumora-review-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="lumora-review-modal__header">
          <div className="lumora-review-modal__header-titles">
            <span className="lumora-review-modal__badge">
              <Sparkles size={12} className="inline mr-1 text-amber-700" />
              LUMORA EXPERIENCE
            </span>
            <h2 className="lumora-review-modal__title">Đánh Giá Sản Phẩm</h2>
          </div>
          <button
            type="button"
            className="lumora-review-modal__close-btn"
            onClick={handleClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="lumora-review-modal__product-row">
          <img
            src={productImage}
            alt={product?.name || "Sản phẩm"}
            className="lumora-review-modal__product-thumb"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_PROD_IMAGE;
            }}
          />
          <div className="lumora-review-modal__product-info">
            <h3 className="lumora-review-modal__product-name">
              {product?.name || "Sản phẩm nội thất cao cấp LUMORA"}
            </h3>
            <span className="lumora-review-modal__product-category">
              {product?.categoryName || "Nội thất cao cấp"}
            </span>
          </div>
        </div>

        {/* Not Logged In Alert */}
        {!token && (
          <div className="lumora-review-modal__auth-warning">
            <AlertCircle size={18} className="shrink-0 text-amber-700" />
            <div className="flex-1 text-xs">
              Quý khách cần đăng nhập để gửi đánh giá và nhận điểm tích lũy thành viên.
            </div>
            <button
              type="button"
              className="lumora-review-modal__auth-btn"
              onClick={handleLoginRedirect}
            >
              <LogIn size={13} /> Đăng nhập
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="lumora-review-modal__form">
          {/* Star Selection */}
          <div className="lumora-review-modal__star-group">
            <label className="lumora-review-modal__label">
              Mức độ hài lòng của quý khách <span className="text-red-500">*</span>
            </label>
            <div
              className="lumora-review-modal__stars"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = starVal <= (hoverRating || rating);
                return (
                  <button
                    key={starVal}
                    type="button"
                    className={`lumora-review-star-btn ${
                      isFilled ? "lumora-review-star-btn--active" : ""
                    }`}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onClick={() => setRating(starVal)}
                    aria-label={`${starVal} sao`}
                  >
                    <Star
                      size={32}
                      strokeWidth={1.5}
                      className={
                        isFilled
                          ? "fill-[#C89D5C] text-[#C89D5C]"
                          : "text-stone-300"
                      }
                    />
                  </button>
                );
              })}
            </div>
            <span className="lumora-review-modal__rating-caption">
              {ratingDescription}
            </span>
          </div>

          {/* Comment Textarea */}
          <div className="lumora-review-modal__field">
            <label
              htmlFor="review-comment"
              className="lumora-review-modal__label flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare size={14} className="text-amber-800" />
                Nhận xét chi tiết <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] text-stone-400 font-normal">
                {comment.length}/500 ký tự
              </span>
            </label>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận của quý khách về độ hoàn thiện, màu sắc chất liệu, cảm giác sử dụng và phong cách bài trí không gian sống..."
              className="lumora-review-modal__textarea"
              disabled={isSubmitting || !!successMessage}
            />
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="lumora-review-modal__alert lumora-review-modal__alert--error">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="lumora-review-modal__alert lumora-review-modal__alert--success">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="lumora-review-modal__actions">
            <button
              type="button"
              className="lumora-review-modal__btn-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="lumora-review-modal__btn-submit"
              disabled={isSubmitting || !token || !!successMessage}
            >
              {isSubmitting ? (
                <>
                  <span className="lumora-review-modal__spinner" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send size={15} /> Gửi Đánh Giá
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
