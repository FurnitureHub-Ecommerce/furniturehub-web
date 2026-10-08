export const ORDER_DETAIL_ACCESS_STATE = Object.freeze({
  code: "BACKEND_AUTHORIZATION_REQUIRED",
  title: "Chi tiết đơn hàng chưa khả dụng",
  message:
    "Backend hiện chưa cấp quyền truy cập API chi tiết đơn hàng cho tài khoản Admin.",
});

export function getOrderDetailAvailability(orderId) {
  // Route vẫn nhận orderId nhưng không gọi endpoint Customer-only bằng phiên Admin.
  return {
    ...ORDER_DETAIL_ACCESS_STATE,
    orderId: typeof orderId === "string" && orderId.trim() ? orderId.trim() : null,
  };
}
