import React, { useState, useEffect } from "react";
import { storageAPI, productAPI } from "../../services/api";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  X,
  CheckCircle2,
  History,
  Package,
  Filter,
  AlertCircle,
} from "lucide-react";

const ImportExportStock = () => {
  const [activeMainTab, setActiveMainTab] = useState("products");
  const [historySubTab, setHistorySubTab] = useState("import");
  const [filterStatus, setFilterStatus] = useState("all");

  const [danhSachSanPham, setDanhSachSanPham] = useState([]);
  const [chungTu, setChungTu] = useState({ import: [], export: [] });
  const [loading, setLoading] = useState(true);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalType, setModalType] = useState("import");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);

  const [formData, setFormData] = useState({
    quantity: 1,
    note: "",
    partner: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      // Gọi song song API tồn kho, lịch sử giao dịch và sản phẩm admin
      const [invRes, txRes, productsRes] = await Promise.all([
        storageAPI.getInventory().catch(() => ({ data: { inventories: [] } })),
        storageAPI
          .getInventoryTransactions()
          .catch(() => ({ data: { transactions: [] } })),
        productAPI.getProductsAdmin
          ? productAPI
              .getProductsAdmin()
              .catch(() => ({ data: { products: [] } }))
          : Promise.resolve({ data: { products: [] } }),
      ]);

      const invBody = invRes?.data || {};
      const inventories = Array.isArray(invBody) 
        ? invBody 
        : (invBody.inventories || invBody.data?.inventories || invBody.items || invBody.data || []);
      
      const stockMap = new Map();

      // Mapping tồn kho vét cạn toàn bộ các trường hợp ID và SKU từ mảng inventory chung
      (Array.isArray(inventories) ? inventories : []).forEach((item) => {
        const invObj = item.inventory || item;
        const variantField = invObj.variantId || item.variantId;
        
        const vIdObj = typeof variantField === "object" && variantField !== null ? variantField : {};
        const vId1 = vIdObj._id;
        const vId2 = typeof variantField === "string" ? variantField : null;
        const sku = vIdObj.sku || invObj.sku || item.sku;
        
        const qty = invObj.quantity ?? invObj.stock ?? invObj.availableStock ?? item.quantity ?? item.stock ?? 0;

        if (vId1) stockMap.set(String(vId1).trim(), Number(qty));
        if (vId2) stockMap.set(String(vId2).trim(), Number(qty));
        if (sku) stockMap.set(String(sku).trim(), Number(qty));
      });

      const prodBody = productsRes?.data || {};
      const products =
        prodBody.products ||
        prodBody.data ||
        prodBody.rows ||
        (Array.isArray(prodBody) ? prodBody : []);

      const variantPromises = (Array.isArray(products) ? products : []).map(
        async (product) => {
          const prodId = product._id || product.id;
          const productName = product.name || "Sản phẩm nội thất";
          const productImage =
            product.image ||
            product.thumbnail ||
            product.images?.[0] ||
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80";

          try {
            const res = productAPI.getProductVariantsAdmin
              ? await productAPI
                  .getProductVariantsAdmin(prodId)
                  .catch(() => null)
              : productAPI.getClient
                ? await productAPI.getClient
                    .get(`/products/${prodId}/variants/admin`)
                    .catch(() => null)
                : null;

            const variantBody = res?.data || {};
            const variants =
              variantBody.variants ||
              variantBody.data ||
              variantBody.rows ||
              product.variants ||
              [];

            if (Array.isArray(variants) && variants.length > 0) {
              return Promise.all(
                variants.map(async (variant) => {
                  const variantId = variant._id || variant.id || variant.variantId;
                  const sku = variant.sku || variant.code || "SKU";
                  
                  let currentStock =
                    stockMap.get(String(variantId).trim()) ??
                    stockMap.get(String(sku).trim()) ??
                    0;

                  // Nếu chưa có trong mảng chung, gọi trực tiếp API GET /api/inventory/{variantId}
                  if (currentStock === 0 && variantId) {
                    try {
                      const singleInvRes = await storageAPI.getInventoryByVariantId(variantId).catch(() => null);
                      const singleBody = singleInvRes?.data || {};
                      // Đúng chuẩn cấu trúc Response F12: { inventory: { quantity: 77, ... } }
                      const singleInv = singleBody.inventory || singleBody.data || singleBody;
                      
                      const fetchedQty = singleInv.quantity ?? singleInv.stock ?? singleInv.availableStock;
                      if (fetchedQty !== undefined && fetchedQty !== null) {
                        currentStock = Number(fetchedQty);
                      }
                    } catch (e) {
                      // Bỏ qua nếu chưa có bản ghi kho riêng
                    }
                  }

                  const varImage = variant.image || productImage;

                  return {
                    variantId: String(variantId).trim(),
                    sku: String(sku).trim(),
                    name: productName,
                    image: varImage,
                    color: variant.color || variant.attributes?.color || "—",
                    size: variant.size || variant.attributes?.size || "—",
                    material:
                      variant.material || variant.attributes?.material || "—",
                    stock: Number(currentStock),
                  };
                })
              );
            }
          } catch (e) {
            console.error("Lỗi lấy variants cho sản phẩm:", prodId);
          }

          const fallbackId = String(prodId).trim();
          const fallbackSku = String(product.sku || "SKU").trim();
          let fallbackStock = stockMap.get(fallbackId) ?? stockMap.get(fallbackSku) ?? 0;

          if (fallbackStock === 0) {
            try {
              const singleInvRes = await storageAPI.getInventoryByVariantId(fallbackId).catch(() => null);
              const singleBody = singleInvRes?.data || {};
              const singleInv = singleBody.inventory || singleBody.data || singleBody;
              const fetchedQty = singleInv.quantity ?? singleInv.stock ?? singleInv.availableStock;
              if (fetchedQty !== undefined && fetchedQty !== null) {
                fallbackStock = Number(fetchedQty);
              }
            } catch (e) {}
          }

          return [
            {
              variantId: fallbackId,
              sku: fallbackSku,
              name: productName,
              image: productImage,
              color: product.color || "—",
              size: product.size || "—",
              material: product.material || "—",
              stock: Number(fallbackStock),
            },
          ];
        },
      );

      const nestedVariants = await Promise.all(variantPromises);
      const allVariants = nestedVariants.flat().filter(Boolean);
      setDanhSachSanPham(allVariants);

    // Xử lý lịch sử giao dịch (Nhập & Xuất kho) - Vét cạn mọi cấu trúc từ Backend
      const txBody = txRes?.data || {};
      const txData =
        txBody.transactions ||
        txBody.data?.transactions ||
        txBody.data?.rows ||
        txBody.data ||
        txBody.rows ||
        (Array.isArray(txBody) ? txBody : []);

      const importedList = [];
      const exportedList = [];

      (Array.isArray(txData) ? txData : []).forEach((tx) => {
        const variant = tx.variantId || tx.variant || {};
        const product = variant.productId || tx.product || {};
        const prodName =
          product.name || tx.productName || variant.name || "Sản phẩm nội thất";

        const itemObj = {
          date: tx.createdAt
            ? new Date(tx.createdAt).toLocaleString("vi-VN")
            : "Hôm nay",
          productName: prodName,
          quantity: tx.quantity || tx.amount || 0,
          note: tx.note || tx.description || (tx.orderId ? `Đơn hàng #${tx.orderId}` : "Giao dịch hệ thống"),
          status: "Hoàn Thành",
        };

        const typeStr = String(tx.type || tx.action || tx.category || "").toUpperCase();

        // Phân loại Nhập kho
        if (
          typeStr.includes("IMPORT") ||
          typeStr.includes("NHẬP") ||
          typeStr.includes("RESTORE") ||
          typeStr.includes("IN")
        ) {
          importedList.push(itemObj);
        } 
        // Phân loại Xuất kho (Bao gồm EXPORT, DEDUCTION, SALE, ORDER, OUT hoặc bất kỳ giao dịch trừ kho tự động nào)
        else if (
          typeStr.includes("EXPORT") ||
          typeStr.includes("XUẤT") ||
          typeStr.includes("DEDUCTION") ||
          typeStr.includes("OUT") ||
          typeStr.includes("SALE") ||
          typeStr.includes("ORDER") ||
          typeStr === "" // Nếu backend lỡ trả về transaction mà quên gán type thì tự động xếp vào xuất kho hoặc giao dịch chung
        ) {
          exportedList.push(itemObj);
        }
      });

      setChungTu({ import: importedList, export: exportedList });
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenActionModal = (product, type) => {
    setSelectedProduct(product);
    setModalType(type);
    setFormData({ quantity: 1, note: "", partner: "" });
    setThongBaoThanhCong("");
    setErrorMessage("");
    setIsOpenModal(true);
  };

  const handleOpenDetailModal = (product) => {
    setDetailProduct(product);
    setIsOpenDetailModal(true);
  };

  const handleThaoTacKho = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setErrorMessage("");
    const qtyNum = Number(formData.quantity);

    if (modalType === "export" && qtyNum > selectedProduct.stock) {
      setErrorMessage("Sản phẩm này không đủ số lượng yêu cầu!");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        quantity: qtyNum,
        note:
          [
            formData.partner ? `Đối tác: ${formData.partner}` : "",
            formData.note,
          ]
            .filter(Boolean)
            .join(" - ") || (modalType === "import" ? "Nhập kho" : "Xuất kho"),
      };

      if (modalType === "import") {
        await storageAPI.importInventory(selectedProduct.variantId, payload);
      } else {
        await storageAPI.exportInventory(selectedProduct.variantId, payload);
      }

      // Lấy lại tồn kho chuẩn xác từ API chi tiết sau khi thao tác
      let latestStock = selectedProduct.stock + (modalType === "import" ? qtyNum : -qtyNum);
      try {
        const singleRes = await storageAPI.getInventoryByVariantId(selectedProduct.variantId);
        const singleBody = singleRes?.data || {};
        const singleInv = singleBody.inventory || singleBody.data || singleBody;
        const fetchedQty = singleInv.quantity ?? singleInv.stock ?? singleInv.availableStock;
        if (fetchedQty !== undefined && fetchedQty !== null) {
          latestStock = Number(fetchedQty);
        }
      } catch (err) {
        console.error("Không thể lấy tồn kho chi tiết:", err);
      }

      // Cập nhật ngay lập tức vào state danh sách sản phẩm
      setDanhSachSanPham((prevList) =>
        prevList.map((item) => {
          const isMatch =
            String(item.variantId).trim() === String(selectedProduct.variantId).trim() ||
            String(item.sku).trim() === String(selectedProduct.sku).trim();
          return isMatch ? { ...item, stock: Number(latestStock) } : item;
        })
      );

      setThongBaoThanhCong(
        `Tạo phiếu ${modalType === "import" ? "nhập" : "xuất"} kho thành công!`,
      );
      
      fetchData();

      setTimeout(() => {
        setThongBaoThanhCong("");
        setIsOpenModal(false);
      }, 1200);
    } catch (err) {
      console.error("Lỗi thao tác kho:", err);
      setErrorMessage(
        "Lỗi: Biến thể này chưa có bản ghi Inventory trên server hoặc dữ liệu không hợp lệ!",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = danhSachSanPham.filter((item) => {
    if (filterStatus === "in_stock") {
      return item.stock > 0;
    }
    if (filterStatus === "out_of_stock") {
      return item.stock === 0;
    }
    return true;
  });

  return (
    <div
      className="dashboard-main"
      style={{
        fontFamily: "ui-rounded",
        paddingBottom: "60px",
        padding: "24px",
      }}
    >
      <header
        className="dash-header"
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <span
            className="subtitle"
            style={{ fontSize: "11px", fontWeight: 700, color: "#78716c" }}
          >
            QUẢN LÝ DÒNG CHẢY HÀNG HÓA
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2rem",
              color: "#1a1a1a",
              fontWeight: 600,
              margin: "4px 0",
            }}
          >
            Quản Lý Nhập Kho & Xuất Kho
          </h2>
        </div>
      </header>

      {/* THANH TAB CHÍNH */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          borderBottom: "1px solid #eae6df",
          paddingBottom: "12px",
        }}
      >
        <button
          onClick={() => setActiveMainTab("products")}
          style={{
            padding: "9px 20px",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            background: activeMainTab === "products" ? "#1c1c1c" : "#fff",
            color: activeMainTab === "products" ? "#fff" : "#666",
            border: "1px solid #e2ded8",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Package size={16} /> Danh Sách SKU & Thao Tác
        </button>
        <button
          onClick={() => setActiveMainTab("history")}
          style={{
            padding: "9px 20px",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            background: activeMainTab === "history" ? "#1c1c1c" : "#fff",
            color: activeMainTab === "history" ? "#fff" : "#666",
            border: "1px solid #e2ded8",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <History size={16} /> Xem Lịch Sử Nhập / Xuất
        </button>
      </div>

      {/* TAB 1: DANH SÁCH SKU */}
      {activeMainTab === "products" && (
        <section
          style={{
            background: "#fff",
            border: "1px solid #eae6df",
            borderRadius: "12px",
            overflow: "hidden",
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Package size={28} color="#1c1c1c" />
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Danh Sách SKU & Biến Thể Quản Trị
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={15} color="#78716c" />
              <span
                style={{ fontSize: "12px", fontWeight: 600, color: "#78716c" }}
              >
                Lọc:
              </span>
              <button
                onClick={() => setFilterStatus("all")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: filterStatus === "all" ? "#1c1c1c" : "#f5f2eb",
                  color: filterStatus === "all" ? "#fff" : "#57534e",
                  border: "none",
                }}
              >
                Tất cả ({danhSachSanPham.length})
              </button>
              <button
                onClick={() => setFilterStatus("in_stock")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: filterStatus === "in_stock" ? "#16a34a" : "#f5f2eb",
                  color: filterStatus === "in_stock" ? "#fff" : "#57534e",
                  border: "none",
                }}
              >
                Còn hàng ({danhSachSanPham.filter(i => i.stock > 0).length})
              </button>
              <button
                onClick={() => setFilterStatus("out_of_stock")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: filterStatus === "out_of_stock" ? "#dc2626" : "#f5f2eb",
                  color: filterStatus === "out_of_stock" ? "#fff" : "#57534e",
                  border: "none",
                }}
              >
                Hết hàng ({danhSachSanPham.filter(i => i.stock === 0).length})
              </button>
            </div>
          </div>

          {loading ? (
            <div
              style={{ padding: "50px", textAlign: "center", color: "#78716c" }}
            >
              Đang tải danh sách SKU từ hệ thống...
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "#faf8f5",
                      color: "#78716c",
                      fontSize: "12px",
                      fontWeight: 700,
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "14px 16px", width: "100px" }}>
                      HÌNH ẢNH
                    </th>
                    <th style={{ padding: "14px 16px" }}>MÃ SKU</th>
                    <th style={{ padding: "14px 16px" }}>TÊN SẢN PHẨM</th>
                    <th style={{ padding: "14px 16px", textAlign: "center" }}>
                      TỒN KHO
                    </th>
                    <th style={{ padding: "14px 16px", textAlign: "center" }}>
                      HÀNH ĐỘNG
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((item) => (
                      <tr
                        key={item.variantId}
                        style={{ borderBottom: "1px solid #f2efeb" }}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            onClick={() => handleOpenDetailModal(item)}
                            style={{
                              width: "48px",
                              height: "48px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              cursor: "pointer",
                              border: "1px solid #eae6df",
                            }}
                            title="Nhấp để xem chi tiết"
                          />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#b45309",
                              background: "#fef3c7",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {item.sku}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <strong
                            onClick={() => handleOpenDetailModal(item)}
                            style={{
                              fontSize: "13px",
                              display: "block",
                              color: "#1a1a1a",
                              cursor: "pointer",
                            }}
                            title="Nhấp để xem chi tiết"
                          >
                            {item.name}
                          </strong>
                          <span style={{ fontSize: "11px", color: "#78716c" }}>
                            Màu: {item.color} | Size: {item.size}
                          </span>
                        </td>
                        <td
                          style={{ padding: "14px 16px", textAlign: "center" }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "14px",
                              color: item.stock > 0 ? "#16a34a" : "#dc2626",
                            }}
                          >
                            {item.stock} cái
                          </span>
                        </td>
                        <td
                          style={{ padding: "14px 16px", textAlign: "center" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              onClick={() =>
                                handleOpenActionModal(item, "import")
                              }
                              style={{
                                padding: "7px 14px",
                                background: "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <ArrowDownLeft size={14} /> Nhập Kho
                            </button>
                            <button
                              onClick={() =>
                                handleOpenActionModal(item, "export")
                              }
                              style={{
                                padding: "7px 14px",
                                background: "#dc2626",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <ArrowUpRight size={14} /> Xuất Kho
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          color: "#8c857b",
                        }}
                      >
                        Không tìm thấy SKU nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: LỊCH SỬ */}
      {activeMainTab === "history" && (
        <section
          style={{
            background: "#fff",
            border: "1px solid #eae6df",
            borderRadius: "12px",
            overflow: "hidden",
            padding: "16px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <button
              onClick={() => setHistorySubTab("import")}
              style={{
                padding: "7px 16px",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
                background: historySubTab === "import" ? "#1c1c1c" : "#f5f2eb",
                color: historySubTab === "import" ? "#fff" : "#666",
                border: "none",
                fontSize: "12px",
              }}
            >
              Phiếu Nhập Kho ({chungTu.import.length})
            </button>
            <button
              onClick={() => setHistorySubTab("export")}
              style={{
                padding: "7px 16px",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
                background: historySubTab === "export" ? "#1c1c1c" : "#f5f2eb",
                color: historySubTab === "export" ? "#fff" : "#666",
                border: "none",
                fontSize: "12px",
              }}
            >
              Phiếu Xuất Kho ({chungTu.export.length})
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <FileText size={16} color="#1c1c1c" />
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
              Lịch Sử {historySubTab === "import" ? "Nhập Kho" : "Xuất Kho"}
            </h3>
          </div>

          {loading ? (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#78716c" }}
            >
              Đang tải lịch sử...
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "#faf8f5",
                      color: "#78716c",
                      fontSize: "11px",
                      fontWeight: 700,
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "12px 16px" }}>THỜI GIAN</th>
                    <th style={{ padding: "12px 16px" }}>TÊN SẢN PHẨM</th>
                    <th style={{ padding: "12px 16px", textAlign: "center" }}>
                      SỐ LƯỢNG
                    </th>
                    <th style={{ padding: "12px 16px" }}>GHI CHÚ / ĐỐI TÁC</th>
                    <th style={{ padding: "12px 16px", textAlign: "center" }}>
                      TRẠNG THÁI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chungTu[historySubTab].length > 0 ? (
                    chungTu[historySubTab].map((item, idx) => (
                      <tr
                        key={idx}
                        style={{ borderBottom: "1px solid #f2efeb" }}
                      >
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: "12px",
                            color: "#57534e",
                          }}
                        >
                          {item.date}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <strong style={{ fontSize: "13px" }}>
                            {item.productName}
                          </strong>
                        </td>
                        <td
                          style={{ padding: "14px 16px", textAlign: "center" }}
                        >
                          <strong
                            style={{
                              color:
                                historySubTab === "import"
                                  ? "#16a34a"
                                  : "#dc2626",
                              fontSize: "13px",
                            }}
                          >
                            {historySubTab === "import"
                              ? `+${item.quantity}`
                              : `-${item.quantity}`}
                          </strong>
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: "12px",
                            color: "#78716c",
                          }}
                        >
                          {item.note || "Không có ghi chú"}
                        </td>
                        <td
                          style={{ padding: "14px 16px", textAlign: "center" }}
                        >
                          <span
                            style={{
                              background: "#ecfdf5",
                              color: "#059669",
                              padding: "3px 8px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: "center",
                          padding: "30px",
                          color: "#8c857b",
                          fontSize: "13px",
                        }}
                      >
                        Chưa có lịch sử giao dịch nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* MODAL XEM CHI TIẾT SẢN PHẨM */}
      {isOpenDetailModal && detailProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "500px",
              borderRadius: "16px",
              padding: "28px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
                borderBottom: "1px solid #eae6df",
                paddingBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                Chi Tiết Sản Phẩm & SKU
              </h3>
              <button
                onClick={() => setIsOpenDetailModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <img
                src={detailProduct.image}
                alt={detailProduct.name}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  border: "1px solid #eae6df",
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#b45309",
                    background: "#fef3c7",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {detailProduct.sku}
                </span>
                <h4
                  style={{
                    margin: "6px 0 4px",
                    fontSize: "1.1rem",
                    color: "#1a1a1a",
                  }}
                >
                  {detailProduct.name}
                </h4>
                <span
                  style={{
                    fontSize: "13px",
                    color: detailProduct.stock > 0 ? "#16a34a" : "#dc2626",
                    fontWeight: 700,
                  }}
                >
                  Tồn kho: {detailProduct.stock} cái
                </span>
              </div>
            </div>

            <div
              style={{
                background: "#faf8f5",
                padding: "14px",
                borderRadius: "10px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              <div>
                <strong>Màu sắc:</strong> {detailProduct.color}
              </div>
              <div>
                <strong>Kích thước:</strong> {detailProduct.size}
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <strong>Chất liệu:</strong> {detailProduct.material}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsOpenDetailModal(false)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "8px",
                  background: "#1c1c1c",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM NHẬP / XUẤT */}
      {isOpenModal && selectedProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "480px",
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
                borderBottom: "1px solid #eae6df",
                paddingBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: modalType === "import" ? "#16a34a" : "#dc2626",
                }}
              >
                {modalType === "import" ? "📥 Nhập Kho SKU" : "📤 Xuất Kho SKU"}
              </h3>
              <button
                onClick={() => setIsOpenModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "16px",
                padding: "10px 14px",
                background: "#faf8f5",
                borderRadius: "8px",
                alignItems: "center",
              }}
            >
              <img
                src={selectedProduct.image}
                alt=""
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
              <div style={{ fontSize: "13px" }}>
                <strong>{selectedProduct.name}</strong> <br />
                <span style={{ color: "#78716c", fontSize: "12px" }}>
                  SKU: {selectedProduct.sku} <br />
                  <strong>Tồn hiện tại:</strong>{" "}
                  <span
                    style={{
                      color: selectedProduct.stock > 0 ? "#16a34a" : "#dc2626",
                      fontWeight: 700,
                    }}
                  >
                    {selectedProduct.stock} cái
                  </span>
                </span>
              </div>
            </div>

            {errorMessage && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  marginBottom: "14px",
                  color: "#dc2626",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {thongBaoThanhCong ? (
              <div
                style={{
                  padding: "24px",
                  background: "#f0fdf4",
                  borderRadius: "12px",
                  textAlign: "center",
                  color: "#16a34a",
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={36} style={{ margin: "0 auto 10px" }} />
                {thongBaoThanhCong}
              </div>
            ) : (
              <form
                onSubmit={handleThaoTacKho}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#78716c",
                    }}
                  >
                    SỐ LƯỢNG {modalType === "import" ? "NHẬP" : "XUẤT"} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 1,
                      });
                      setErrorMessage("");
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      boxSizing: "border-box",
                      fontSize: "13px",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#78716c",
                    }}
                  >
                    ĐỐI TÁC / NHÀ CUNG CẤP
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên đối tác hoặc nhà cung cấp..."
                    value={formData.partner}
                    onChange={(e) =>
                      setFormData({ ...formData, partner: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      boxSizing: "border-box",
                      fontSize: "13px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#78716c",
                    }}
                  >
                    GHI CHÚ GIAO DỊCH
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Nhập ghi chú chi tiết..."
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      boxSizing: "border-box",
                      fontSize: "13px",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "8px",
                    borderTop: "1px solid #eae6df",
                    paddingTop: "14px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsOpenModal(false)}
                    style={{
                      padding: "9px 16px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "9px 20px",
                      borderRadius: "8px",
                      background:
                        modalType === "import" ? "#16a34a" : "#dc2626",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    {submitting ? "Đang lưu..." : "Xác Nhận Thực Hiện"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExportStock;