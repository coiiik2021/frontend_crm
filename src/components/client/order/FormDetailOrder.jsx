import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function FormDetailOrder({
  recipientInfo,
  packages,
  products,
  productsTotal,
  selectedService,
  dataRequest,
  setDataRequest,
}) {
  const [showProductsForm, setShowProductsForm] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Tạo invoiceData từ props
  const invoiceData = {
    invoiceNo: "INVOICE",
    date: new Date().toLocaleDateString(),
    airWaybillNo: "",

    // Tính toán weight và dimensions từ packages
    weight: packages
      .reduce((sum, pkg) => {
        const weight = parseFloat(pkg.weight) || 0;
        return sum + weight;
      }, 0)
      .toFixed(1),
    dimensions: packages
      .map((pkg) => {
        const length = pkg.length || 0;
        const width = pkg.width || 0;
        const height = pkg.height || 0;
        return `${length}*${width}*${height}`;
      })
      .join(", "),
    insuranceValue: "9.5",

    // Thông tin người gửi (cố định)
    shipper: {
      name: "CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ VẬN CHUYỂN QUỐC TẾ VIỆT NAM",
      address: "Số 1, Đường số 2, Phường 3, Quận 4, TP.HCM",
      phone: "0123456789",
      email: "info@example.com",
    },

    consignee: {
      name: recipientInfo.name,
      company: recipientInfo.company,
      address: `${recipientInfo.street}, ${recipientInfo.city}, ${recipientInfo.state} ${recipientInfo.postCode}`,
      phone: recipientInfo.phone,
      email: recipientInfo.email,
      country: recipientInfo.country,
    },

    // Chuyển đổi products thành items
    items: products.map((product) => ({
      description: product["Mô tả sản phẩm"] || "",
      origin: product["Xuất xứ"] || "",
      quantity: product["Số lượng"] || 0,
      unit: product["Kiểu đơn vị"] || "",
      unitPrice: product["Giá trên 1 sản phẩm"] || 0,
      subtotal: product["Giá Trị"] || 0,
    })),

    totalValue: productsTotal.priceProduct,
    selectedService: selectedService,
  };

  useEffect(() => {
    const newList = products.map((product) => ({
      id: product.id,
      description: product["Mô tả sản phẩm"],
      origin: product["Xuất xứ"],
      unit: product["Kiểu đơn vị"],
      quantity: product["Số lượng"],
      totalPrice: product.totalPrice,
      price: product.price,
    }));

    const newPackages = packages.map((p) => ({
      weight: p.weight,
      length: p.length,
      width: p.width,
      height: p.height,
    }));

    const dataRequestAPI = {
      recipientInfo: recipientInfo,
      serviceSelectInfo: selectedService,
      products: newList,
      packages: newPackages,
      productsTotal: productsTotal,
    };
    setDataRequest(dataRequestAPI);
  }, []);

  const formatCurrency = (amount) => {
    const num = parseFloat(String(amount).replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  useEffect(() => {
    console.log("dataRequest", dataRequest);
  }, []);

  const [priceNet, setPriceNet] = useState(selectedService.totalPrice);
  const [priceTransport, setPriceTransport] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(priceNet + priceTransport);
  const [isEdited, setIsEdited] = useState(false);
  const [priceNetNew, setPriceNetNew] = useState(priceNet);

  const handlePriceChange = (value, setter) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setter(numericValue ? parseInt(numericValue, 10) : 0);
    setIsEdited(false);
  };

  const handlePriceConfirm = () => {
    setOriginalTotal(priceNetNew + priceTransport);
    setIsEdited(true);
  };

  const exportToExcel = () => {
    // Lấy dữ liệu động
    const shipper = invoiceData.shipper;
    const consignee = invoiceData.consignee;
    const items = invoiceData.items;
    const invoiceNo = invoiceData.invoiceNo;
    const date = invoiceData.date;
    const airWaybillNo = selectedService?.trackingNumber || "";
    const shippingMethod = selectedService?.carrier || "";
    const weight = invoiceData.weight + " KGS";
    const dimensions = invoiceData.dimensions;
    const totalValue = invoiceData.totalValue;

    // Tạo mảng dữ liệu mô phỏng bố cục invoice.html
    const data = [
      ["", "", "", "", "INVOICE", "", "", "", ""], // B1-I1 merge
      ["", "", "", "", "", "", "", "", ""],
      ["", "", "Invoice No.:", invoiceNo, "", "", "", "Date:", date],
      ["", "", "", "", "", "", "", "", ""],
      ["", "SHIPPER", "", "", "", "", "", "Air waybill No.", airWaybillNo],
      ["", "Company Name", shipper.name, "", "", "", "", "", shippingMethod],
      ["", "Address", shipper.address, "", "", "", "", "", ""],
      ["", "Town/ Area Code", shipper.address, "", "", "", "", "", ""],
      ["", "State/ Country", "VIETNAM", "", "", "", "", "", ""],
      ["", "Tax Code", "0399321378", "", "", "", "", "", "1"],
      ["", "Contact Name", shipper.name, "", "", "", "", "", ""],
      ["", "Phone/Fax No.", shipper.phone, "", "", "", "", "", weight],
      ["", "", "", "", "", "", "", "", dimensions],
      ["", "CONSIGNEE", "", "", "", "", "", "", ""],
      ["", "Company Name", consignee.company, "", "", "", "", "", ""],
      ["", "Address", consignee.address, "", "", "", "", "", ""],
      ["", "Postal code", consignee.postCode, "", "", "", "", "", ""],
      ["", "State/ Country", consignee.country, "", "", "", "", "", ""],
      ["", "Contact Name", consignee.name, "", "", "", "", "", ""],
      ["", "Phone/Fax No.", consignee.phone, "", "", "", "", "", ""],
      [""],
      [
        "",
        "Full Description of Goods",
        "",
        "",
        "Origin",
        "Q'Ty",
        "Unit",
        "Unit Price",
        "Subtotal",
      ],
      [
        "",
        "(Name of goods, composition of material, marks, etc)",
        "",
        "",
        "",
        "",
        "(pcs/sets)",
        "(in USD)",
        "(in USD)",
      ],
      ...items.map((p) => [
        "",
        p.description,
        "",
        "",
        p.origin,
        p.quantity,
        p.unit,
        p.unitPrice,
        p.subtotal,
      ]),
      ["", "", "", "", "", "", "", "Total Value (in USD)", totalValue],
      ["", "SAMPLE", "", "", "", "", "", "", ""],
      ["Reason for Export", "", "", "", "", "", "", "", ""],
      [
        "I declare that the information is true and correct to the best of my knowledge,",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        "and that the goods are of VIETNAM origin.",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        "I (name)",
        "",
        "",
        "",
        "",
        "certify that the particulars and",
        "",
        "",
        "",
      ],
      [
        "quantity of goods specified in this document are goods which are submitted for",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      ["clearance for export out of Vietnam.", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "Signature/Title/Stamp", "", ""],
      ["", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", ""],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Merge cell theo mẫu
    ws["!merges"] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 8 } }, // INVOICE
      { s: { r: 4, c: 1 }, e: { r: 4, c: 6 } }, // SHIPPER
      { s: { r: 13, c: 1 }, e: { r: 13, c: 6 } }, // CONSIGNEE
      { s: { r: 21, c: 1 }, e: { r: 21, c: 3 } }, // Full Description of Goods header
      { s: { r: 22, c: 1 }, e: { r: 22, c: 3 } }, // (Name of goods...) subheader
    ];

    // Border style dưới (gạch dưới)
    const borderBottom = {
      bottom: { style: "thin", color: { rgb: "000000" } },
    };
    // Border quanh cho bảng sản phẩm
    const borderAll = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    };

    // Set style cho các dòng cần gạch dưới
    const underlineRows = [
      2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20,
    ];
    underlineRows.forEach((r) => {
      for (let c = 0; c < 9; c++) {
        const col = String.fromCharCode(65 + c);
        const cell = `${col}${r + 1}`;
        if (ws[cell]) {
          ws[cell].s = ws[cell].s || {};
          ws[cell].s.border = borderBottom;
        }
      }
    });

    // Set style cho header bảng sản phẩm
    for (let c = 1; c < 9; c++) {
      const col = String.fromCharCode(65 + c);
      const cell = `${col}23`;
      if (ws[cell]) {
        ws[cell].s = ws[cell].s || {};
        ws[cell].s.font = { bold: true };
        ws[cell].s.alignment = { horizontal: "center", vertical: "center" };
        ws[cell].s.border = borderAll;
      }
    }
    // Set border cho bảng sản phẩm
    const startRow = 24;
    const endRow = 24 + items.length;
    for (let r = startRow; r < endRow; r++) {
      for (let c = 1; c < 9; c++) {
        const col = String.fromCharCode(65 + c);
        const cell = `${col}${r + 1}`;
        if (ws[cell]) {
          ws[cell].s = ws[cell].s || {};
          ws[cell].s.border = borderAll;
          // Wrap text cho mô tả sản phẩm
          if (c === 1) {
            ws[cell].s.alignment = { wrapText: true, vertical: "top" };
          }
        }
      }
    }
    // Set style cho dòng tổng
    for (let c = 1; c < 9; c++) {
      const col = String.fromCharCode(65 + c);
      const cell = `${col}${endRow + 1}`;
      if (ws[cell]) {
        ws[cell].s = ws[cell].s || {};
        ws[cell].s.font = { bold: true };
        ws[cell].s.border = borderAll;
      }
    }

    // Set font đậm cho các mục
    [1, 5, 14].forEach((r) => {
      const cell = `B${r + 1}`;
      if (ws[cell]) {
        ws[cell].s = ws[cell].s || {};
        ws[cell].s.font = { bold: true };
      }
    });
    // Set căn giữa cho tiêu đề
    ws["B1"].s = ws["B1"].s || {};
    ws["B1"].s.font = { bold: true, sz: 28 };
    ws["B1"].s.alignment = { horizontal: "center", vertical: "center" };

    // Độ rộng cột lớn cho bảng đẹp
    ws["!cols"] = [
      { wch: 5 }, // A
      { wch: 60 }, // B - mô tả sản phẩm
      { wch: 15 }, // C
      { wch: 15 }, // D
      { wch: 15 }, // E
      { wch: 15 }, // F
      { wch: 15 }, // G
      { wch: 20 }, // H
      { wch: 20 }, // I
    ];
    // Chiều cao dòng cho tiêu đề và bảng sản phẩm
    ws["!rows"] = [
      { hpt: 40 }, // dòng 1: INVOICE
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      { hpt: 30 }, // dòng header bảng sản phẩm
      { hpt: 25 }, // dòng subheader bảng sản phẩm
      ...Array(items.length).fill({ hpt: 60 }), // các dòng sản phẩm
    ];

    // Xuất file
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `invoice_${invoiceNo}.xlsx`);

    // Thêm các dòng này vào cuối mảng `data` (có thể merge cell cho các dòng dài).
    ws["!merges"].push(
      { s: { r: endRow + 1, c: 1 }, e: { r: endRow + 1, c: 3 } }, // SAMPLE
      { s: { r: endRow + 2, c: 0 }, e: { r: endRow + 2, c: 8 } }, // Reason for Export
      { s: { r: endRow + 3, c: 0 }, e: { r: endRow + 3, c: 8 } }, // I declare...
      { s: { r: endRow + 4, c: 0 }, e: { r: endRow + 4, c: 8 } }, // and that the goods...
      { s: { r: endRow + 5, c: 0 }, e: { r: endRow + 5, c: 4 } }, // I (name)
      { s: { r: endRow + 5, c: 5 }, e: { r: endRow + 5, c: 8 } }, // certify that...
      { s: { r: endRow + 6, c: 0 }, e: { r: endRow + 6, c: 8 } }, // quantity of goods...
      { s: { r: endRow + 7, c: 0 }, e: { r: endRow + 7, c: 8 } }, // clearance for export...
      { s: { r: endRow + 8, c: 6 }, e: { r: endRow + 8, c: 8 } } // Signature/Title/Stamp
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md">
      {/* Header */}
      <div className="text-center mb-6 flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold uppercase">
          {invoiceData.invoiceNo}
        </h1>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 text-sm"
          onClick={exportToExcel}
        >
          Xuất Excel
        </button>
      </div>

      {/* Invoice Info */}
      <div className="flex justify-between mb-8">
        <div className="w-1/2">
          <p className="font-semibold">SHIPPER</p>
          <p>Company Name: {invoiceData.shipper.name}</p>
          <p>Address: {invoiceData.shipper.address}</p>
          <p>Phone: {invoiceData.shipper.phone}</p>
          <p>Email: {invoiceData.shipper.email}</p>
        </div>

        <div className="w-1/2 text-right">
          <p>Invoice No.: {invoiceData.invoiceNo}</p>
          <p>Date: {invoiceData.date}</p>
          <p className="mt-4 font-semibold">
            Air waybill No.: {invoiceData.airWaybillNo}
          </p>
          <p>Shipping Method: {selectedService.carrier}</p>
          <p>Weight: {invoiceData.weight} kg</p>
          <p>Dimensions: {invoiceData.dimensions} cm</p>
        </div>
      </div>

      {/* Consignee */}
      <div className="mb-8">
        <p className="font-semibold">CONSIGNEE</p>
        <p>Company Name: {invoiceData.consignee.company}</p>
        <p>Address: {invoiceData.consignee.address}</p>
        <p>Email: {invoiceData.consignee.email}</p>
        <p>Phone: {invoiceData.consignee.phone}</p>
      </div>

      {/* Products Form Toggle Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowProductsForm(!showProductsForm)}
          className="flex items-center text-purple-600 hover:text-purple-700 font-medium"
        >
          <span className="mr-2">
            {showProductsForm ? "Ẩn" : "Hiện"} danh sách sản phẩm
          </span>
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${
              showProductsForm ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="roshippingMethodund"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Items Table */}
      {showProductsForm && (
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">
                  Full Description of Goods
                </th>
                <th className="border p-2">Origin</th>
                <th className="border p-2">Q'Ty</th>
                <th className="border p-2">Unit (pcs/sets)</th>
                <th className="border p-2">Unit Price (in USD)</th>
                <th className="border p-2">Subtotal (in USD)</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index} className="border">
                  <td className="border p-2 text-xs">
                    {item.description.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </td>
                  <td className="border p-2 text-center">{item.origin}</td>
                  <td className="border p-2 text-center">{item.quantity}</td>
                  <td className="border p-2 text-center">{item.unit}</td>
                  {/* <td className="border p-2 text-center">{item.unitPrice.toFixed(2)}</td> */}
                  <td className="border p-2 text-center">
                    {item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <div className="w-1/4">
              <p className="font-semibold">
                Total Value (in USD): {invoiceData.totalValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thêm phần hiển thị thông tin dịch vụ */}
      {selectedService && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin dịch vụ vận chuyển
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Hãng vận chuyển</p>
              <p className="font-medium">{selectedService.carrier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dịch vụ</p>
              <p className="font-medium">{selectedService.service}</p>
            </div>
            <div>
              {/*<p className="text-sm text-gray-600">Thời gian giao hàng</p>*/}
              {/*<p className="font-medium">{selectedService.deliveryTime}</p>*/}
              {/*<p className="text-xs text-gray-500">*/}
              {/*    {selectedService.deliveryDateBegin} - {selectedService.deliveryDateEnd}*/}
              {/*</p>*/}
            </div>
            <div>
              <p className="text-sm text-gray-600">Khu vực</p>
              <p className="font-medium">{selectedService.zone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600 mb-2">Chi tiết phí</p>
              <div className="bg-white p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Phí cơ bản</p>
                    <p className="font-medium">
                      {formatCurrency(selectedService.priceNet)} VND
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phí xăng dầu</p>
                    <p className="font-medium">
                      {formatCurrency(selectedService.pricePPXD)} VND
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phí quá khổ</p>
                    <p className="font-medium">
                      {formatCurrency(
                        selectedService.overSize
                          ? selectedService.overSize.price
                          : 0
                      )}{" "}
                      VND
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">VAT (8%)</p>
                    <p className="font-medium">
                      {formatCurrency(selectedService.VAT)} VND
                    </p>
                  </div>
                  {priceTransport !== 0 && (
                    <div>
                      <p className="text-xs text-gray-500">Phụ phí khác</p>
                      <p className="font-medium">
                        {formatCurrency(priceTransport)} VND
                      </p>
                    </div>
                  )}
                  <div className="col-span-2 border-t pt-2 mt-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Tổng cộng
                    </p>
                    <p className="text-lg font-bold text-blue-600 flex items-center space-x-2">
                      {isConfirmed && (
                        <span className="line-through text-gray-400 mr-2">
                          {formatCurrency(priceNet)} VND
                        </span>
                      )}
                      <span
                        className={`${
                          priceNet > priceNetNew + priceTransport
                            ? "text-red-500"
                            : "text-blue-600"
                        }`}
                      >
                        {formatCurrency(priceNetNew + priceTransport)} VND
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isConfirmed && (
        <div className="mt-8 border-t pt-4">
          <div className="flex flex-col items-end space-y-3">
            <div className="flex items-center justify-between w-1/3">
              <label className="font-medium">Tiền vận chuyển (VND):</label>
              <input
                type="text"
                value={formatCurrency(priceNetNew)}
                className="border-2 border-gray-300 rounded-md p-2 w-48 text-right"
                onChange={(e) =>
                  handlePriceChange(e.target.value, setPriceNetNew)
                }
                onBlur={handlePriceConfirm}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePriceConfirm();
                }}
              />
            </div>
            <div className="flex items-center justify-between w-1/3">
              <label className="font-medium">Phụ phí khác (VND):</label>
              <input
                type="text"
                value={formatCurrency(priceTransport)}
                className="border-2 border-gray-300 rounded-md p-2 w-48 text-right"
                onChange={(e) =>
                  handlePriceChange(e.target.value, setPriceTransport)
                }
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
              onClick={() => setIsConfirmed(true)}
            >
              Xác nhận thay đổi
            </button>
          </div>
        </div>
      )}

      {isConfirmed && (
        <div className="mt-8 border-t pt-4 flex flex-col items-end space-y-3">
          <div className="flex items-center justify-between w-1/3 pt-3 border-t">
            <label className="font-medium">Tổng cộng:</label>
            <span className="font-bold text-lg text-blue-600 flex items-center space-x-2">
              {formatCurrency(priceNet + priceTransport)} VND
              <button
                className="ml-2 text-gray-500 hover:text-blue-600"
                onClick={() => setIsConfirmed(false)}
                title="Chỉnh sửa"
              >
                <svg
                  className="w-5 h-5 inline"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6m2-2l6-6"
                  />
                </svg>
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
