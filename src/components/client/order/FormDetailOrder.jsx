import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import { GetShipperServiceCompany } from "../../../service/api.admin.service.jsx";

export default function FormDetailOrder({ addressBackup, recipientInfo, packages, products, productsTotal, selectedService, senderInfo, dataRequest, setDataRequest }) {
    // Thêm state để kiểm soát việc hiển thị form địa chỉ
    const [showAddressForm, setShowAddressForm] = useState(true);

    const [shipper, setShipper] = useState({});

    // Các state hiện có
    const [showProductsForm, setShowProductsForm] = useState(true);
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Tạo invoiceData từ props
    const invoiceData = {
        invoiceNo: "INVOICE",
        date: new Date().toLocaleDateString(),
        airWaybillNo: "",

        // Tính toán weight và dimensions từ packages
        weight: packages.reduce((sum, pkg) => {
            const weight = parseFloat(pkg.weight) || 0.5;
            return sum + weight;
        }, 0).toFixed(1),
        dimensions: packages.map(pkg => {
            const length = pkg.length || 0.5;
            const width = pkg.width || 0.5;
            const height = pkg.height || 0.5;
            return `${length}*${width}*${height}`;
        }),
        insuranceValue: "9.5",

        // Thông tin người gửi (cố định)
        shipper: shipper,

        consignee: {
            name: recipientInfo.fullName,
            company: recipientInfo.company,
            address: `${recipientInfo.street}, ${recipientInfo.city}, ${recipientInfo.state}, ${recipientInfo.country}`,
            phone: recipientInfo.phone,
            email: recipientInfo.email,
            country: recipientInfo.country,
            postCode: recipientInfo.postCode,
            contactName: recipientInfo.fullName
        },



        // Chuyển đổi products thành items
        items: products.map(product => ({
            description: product["Mô tả sản phẩm"] || "",
            origin: product["Xuất xứ"] || "",
            quantity: product["Số lượng"] || 0,
            unit: product["Kiểu đơn vị"] || "",
            unitPrice: product["Giá trên 1 sản phẩm"] || 0,
            subtotal: product["Giá Trị"] || 0
        })),

        totalValue: productsTotal.priceProduct,
        selectedService: selectedService
    };


    const [serviceSelectNew, setServiceSelectNew] = useState(selectedService);


    const [priceNetConfirm, setPriceNetConfirm] = useState(selectedService.priceNet);
    const [priceOtherConfirm, setPriceOtherConfirm] = useState(0);



    useEffect(() => {
        const newList = products.map(product => ({
            id: product.id,
            description: product["Mô tả sản phẩm"],
            origin: product["Xuất xứ"],
            unit: product["Kiểu đơn vị"],
            quantity: product["Số lượng"],
            totalPrice: product.totalPrice,
            price: product.price,
        }));

        const newPackages = packages.map(p => (
            {
                weight: p.weight,
                length: p.length,
                width: p.width,
                height: p.height,
            }
        ))

        const newServiceSelectInfo = {
            ...serviceSelectNew,
            priceNetReal: selectedService.priceNet,
            priceNetFake: priceNetConfirm,
            priceOther: priceOtherConfirm
        }

        const dataRequestAPI = {
            addressBackup: addressBackup,
            consigneeFrom: senderInfo,
            consigneeTo: recipientInfo,
            serviceSelectInfo: newServiceSelectInfo,
            products: newList,
            packages: newPackages,
            productsTotal: productsTotal,
        }
        setDataRequest(dataRequestAPI);
    }, [serviceSelectNew, priceNetConfirm, priceOtherConfirm]);

    const formatCurrency = (amount) => {
        const num = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return '0';
        return new Intl.NumberFormat('vi-VN', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    useEffect(() => {

        const loadData = async () => {

            const dataResponse = await GetShipperServiceCompany(selectedService.carrier, selectedService.service);
            console.log("shipper", dataResponse);

            setShipper(dataResponse);
        }

        loadData();
        invoiceData.shipper = shipper;


        // invoiceData.shipper = dataResponse;
        // console.log("recipientInfo", recipientInfo);
        // console.log("packages", packages);
        // console.log("products", products);
        // console.log("productsTotal", productsTotal);
        // console.log("selectedService", selectedService);
        // console.log("dataRequest", dataRequest);
        // console.log("setDataRequest", setDataRequest);
    }, [])

    const [priceNet, setPriceNet] = useState(selectedService.totalPrice);
    const [priceTransport, setPriceTransport] = useState(0);
    const [originalTotal, setOriginalTotal] = useState(priceNet + priceTransport);
    const [isEdited, setIsEdited] = useState(false);
    const [priceNetNew, setPriceNetNew] = useState(priceNet);

    const handlePriceChange = (value, setter) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        const parsedValue = numericValue ? parseInt(numericValue, 10) : 0;

        setter(parsedValue); // Cập nhật giá trị mới cho priceNetNew hoặc priceTransport

        // Cập nhật serviceSelectNew.priceNet
        if (setter === setPriceNetNew) {
            const newPriceNet = parsedValue / ((1 + serviceSelectNew.constPPXD / 100) * (1 + serviceSelectNew.constVAT / 100)) -
                (serviceSelectNew.overSize ? serviceSelectNew.overSize.price : 0);
            setServiceSelectNew({ ...serviceSelectNew, priceNet: newPriceNet });
        }
    };

    const handlePriceConfirm = () => {
        setOriginalTotal(priceNetNew + priceTransport);
        setIsEdited(true);
    };

    const exportToExcel = async () => {
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

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Invoice');

        worksheet.columns = [
            { width: 2 },    // A
            { width: 15 },   // B
            { width: 15 },   // C
            { width: 30 },   // D
            { width: 15 },   // E
            { width: 15 },   // F
            { width: 15 },   // G
            { width: 15 },   // H
            { width: 15 },   // I
            { width: 15 }
        ];


        const titleRow = worksheet.addRow(['', 'INVOICE', '', '', '', '', '', '', '', '']);
        titleRow.height = 40;
        worksheet.mergeCells('B1:J1');
        const titleCell = worksheet.getCell('B1');
        titleCell.font = { size: 28, bold: true };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };


        const invoice_no = worksheet.addRow(['', '', 'Invoice No.:', invoiceNo, '', '', '', '', '', '']);
        invoice_no.getCell(3).font = { bold: true, italic: true }
        invoice_no.getCell(8).font = { bold: true, italic: true }
        invoice_no.getCell(4).font = { bold: true }
        invoice_no.getCell(9).font = { bold: true }

        const shipperTitle = worksheet.addRow(['', 'SHIPPER', '', '', '', '', '', '', 'Air waybill No.', airWaybillNo]);
        shipperTitle.getCell(2).font = { bold: true, underline: true };
        shipperTitle.getCell(10).font = { bold: true }
        shipperTitle.getCell(9).font = { bold: true }

        const company = worksheet.addRow(['', 'Company Name', shipper.companyName, '', '', '', '', '', '', shippingMethod]);
        company.getCell(3).font = { bold: true }
        company.getCell(10).font = { bold: true }
        const noOfpkgs = worksheet.addRow(['', 'Address', shipper.address, '', '', '', '', '', 'No. of pkgs', '1']);
        noOfpkgs.getCell(9).font = { bold: true }
        noOfpkgs.getCell(10).border = { bottom: { style: 'thin' } }
        const rowWeight = worksheet.addRow(['', 'Town/ Area Code', shipper.areaCode, '', '', '', '', '', 'Weight', weight]);
        rowWeight.getCell(9).font = { bold: true }
        rowWeight.getCell(10).border = { bottom: { style: 'thin' } }
        const rowDimensions = worksheet.addRow(['', 'State/ Country', 'VIETNAM', '', '', '', '', '', 'Dimensions', dimensions[0]]);
        rowDimensions.getCell(3).font = { bold: true }
        rowDimensions.getCell(9).font = { bold: true }
        rowDimensions.getCell(10).border = { bottom: { style: 'thin' } }
        worksheet.addRow(['', 'Tax Code', '0399321378', '', '', '', '', '', '', '']);
        worksheet.addRow(['', 'Contact Name', shipper.contactName, '', '', '', '', '', '', '']);
        worksheet.addRow(['', 'Phone/Fax No.', shipper.phone, '', '', '', '', '', '', '']);
        worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);

        const consigneeTitle = worksheet.addRow(['', 'CONSIGNEE', '', '', '', '', '', '', '', '']);
        consigneeTitle.getCell(2).font = { bold: true, underline: true };

        const company_consignee = worksheet.addRow(['', 'Company Name', consignee.company, '', '', '', '', '', '', '']);
        company_consignee.getCell(3).font = { bold: true }
        worksheet.addRow(['', 'Address', consignee.address, '', '', '', '', '', '']);
        worksheet.addRow(['', 'Postal code', consignee.postCode, '', '', '', '', '', '']);
        const countryConsignee = worksheet.addRow(['', 'State/ Country', consignee.country, '', '', '', '', '', '', '']);
        countryConsignee.getCell(3).font = { bold: true }
        worksheet.addRow(['', 'Contact Name', consignee.name, '', '', '', '', '', '', '']);
        worksheet.addRow(['', 'Phone/Fax No.', consignee.phone, '', '', '', '', '', '', '']);
        worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);


        worksheet.mergeCells('C4:H4');
        worksheet.mergeCells('C5:H5');
        worksheet.mergeCells('C6:H6');
        worksheet.mergeCells('C7:H7');
        worksheet.mergeCells('C8:H8');
        worksheet.mergeCells('C9:H9');
        worksheet.mergeCells('C10:H10');

        worksheet.mergeCells('C13:H13');
        worksheet.mergeCells('C14:H14');
        worksheet.mergeCells('C15:H15');
        worksheet.mergeCells('C16:H16');
        worksheet.mergeCells('C17:H17');
        worksheet.mergeCells('C18:H18');

        const headerRow = worksheet.addRow([
            '',
            'Full Description of Goods\n(Name of goods, composition of material, marks, etc)',
            '',
            '',
            'ORIGINAL',
            'HS CODE',
            'Q\'Ty\n(pcs)',
            '',
            'Unit Price\n(in USD)',
            'Subtotal\n(in USD)'
        ]);
        headerRow.height = 45; // Tăng chiều cao để hiển thị xuống dòng

        // Merge các ô tương ứng
        worksheet.mergeCells('B20:D20'); // merge mô tả hàng hóa
        worksheet.mergeCells('G20:H20');

        headerRow.eachCell((cell, colNumber) => {
            if (colNumber !== 1) {
                cell.font = { bold: true };
                cell.alignment = {
                    horizontal: 'center',
                    vertical: 'middle',
                    wrapText: true  // cho phép xuống dòng trong ô
                };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF0F0F0' }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        });

        items.forEach(item => {
            const row = worksheet.addRow([
                '',
                item.description,
                '',
                '',
                item.origin,
                '',
                item.quantity,
                item.unit,
                item.unitPrice,
                item.subtotal
            ]);
            row.height = 250;

            worksheet.mergeCells(`B${row.number}:D${row.number}`);

            row.eachCell((cell, colNumber) => {
                if (colNumber !== 1) {
                    cell.font = { name: 'Times New Roman', size: 14 };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };

                    if (colNumber === 2) {
                        cell.alignment = { wrapText: true, vertical: 'top' };
                    } else if (colNumber >= 5 && colNumber <= 10) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }
                }
            });
        });


        const totalRow = worksheet.addRow(['', '', '', '', '', '', 'Total Value (in USD)', '', '', totalValue]);

        totalRow.eachCell((cell, colNumber) => {
            if (colNumber === 7 || colNumber === 10) {
                cell.font = { name: 'Times New Roman', size: 14, bold: true };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
        });

        worksheet.mergeCells('G' + totalRow.number + ':I' + totalRow.number);

        // const simple = worksheet.addRow(['', 'SAMPLE', '', '', '', '', '', '', '']);
        // simple.font = { size: 14, bold: true };
        // simple.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.addRow(['', 'Reason for Export', '', '', '', '', '', '', '', '']);
        worksheet.addRow(['', 'I declare that the information is true and correct to the best of my knowledge,', '', '', '', '', '', '', '', '']);
        worksheet.addRow(['', 'and that the goods are of VIETNAM origin.', '', '', '', '', '', '', '', '']);
        worksheet.addRow(['', 'I (name)', '', '', '', '', 'certify that the particulars and', '', '', '']);
        worksheet.addRow(['', 'quantity of goods specified in this document are goods which are submitted for', '', '', '', '', '', '', '', '']);
        worksheet.addRow(['', 'clearance for export out of Vietnam.', '', '', '', '', '', '', '', '']);
        worksheet.addRow(['', '', '', '', '', '', 'Date: 01/04/2024', '', '', '']);
        worksheet.addRow(['', '', '', '', '', '', 'Signature/Title/Stamp', '', '', '']);

        const lastRow = worksheet.lastRow?.number || 0;
        if (lastRow > 0) {
            worksheet.mergeCells('B' + (lastRow - 7) + ':C' + (lastRow - 7));
            worksheet.mergeCells('D' + (lastRow - 7) + ':J' + (lastRow - 7));
            worksheet.mergeCells('B' + (lastRow - 6) + ':J' + (lastRow - 6));
            worksheet.mergeCells('B' + (lastRow - 5) + ':J' + (lastRow - 5));
            worksheet.mergeCells('G' + (lastRow - 4) + ':J' + (lastRow - 4));
            worksheet.mergeCells('C' + (lastRow - 4) + ':F' + (lastRow - 4));
            worksheet.mergeCells('B' + (lastRow - 3) + ':J' + (lastRow - 3));
            worksheet.mergeCells('B' + (lastRow - 2) + ':J' + (lastRow - 2));
            worksheet.mergeCells('G' + (lastRow - 1) + ':J' + (lastRow - 1));
            worksheet.mergeCells('G' + lastRow + ':J' + lastRow);
        }

        worksheet.getCell('G' + (lastRow - 1)).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('G' + lastRow).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('D' + (lastRow - 7)).border = { bottom: { style: 'thin' } }
        worksheet.getCell('C' + (lastRow - 4)).border = { bottom: { style: 'thin' } }
        // worksheet.eachRow((row) => {
        //     row.eachCell((cell) => {
        //         cell.font = {
        //             name: 'Century Gothic',
        //         };
        //     });
        // });

        for (let rowNum = lastRow; rowNum >= lastRow - 7; rowNum--) {
            const row = worksheet.getRow(rowNum);
            row.eachCell((cell) => {
                cell.font = {
                    name: 'Century Gothic',
                };
            });
        }

        const sRow = 4, eRow = 18;
        const col = 3;

        for (let row = sRow; row <= eRow; row++) {
            if (row !== 11 && row !== 12) {
                worksheet.getCell(row, col).border = {
                    bottom: { style: 'thin' }
                };
            }
        }


        const startRow = rowDimensions.number;
        const colIndex = 10;

        dimensions.forEach((d, index) => {
            if (index !== 0) {
                worksheet.getCell(startRow + index, colIndex).value = d;
                worksheet.getCell(startRow + index, colIndex).border = { bottom: { style: 'thin' } }
            }
        })

        //Shipping Mark
        dimensions.forEach((dim, index) => {
            const sheetName = `ShippingMark ${index + 1}`;
            const sheet = workbook.addWorksheet(sheetName);
            const totalDimensions = dimensions.length;

            sheet.pageSetup = {
                paperSize: 9,
                orientation: 'landscape',
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
                margins: {
                    left: 0.5, right: 0.5,
                    top: 0.75, bottom: 0.75,
                    header: 0.3, footer: 0.3
                }
            };

            sheet.columns = [
                { width: 20 },
                { width: 50 }
            ];

            const rows = [
                ['', 'SHIP TO', '', '', '', '', '', '', '', '', ''],
                ['SHIP TO', consignee.company, '', '', '', '', '', '', '', '', ''],
                ['ADD', consignee.address, '', '', '', '', '', '', '', '', ''],
                ['ATTN', consignee.company, '', '', '', '', '', '', '', '', ''],
                ['CARTON', `${index + 1}/${totalDimensions}`, '', '', '', '', '', '', '', '', ''],
                ['', shippingMethod, '', '', '', '', '', '', '', '', ''],
                ['', '7777', '', '', '', '', '', '', '', '', '']
            ];

            rows.forEach((data, rowIndex) => {
                const row = sheet.addRow(data);
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                });
            });

            sheet.getColumn('A').font = { name: 'Times New Roman', size: 20 };
            sheet.getColumn('B').font = { name: 'Times New Roman', size: 30, bold: true };
            sheet.getCell('B1').font = { name: 'Times New Roman', size: 20 }
            sheet.getColumn('B').width = 40;
            sheet.mergeCells('B1:K1');
            sheet.mergeCells('B2:K2');
            sheet.mergeCells('B3:K3');
            sheet.mergeCells('B4:K4');
            sheet.mergeCells('B5:K5');
            sheet.mergeCells('B6:K6');
            sheet.mergeCells('B7:K7');
        });



        // Save file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${invoiceNo}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md">
            {/* Header */}
            <div className="text-center mb-6 flex flex-col items-center gap-2">
                <h1 className="text-2xl font-bold uppercase">{invoiceData.invoiceNo}</h1>
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
                    <p className="font-semibold mb-2">SHIPPER</p>
                    <table className="w-full text-left border-collapse">
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-1 pr-1 text-gray-600 w-28 text-sm">Company Name:</td>
                                <td className="py-1 italic text-xs">{invoiceData.shipper.companyName}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-1 pr-1 text-gray-600 text-sm">Address:</td>
                                <td className="py-1 italic text-xs">{invoiceData.shipper.address}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-1 pr-1 text-gray-600 text-sm">Area Code:</td>
                                <td className="py-1 italic text-xs">{invoiceData.shipper.areaCode}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-1 pr-1 text-gray-600 text-sm">State/Country:</td>
                                <td className="py-1 italic text-xs">{invoiceData.shipper.country}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-1 pr-1 text-gray-600 text-sm">Tax code:</td>
                                <td className="py-1 italic text-xs">{invoiceData.shipper.tax}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-1 pr-1 text-gray-600 text-sm">Contact Name:</td>
                                <td className="py-1 italic text-xs">{invoiceData.shipper.contactName}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-1 pr-1 text-gray-600 text-sm">Phone:</td>
                                <td className="py-1 italic text-xs">{invoiceData.shipper.phone}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="w-1/2 text-right">
                    <p>Invoice No.: {invoiceData.invoiceNo}</p>
                    <p>Date: {invoiceData.date}</p>
                    <p className="mt-4 font-semibold">Air waybill No.: {invoiceData.airWaybillNo}</p>
                    <p>Shipping Method: {selectedService.carrier}</p>
                    <p>Weight: {invoiceData.weight} kg</p>
                    <p>Dimensions:  </p>
                    {
                        invoiceData.dimensions.map(d => (
                            <p key={d}>{d} cm</p>
                        ))
                    }
                </div>
            </div>

            {/* Consignee */}
            <div className="mb-8">
                <p className="font-semibold mb-2">CONSIGNEE</p>
                <table className="w-full text-left border-collapse">
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="py-1 pr-1 text-gray-600 w-28 text-sm">Company Name:</td>
                            <td className="py-1 italic text-xs">{invoiceData.consignee.company}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-1 pr-1 text-gray-600 text-sm">Address:</td>
                            <td className="py-1 italic text-xs">{invoiceData.consignee.address}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-1 pr-1 text-gray-600 text-sm">Postal code:</td>
                            <td className="py-1 italic text-xs">{invoiceData.consignee.postCode}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-1 pr-1 text-gray-600 text-sm">State/Country:</td>
                            <td className="py-1 italic text-xs">{invoiceData.consignee.country}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-1 pr-1 text-gray-600 text-sm">Contact Name:</td>
                            <td className="py-1 italic text-xs">{invoiceData.consignee.contactName}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-1 pr-1 text-gray-600 text-sm">Phone/Fax No.:</td>
                            <td className="py-1 italic text-xs">{invoiceData.consignee.phone}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Products Form Toggle Button */}
            <div className="mb-4">
                <button
                    onClick={() => setShowProductsForm(!showProductsForm)}
                    className="flex items-center text-purple-600 hover:text-purple-700 font-medium"
                >
                    <span className="mr-2">
                        {showProductsForm ? 'Ẩn' : 'Hiện'} danh sách sản phẩm
                    </span>
                    <svg
                        className={`w-5 h-5 transform transition-transform duration-200 ${showProductsForm ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="roshippingMethodund" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Items Table */}
            {showProductsForm && (
                <div className="mb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">Full Description of Goods</th>
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
                                        {item.description.split('\n').map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                    </td>
                                    <td className="border p-2 text-center">{item.origin}</td>
                                    <td className="border p-2 text-center">{item.quantity}</td>
                                    <td className="border p-2 text-center">{item.unit}</td>
                                    <td className="border p-2 text-center">{item.unitPrice}</td>
                                    {/*// toFixed(2)*/}
                                    <td className="border p-2 text-center">{item.subtotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mt-4">
                        <div className="w-1/4">
                            <p className="font-semibold">Total Value (in USD): {invoiceData.totalValue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

            )}
            {
                addressBackup.name !== "" && (
                    <div className="mt-8 bg-gradient-to-r from-purple-50 to-white rounded-lg shadow-sm border border-purple-100">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-100 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Địa chỉ nhận hàng Backup</h3>
                                </div>
                                <button
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="text-purple-600 hover:text-purple-700"
                                >
                                    <svg
                                        className={`w-5 h-5 transform transition-transform duration-200 ${showAddressForm ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            {showAddressForm && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <p className="text-xs text-purple-500 font-medium">Người nhận</p>
                                        <p className="font-medium">{addressBackup.name}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <p className="text-xs text-purple-500 font-medium">Số điện thoại</p>
                                        <p className="font-medium">{addressBackup.phone}</p>
                                    </div>
                                    <div className="col-span-2 bg-white p-3 rounded-md shadow-sm">
                                        <p className="text-xs text-purple-500 font-medium">Địa chỉ</p>
                                        <p className="font-medium">{addressBackup.address}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <p className="text-xs text-purple-500 font-medium">Thời gian</p>
                                        <p className="font-medium">{addressBackup.time}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                        <p className="text-xs text-purple-500 font-medium">Ngày</p>
                                        <p className="font-medium">{addressBackup.date}</p>
                                    </div>
                                    {addressBackup.notes && (
                                        <div className="col-span-2 bg-white p-3 rounded-md shadow-sm">
                                            <p className="text-xs text-purple-500 font-medium">Ghi chú</p>
                                            <p className="font-medium">{addressBackup.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Thêm phần hiển thị thông tin dịch vụ */}
            {selectedService && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin dịch vụ vận chuyển</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Hãng vận chuyển</p>
                            <p className="font-medium">{selectedService.carrier}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Nước đến</p>
                            <p className="font-medium">{invoiceData.consignee.country}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Dịch vụ</p>
                            <p className="font-medium">{selectedService.service}</p>
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
                                        <p className="font-medium">{formatCurrency(serviceSelectNew.priceNet)} VND</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Phí xăng dầu</p>
                                        <p className="font-medium">{formatCurrency(serviceSelectNew.priceNet * selectedService.constPPXD / 100 + (serviceSelectNew.overSize ? serviceSelectNew.overSize.price * selectedService.constPPXD / 100 : 0))} VND</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Phí quá khổ</p>
                                        <p className="font-medium">{formatCurrency(selectedService.overSize ? selectedService.overSize.price : 0)} VND</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">VAT ({selectedService.constVAT}%)</p>
                                        <p className="font-medium">{formatCurrency((serviceSelectNew.priceNet + (selectedService.overSize ? selectedService.overSize.price : 0)) * (1 + selectedService.constPPXD / 100) * selectedService.constVAT / 100)} VND</p>
                                    </div>
                                    {priceTransport !== 0 && (
                                        <div>
                                            <p className="text-xs text-gray-500">Phụ phí khác</p>
                                            <p className="font-medium">{formatCurrency(priceTransport)} VND</p>
                                        </div>
                                    )}
                                    <div className="col-span-2 border-t pt-2 mt-2">
                                        <p className="text-sm font-semibold text-gray-700">Tổng cộng</p>
                                        <p className="text-lg font-bold text-blue-600 flex items-center space-x-2">
                                            <span className={`${priceNet > priceNetNew ? "text-red-500" : "text-blue-600"}`}>
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
                            <label className="font-medium">Tổng cũ:</label>
                            <input
                                type="text"
                                value={formatCurrency((selectedService.priceNet + (selectedService.overSize ? selectedService.overSize.price : 0)) * (1 + selectedService.constPPXD / 100) * (1 + selectedService.constVAT / 100) + priceTransport)}
                                className="border-2 border-gray-300 rounded-md p-2 w-48 text-right bg-gray-100"
                                readOnly
                            />
                        </div>



                        <div className="flex items-center justify-between w-1/3">
                            <label className="font-medium">Tiền vận chuyển (VND):</label>
                            <input
                                type="text"
                                value={formatCurrency(priceNetNew)}
                                className="border-2 border-gray-300 rounded-md p-2 w-48 text-right"
                                onChange={(e) => handlePriceChange(e.target.value, setPriceNetNew)}
                                onBlur={handlePriceConfirm}
                                onKeyDown={e => { if (e.key === 'Enter') handlePriceConfirm(); }}
                            />
                        </div>
                        <div className="flex items-center justify-between w-1/3">
                            <label className="font-medium">Phụ phí khác (VND):</label>
                            <input
                                type="text"
                                value={formatCurrency(priceTransport)}
                                className="border-2 border-gray-300 rounded-md p-2 w-48 text-right"
                                onChange={(e) => handlePriceChange(e.target.value, setPriceTransport)}
                            />
                        </div>


                    </div>
                    <div className="mt-6">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                            onClick={() => {
                                setPriceNetConfirm(serviceSelectNew.priceNet);
                                setPriceOtherConfirm(priceTransport);
                                setIsConfirmed(true);
                            }}
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
                                <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6m2-2l6-6" />
                                </svg>
                            </button>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
