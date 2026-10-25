import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  ChevronRight,
  ZoomIn,
  AlertTriangle,
  Award,
  ArrowLeft,
  Sparkles,
  Edit3,
  CheckCircle2,
} from "lucide-react";
import { productAPI, reviewAPI } from "../../services/api";
import { useShop } from "../../context/ShopContext";
import { ProductDetailSkeleton } from "../../components/common/ProductSkeleton";
import ProductReviewModal from "../../components/customer/ProductReviewModal";
import {
  formatCurrency,
  formatCategoryName,
  PRODUCT_IMAGE_OVERRIDES,
} from "../../utils/formatters";

export function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, wishlist, toggleWishlist, setIsCartOpen } = useShop();

  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Gallery & Image State
  const [selectedImage, setSelectedImage] = useState("");
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Tab State
  const [activeTab, setActiveTab] = useState("description");

  // Load product & variants from API
  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      setIsLoading(true);
      setApiError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });

      try {
        let realProd = null;
        if (slug) {
          try {
            const res = await productAPI.getProductById(slug);
            const found =
              res.data?.product || (res.data?._id ? res.data : null);
            if (found) realProd = found;
          } catch {
            const listRes = await productAPI.getProducts();
            const list = listRes.data?.products || [];
            realProd =
              list.find((p) => p.slug === slug || p._id === slug) || null;
          }
        }

        if (!isMounted) return;

        if (realProd) {
          const prodId = realProd._id || realProd.id;

          let loadedVariants = [];
          try {
            const varRes = await productAPI.getProductVariants(prodId);
            loadedVariants = varRes.data?.variants || [];
          } catch (vErr) {
            console.warn("Could not load variants:", vErr.message);
          }

          let loadedReviews = [];
          let loadedAvg = null;
          let loadedCount = 0;
          try {
            const revRes = await reviewAPI.getProductReviews(prodId);
            loadedReviews = revRes.data?.reviews || [];
            loadedAvg = revRes.data?.averageRating;
            loadedCount = revRes.data?.totalReviews ?? loadedReviews.length;
          } catch (rErr) {
            console.warn("Could not load reviews:", rErr.message);
          }

          const categoryObj =
            typeof realProd.categoryId === "object" &&
            realProd.categoryId !== null
              ? realProd.categoryId
              : null;
          const brandObj =
            typeof realProd.brandId === "object" && realProd.brandId !== null
              ? realProd.brandId
              : null;
          const overrideImages = PRODUCT_IMAGE_OVERRIDES[realProd.name];
          const images =
            overrideImages ||
            (Array.isArray(realProd.images) && realProd.images.length > 0
              ? realProd.images
              : [
                  realProd.image ||
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
                ]);

          const finalRating =
            loadedAvg !== undefined && loadedAvg !== null && loadedCount > 0
              ? Number(loadedAvg)
              : loadedReviews.length > 0
                ? Number(
                    (
                      loadedReviews.reduce(
                        (acc, r) => acc + (r.rating || 5),
                        0,
                      ) / loadedReviews.length
                    ).toFixed(1),
                  )
                : 0;

          const finalCount =
            loadedCount > 0 ? loadedCount : loadedReviews.length;

          const formatted = {
            id: prodId,
            _id: prodId,
            name: realProd.name || "Sản phẩm nội thất cao cấp",
            slug: realProd.slug || prodId,
            categoryId: categoryObj?._id || realProd.categoryId || "",
            categoryName: formatCategoryName(categoryObj?.name || "Nội thất"),
            brandId: brandObj?._id || realProd.brandId || "",
            brandName: brandObj?.name || "LUMORA Studio",
            basePrice: realProd.minPrice ?? realProd.price ?? 0,
            oldPrice: realProd.oldPrice || null,
            rating: finalRating,
            reviewCount: finalCount,
            isNew: realProd.isNew !== undefined ? realProd.isNew : true,
            inStock:
              realProd.availableStock !== undefined
                ? realProd.availableStock > 0
                : true,
            stockCount: realProd.availableStock ?? 15,
            shortDescription:
              realProd.description ||
              "Chế tác từ chất liệu thượng hạng, tối ưu công năng và thẩm mỹ.",
            description:
              realProd.description ||
              "Sản phẩm nội thất thiết kế theo phong cách tối giản cao cấp, tinh xảo từng đường nét mối nối, đảm bảo sự bền bỉ trường tồn cùng năm tháng.",
            gallery: images,
            image: images[0],
            specifications: realProd.specifications || {
              "Xuất xứ": "Sản xuất thủ công tại xưởng LUMORA",
              "Vật liệu":
                "Gỗ sồi Bắc Mỹ, Nỉ dệt chống xước, Thép sơn tĩnh điện",
              "Bảo hành": "10 năm kết cấu khung & 2 năm bề mặt",
              "Chứng nhận": "FSC® 100% Gỗ rừng trồng bền vững",
              "Vận chuyển": "Giao hàng và lắp ráp miễn phí toàn quốc",
            },
            reviews: loadedReviews,
          };

          setProduct(formatted);
          setVariants(loadedVariants);
          if (loadedVariants.length > 0) {
            // Tự động chọn biến thể đầu tiên còn hàng, nếu hết hết thì chọn biến thể đầu tiên
            const firstAvailable =
              loadedVariants.find((v) => (v.availableStock ?? 0) > 0) ||
              loadedVariants[0];
            setSelectedVariant(firstAvailable);
          }
          setSelectedImage(images[0]);
          setReviews(loadedReviews);
          setAverageRating(finalRating);
          setTotalReviews(finalCount);
        } else {
          setApiError("Không tìm thấy thông tin sản phẩm này trên hệ thống.");
        }
      } catch (err) {
        console.error("Fetch product detail failed:", err);
        if (isMounted) {
          setApiError(err.message || "Lỗi khi tải thông tin sản phẩm.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  const reloadReviews = useCallback(async () => {
    const prodId = product?.id || product?._id;
    if (!prodId) return;
    try {
      const res = await reviewAPI.getProductReviews(prodId);
      const revs = res.data?.reviews || [];
      const avg = res.data?.averageRating;
      const total = res.data?.totalReviews ?? revs.length;
      const finalRating =
        avg !== undefined && avg !== null && total > 0
          ? Number(avg)
          : revs.length > 0
            ? Number(
                (
                  revs.reduce((acc, r) => acc + (r.rating || 5), 0) /
                  revs.length
                ).toFixed(1),
              )
            : 0;

      setReviews(revs);
      setAverageRating(finalRating);
      setTotalReviews(total);
      setProduct((prev) =>
        prev
          ? { ...prev, rating: finalRating, reviewCount: total, reviews: revs }
          : null,
      );
      setActiveTab("reviews");
    } catch (err) {
      console.warn("Could not reload reviews:", err);
    }
  }, [product?.id, product?._id]);

  const ratingBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star] || 0,
      percent:
        reviews.length > 0
          ? Math.round(((counts[star] || 0) / total) * 100)
          : 0,
    }));
  }, [reviews]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (apiError || !product) {
    return (
      <div
        className="bg-[#FAF8F5] min-h-[70vh] flex items-center justify-center py-16 px-4"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone-200/80 text-center shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-xs text-stone-500 mb-6">
            {apiError ||
              "Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không đúng."}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Quay lại sản phẩm</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(String(product.id || product._id));
  const currentPrice = selectedVariant?.price ?? product.basePrice;
  const currentStock = selectedVariant?.availableStock ?? product.stockCount;

  // Logic kiểm tra tồn kho chính xác theo biến thể được chọn
  const isSelectedOutOfStock = selectedVariant
    ? (selectedVariant.availableStock ?? 0) <= 0
    : currentStock <= 0;
  const currentSku = selectedVariant?.sku || product.sku || "SWL-OAK-NAT-001";

  const handleAddToCart = () => {
    if (isSelectedOutOfStock) return;
    const cartPayload = {
      ...product,
      variantId: selectedVariant?._id,
      price: currentPrice,
      variantLabel: selectedVariant
        ? [
            selectedVariant.color,
            selectedVariant.size,
            selectedVariant.material,
          ]
            .filter(Boolean)
            .join(" / ")
        : "Tiêu chuẩn",
    };
    addToCart(cartPayload, quantity);
    setIsCartOpen(true);
  };

  const formatPrice = (p) => formatCurrency(p);

  return (
    <div
      className="bg-[#FAF8F5] min-h-screen py-8"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-6">
          <nav className="flex items-center gap-2 text-xs text-stone-500">
            <Link to="/" className="hover:text-amber-800 transition-colors">
              Trang Chủ
            </Link>
            <ChevronRight size={12} />
            <Link
              to="/products"
              className="hover:text-amber-800 transition-colors"
            >
              Sản phẩm
            </Link>
            <ChevronRight size={12} />
            <span className="text-stone-900 font-medium truncate max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>

        {/* Product Main Section */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 lg:p-10 shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Product Image Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative w-full rounded-2xl overflow-hidden bg-[#FAF8F5] border border-stone-200/60 group flex items-center justify-center p-4">
                <img
                  src={selectedImage || product.gallery?.[0] || product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85";
                  }}
                  className="w-full max-h-125 object-contain object-center transition-transform duration-500 group-hover:scale-102"
                />

                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(true)}
                  className="absolute bottom-4 right-4 p-2.5 bg-white/90 hover:bg-white text-stone-800 rounded-full shadow-lg transition-all"
                  title="Phóng to ảnh"
                >
                  <ZoomIn size={18} />
                </button>

                <div className="absolute top-6 left-6 bg-stone-900/80 backdrop-blur-md text-amber-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <Award size={13} />
                  <span>Chứng nhận FSC® 100%</span>
                </div>
              </div>

              {/* Thumbnails Strip */}
              {product.gallery?.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {product.gallery.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-stone-50 flex items-center justify-center p-1 ${
                        selectedImage === imgUrl
                          ? "border-amber-800 ring-2 ring-amber-800/30 scale-95"
                          : "border-stone-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${index + 1}`}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                        }}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details & Variant Selection */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span
                    className="font-bold uppercase tracking-wider text-amber-800"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {product.brandName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("reviews");
                      const revSection = document.getElementById(
                        "product-tabs-section",
                      );
                      if (revSection) {
                        revSection.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="flex items-center gap-1.5 text-amber-600 hover:text-amber-800 font-semibold cursor-pointer transition-colors"
                  >
                    <Star
                      size={14}
                      className={
                        (totalReviews ||
                          product.reviewCount ||
                          reviews.length) > 0
                          ? "fill-[#C89D5C] text-[#C89D5C]"
                          : "text-stone-300"
                      }
                    />
                    {(totalReviews || product.reviewCount || reviews.length) >
                    0 ? (
                      <>
                        <span>
                          {Number(averageRating || product.rating || 0).toFixed(
                            1,
                          )}
                        </span>
                        <span className="text-stone-400 font-normal">
                          (
                          {totalReviews ||
                            product.reviewCount ||
                            reviews.length}{" "}
                          đánh giá)
                        </span>
                      </>
                    ) : (
                      <span className="text-stone-500 font-normal text-xs">
                        Chưa có đánh giá
                      </span>
                    )}
                  </button>
                </div>

                <h1
                  className="text-2xl sm:text-3xl font-bold text-stone-900 leading-snug mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {product.name}
                </h1>

                {/* Price Display & Single SKU Display */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-baseline gap-3">
                    <span
                      className="font-bold text-amber-900 text-3xl"
                      style={{ fontFamily: "'Montserrat', serif" }}
                    >
                      {formatPrice(currentPrice)}
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-stone-400 line-through">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-900 rounded-md border border-amber-200/60 font-mono">
                    SKU: {currentSku}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>

              {/* Hướng dẫn thêm hàm ánh xạ màu sắc phía trên component nếu chưa có */}
              {/* 
                const getColorCode = (colorName) => {
                  const map = {
                    "Black": "#1a1a1a",
                    "Gray": "#6b7280",
                    "Beige": "#f5f5dc",
                    "White": "#ffffff",
                    "Gold": "#d4af37",
                    "Vàng Đồng Champagne": "#c5a880"
                  };
                  return map[colorName] || "#cccccc";
                };
              */}

              {/* Variants Selector */}
              {variants.length > 0 && (
                <div className="border-t border-stone-100 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm font-bold text-stone-800"
                      style={{ fontFamily: "'Montserrat', serif" }}
                    >
                      Phiên bản & Tùy chọn:
                    </label>
                    {!isSelectedOutOfStock ? (
                      <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        Còn hàng (
                        {selectedVariant?.availableStock ?? currentStock} sản
                        phẩm)
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-rose-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                        Hết hàng
                      </span>
                    )}
                  </div>

                  {/* Hiển thị danh sách các biến thể với đầy đủ thông tin chi tiết */}
                  <div className="grid grid-cols-1 gap-3">
                    {variants.map((v) => {
                      const isSelected = selectedVariant?._id === v._id;

                      // Hàm ánh xạ mã màu CSS trực quan từ tên màu
                      const getColorCode = (cName) => {
                        const map = {
                          Black: "#1a1a1a",
                          Gray: "#6b7280",
                          Beige: "#f5f5dc",
                          White: "#ffffff",
                          Gold: "#d4af37",
                          "Vàng Đồng Champagne": "#c5a880",
                          Đen: "#1a1a1a",
                          Xám: "#6b7280",
                        };
                        for (const key in map) {
                          if (cName?.includes(key)) return map[key];
                        }
                        return "#d1d5db";
                      };

                      const colorHex = getColorCode(v.color);

                      return (
                        <button
                          key={v._id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? "border-amber-800 bg-amber-50/60 ring-2 ring-amber-800/20 shadow-sm"
                              : "border-stone-200 hover:border-stone-300 bg-white"
                          }`}
                        >
                          <div className="space-y-1.5 flex-1">
                            {/* Màu sắc kèm chấm tròn trực quan */}
                            {v.color && (
                              <div className="text-xs flex items-center gap-2">
                                <span
                                  style={{ backgroundColor: colorHex }}
                                  className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-inner inline-block shrink-0"
                                />
                                <span className="font-semibold text-stone-500">
                                  Màu:
                                </span>
                                <span className="font-bold text-amber-900">
                                  {v.color}
                                </span>
                              </div>
                            )}

                            {/* Kích thước */}
                            {v.size && (
                              <div className="text-xs text-stone-700 pl-5">
                                <span className="font-semibold text-stone-500">
                                  Kích thước:
                                </span>{" "}
                                {v.size}
                              </div>
                            )}

                            {/* Chất liệu */}
                            {v.material && (
                              <div className="text-xs text-stone-600 pl-5">
                                <span className="font-semibold text-stone-500">
                                  Chất liệu:
                                </span>{" "}
                                {v.material}
                              </div>
                            )}

                            {/* SKU */}
                            {/* {v.sku && (
                              <div className="text-[11px] text-stone-400 pl-5 font-mono">
                                <span className="font-semibold text-stone-500">
                                  SKU:
                                </span>{" "}
                                {v.sku}
                              </div>
                            )} */}
                          </div>

                          {/* Giá tiền riêng của từng variant */}
                          {/* <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-amber-900 block">
                              {formatPrice(v.price || product.basePrice)}
                            </span>
                            <span
                              className={`text-[10px] font-medium ${(v.availableStock ?? 0) > 0 ? "text-emerald-600" : "text-rose-500"}`}
                            >
                              {(v.availableStock ?? 0) > 0
                                ? `Còn: ${v.availableStock} sản phẩm`
                                : "Hết hàng"}
                            </span>
                          </div> */}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & CTA Buttons */}
              <div className="border-t border-stone-100 pt-5 space-y-4">
                <div className="flex items-center gap-4">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isSelectedOutOfStock}
                      className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-stone-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(
                            selectedVariant?.availableStock ?? currentStock,
                            q + 1,
                          ),
                        )
                      }
                      disabled={
                        quantity >=
                          (selectedVariant?.availableStock ?? currentStock) ||
                        isSelectedOutOfStock
                      }
                      className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button (Đồng bộ theo trạng thái của biến thể đang chọn) */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isSelectedOutOfStock}
                    className={`flex-1 py-3.5 px-6 text-xs tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isSelectedOutOfStock
                        ? "bg-stone-300 text-stone-600 cursor-not-allowed shadow-none"
                        : "bg-stone-900 hover:bg-amber-900 text-white cursor-pointer"
                    }`}
                  >
                    <ShoppingBag size={20} />
                    <span
                      style={{
                        fontSize: "15px",
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: "600",
                        color: "#8A6A48",
                      }}
                    >
                      {isSelectedOutOfStock ? "Hết Hàng" : "Thêm Vào Giỏ Hàng"}
                    </span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isWishlisted
                        ? "border-rose-300 bg-rose-50 text-rose-600"
                        : "border-stone-200 text-stone-600 hover:text-rose-600 hover:bg-stone-50"
                    }`}
                    title={
                      isWishlisted ? "Xóa khỏi yêu thích" : "Lưu vào yêu thích"
                    }
                  >
                    <Heart
                      size={18}
                      fill={isWishlisted ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Assurance Perks */}
                <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] text-stone-500">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-amber-800 shrink-0" />
                    <span>Miễn phí vận chuyển toàn quốc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={14}
                      className="text-amber-800 shrink-0"
                    />
                    <span>Bảo hành 10 năm khung sườn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info Section */}
        <div
          id="product-tabs-section"
          className="bg-white rounded-3xl border border-stone-200/80 p-6 lg:p-10 shadow-sm mb-12"
        >
          <div className="flex items-center gap-8 border-b border-stone-100 pb-4 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              style={{
                fontFamily: "'Montserrat', serif",
                fontWeight: "bold",
                color: "#111127",
              }}
              className={`text-sm font-bold pb-2 transition-all relative ${
                activeTab === "description"
                  ? "text-amber-900"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              Mô Tả Chi Tiết
              {activeTab === "description" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("specifications")}
              style={{
                fontFamily: "'Montserrat', serif",
                fontWeight: "bold",
                color: "#111127",
              }}
              className={`text-sm font-bold pb-2 transition-all relative ${
                activeTab === "specifications"
                  ? "text-amber-900"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              Thông Số Kỹ Thuật
              {activeTab === "specifications" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              style={{
                fontFamily: "'Montserrat', serif",
                fontWeight: "bold",
                color: "#111127",
              }}
              className={`text-sm font-bold pb-2 transition-all relative ${
                activeTab === "reviews"
                  ? "text-amber-900"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              Đánh Giá Khách Hàng ({totalReviews || reviews.length})
              {activeTab === "reviews" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800" />
              )}
            </button>
          </div>

          {activeTab === "description" && (
            <div className="prose max-w-none text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex justify-between text-xs"
                >
                  <span className="font-semibold text-stone-500">{key}:</span>
                  <span className="font-medium text-stone-800">{value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-8">
              {/* Rating Overview Box */}
              <div className="p-6 sm:p-8 bg-stone-50/80 rounded-2xl border border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6 border-b md:border-b-0 md:border-r border-stone-200/80 pb-6 md:pb-0 md:pr-8">
                  <div className="text-center min-w-30">
                    <div
                      className="text-5xl font-bold text-amber-900 leading-none mb-1.5"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {(totalReviews || reviews.length) > 0
                        ? Number(averageRating || 0).toFixed(1)
                        : "0.0"}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-amber-600 my-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          className={
                            (totalReviews || reviews.length) > 0 &&
                            s <= Math.round(averageRating || 0)
                              ? "fill-[#C89D5C] text-[#C89D5C]"
                              : "text-stone-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      {(totalReviews || reviews.length) > 0
                        ? `${totalReviews || reviews.length} lượt đánh giá`
                        : "Chưa có lượt đánh giá nào"}
                    </span>
                  </div>
                </div>

                <div className="flex-1 max-w-sm space-y-2">
                  {ratingBreakdown.map((item) => (
                    <div
                      key={item.star}
                      className="flex items-center gap-2.5 text-xs text-stone-600"
                    >
                      <span className="w-10 font-semibold text-stone-700 flex items-center gap-1">
                        {item.star}{" "}
                        <Star
                          size={11}
                          className="fill-[#C89D5C] text-[#C89D5C] inline"
                        />
                      </span>
                      <div className="flex-1 h-2 bg-stone-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-800 rounded-full transition-all duration-500"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-stone-400 font-mono text-[11px]">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center md:items-end justify-center gap-2 pt-2 md:pt-0">
                  <span className="text-xs text-stone-500 hidden sm:block text-right">
                    Bạn đã trải nghiệm tác phẩm này?
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-5 py-3 bg-[#8A6A48] hover:bg-[#705437] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 hover:shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Edit3 size={15} />
                    <span>Viết Đánh Giá</span>
                  </button>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-stone-200">
                    <Sparkles
                      size={36}
                      className="mx-auto text-amber-800/40 mb-3"
                    />
                    <h4 className="text-base font-bold text-stone-800 mb-1">
                      Chưa có đánh giá nào cho tác phẩm này
                    </h4>
                    <p className="text-xs text-stone-500 max-w-md mx-auto mb-4">
                      Hãy trở thành người đầu tiên trải nghiệm và chia sẻ cảm
                      xúc về thiết kế, chất liệu tới cộng đồng yêu nội thất
                      LUMORA.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="px-4 py-2 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 size={13} /> Gửi đánh giá đầu tiên
                    </button>
                  </div>
                ) : (
                  reviews.map((rev, idx) => {
                    const reviewerName =
                      rev.user?.fullName ||
                      rev.userId?.fullName ||
                      (typeof rev.user === "string"
                        ? `Khách hàng #${rev.user.slice(-4).toUpperCase()}`
                        : "Khách hàng LUMORA");
                    const initialChar = (reviewerName || "K")[0].toUpperCase();
                    const starVal = Number(rev.rating) || 5;
                    const formattedDate = rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "Đã xác thực";

                    return (
                      <div
                        key={rev._id || idx}
                        className="p-5 bg-stone-50/70 hover:bg-stone-50 rounded-2xl border border-stone-200/70 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#8A6A48] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {initialChar}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs sm:text-sm text-stone-900">
                                  {reviewerName}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 size={10} /> Đã mua hàng
                                </span>
                              </div>
                              <span className="text-[11px] text-stone-400">
                                {formattedDate}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={13}
                                className={
                                  s <= starVal
                                    ? "fill-[#C89D5C] text-[#C89D5C]"
                                    : "text-stone-300"
                                }
                              />
                            ))}
                            <span className="text-xs font-bold text-amber-800 ml-1">
                              {starVal}/5
                            </span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-12">
                          {rev.comment}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Zoomed view"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-stone-900/80 text-white rounded-full hover:bg-stone-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Product Review Modal */}
      <ProductReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        product={product}
        onSuccess={reloadReviews}
      />
    </div>
  );
}

export default ProductDetailPage;
