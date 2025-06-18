import { useEffect, useState } from "react";
import ExcelJS from 'exceljs';
import { GetShipperServiceCompany } from "../../../../service/api.admin.service.jsx"


interface RecipientInfo {
  name: string;
  company: string;
  street: string;
  city: string;
  state: string;
  postCode: string;
  phone: string;
  email: string;
  country: string;
  fullName: string;
}

interface Package {
  weight: string;
  length: number;
  width: number;
  height: number;
}

interface Product {
  id: string;
  description: string;
  origin: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  price: number;
  [key: string]: any; // Allow dynamic keys
}

interface SelectedService {
  priceNet: number;
  totalPrice: number;
  carrier: string;
  trackingNumber?: string;
  constPPXD: number;
  constVAT: number;
  overSize?: { price: number };
  zone: string;
  service: string;
  awb: string;
  priceOther: number;
}

interface InvoiceMainProps {
  recipientInfo: RecipientInfo;
  packages: Package[];
  products: Product[];
  productsTotal: { priceProduct: number };
  selectedService: SelectedService;
}



export default function InvoiceMain({ bill_id, recipientInfo, packages, products, productsTotal, selectedService }: InvoiceMainProps) {
  const [showProductsForm, setShowProductsForm] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [dataShipper, setDataShipper] = useState({


  });



  useEffect(() => {
    const loadData = async () => {
      const dataResponse = await GetShipperServiceCompany(selectedService.carrier, selectedService.service);
      console.log("shipper", dataResponse);

      setDataShipper(dataResponse);
    }

    loadData();
    if (Object.keys(dataShipper).length > 0) {
      invoiceData.shipper = dataShipper;
    }
  }, []);

  // Tạo invoiceData từ props
  const invoiceData = {
    invoiceNo: "INVOICE",
    date: new Date().toLocaleDateString(),
    airWaybillNo: selectedService.awb,

    // Tính toán weight và dimensions từ packages
    weight: packages.reduce((sum, pkg) => {
      const weight = parseFloat(pkg.weight) || 0;
      return sum + weight;
    }, 0).toFixed(1),
    dimensions: packages.map(pkg => {
      const length = pkg.length || 0;
      const width = pkg.width || 0;
      const height = pkg.height || 0;
      return `${length}*${width}*${height}`;
    }),
    insuranceValue: "9.5",

    // Thông tin người gửi (cố định)



    shipper: dataShipper,

    consignee: {
      name: recipientInfo.name,
      company: recipientInfo.company,
      address: `${recipientInfo.street}, ${recipientInfo.city}, ${recipientInfo.state}, ${recipientInfo.country}`,
      phone: recipientInfo.phone,
      email: recipientInfo.email,
      country: recipientInfo.country,
      postCode: recipientInfo.postCode,
      contactName: recipientInfo.name
    },

    // Chuyển đổi products thành items
    items: products.map(product => ({
      description: product.description || "",
      origin: product.origin || "",
      quantity: product.quantity || 0,
      unit: product.unit || "",
      unitPrice: product.unitPrice || 0,
      subtotal: product.quantity * product.unitPrice
    })),

    totalValue: productsTotal.priceProduct,
    selectedService: selectedService
  };


  const [serviceSelectNew, setServiceSelectNew] = useState(selectedService);


  const [priceNetConfirm, setPriceNetConfirm] = useState(selectedService.priceNet);
  const [priceOtherConfirm, setPriceOtherConfirm] = useState(0);



  // useEffect(() => {
  //   const newList = products.map(product => ({
  //     id: product.id,
  //     description: product["Mô tả sản phẩm"],
  //     origin: product["Xuất xứ"],
  //     unit: product["Kiểu đơn vị"],
  //     quantity: product["Số lượng"],
  //     totalPrice: product.totalPrice,
  //     price: product["Giá trên 1 sản phẩm"],
  //   }));

  //   const newPackages = packages.map(p => (
  //     {
  //       weight: p.weight,
  //       length: p.length,
  //       width: p.width,
  //       height: p.height,
  //     }
  //   ))

  //   const newServiceSelectInfo = {
  //     ...serviceSelectNew,
  //     priceNetReal: selectedService.priceNet,
  //     priceNetFake: priceNetConfirm,
  //     priceOther: priceOtherConfirm
  //   }




  //   const dataRequestAPI = {
  //     recipientInfo: recipientInfo,
  //     serviceSelectInfo: newServiceSelectInfo,
  //     products: newList,
  //     packages: newPackages,
  //     productsTotal: productsTotal,
  //   }
  //   // setDataRequest(dataRequestAPI);
  // }, [serviceSelectNew, priceNetConfirm, priceOtherConfirm]);



  const formatCurrency = (amount: any) => {
    const num = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  useEffect(() => {
    console.log("recipientInfo", recipientInfo);
    console.log("packages", packages);
    console.log("products", products);
    console.log("productsTotal", productsTotal);
    console.log("selectedService", selectedService);
  }, [])

  const [priceNet, setPriceNet] = useState(selectedService.totalPrice);
  const [priceTransport, setPriceTransport] = useState(selectedService.priceOther);
  const [originalTotal, setOriginalTotal] = useState(priceNet + priceTransport);
  const [isEdited, setIsEdited] = useState(false);
  const [priceNetNew, setPriceNetNew] = useState(priceNet - priceTransport);

  const handlePriceChange = (value: any, setter: any) => {
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

  const handleUpdatePriceOrder = async () => {
    try {
      const dataRequest = {
        id: bill_id,
        priceNet: priceNetConfirm,
        priceOther: priceTransport
      };

      console.log(dataRequest);

      // const dataResponse = await PutPriceOrder(dataRequest);
      // console.log("Price order updated:", dataResponse);
    } catch (error) {
      console.error("Error updating price order:", error);
    }
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
      { width: 20 },   // B
      { width: 15 },   // C
      { width: 30 },   // D
      { width: 15 },   // E
      { width: 15 },   // F
      { width: 15 },   // G
      { width: 15 },   // H
      { width: 15 },   // I
      { width: 15 },
      { width: 15 }
    ];

    // Set default font size for cells with values
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (cell.value && !cell.font) {
          cell.font = { size: 12 };
        }
      });
    });

    const titleRow = worksheet.addRow(['', 'INVOICE', '', '', '', '', '', '', '', '', '']);
    titleRow.height = 40;
    worksheet.mergeCells('B1:K1');
    const titleCell = worksheet.getCell('B1');
    titleCell.font = { size: 28, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };


    const invoice_no = worksheet.addRow(['', '', 'Invoice No.:', invoiceNo, '', '', '', '', '', '']);
    invoice_no.getCell(3).font = { bold: true, italic: true, size: 12 }
    invoice_no.getCell(8).font = { bold: true, italic: true, size: 12 }
    invoice_no.getCell(4).font = { bold: true, size: 12 }
    invoice_no.getCell(9).font = { bold: true, size: 12 }

    const shipperTitle = worksheet.addRow(['', 'SHIPPER', '', '', '', '', '', '', 'Air waybill No.', invoiceData.airWaybillNo, '']);
    shipperTitle.getCell(2).font = { bold: true, underline: true, size: 12 };
    shipperTitle.getCell(10).font = { bold: true, size: 12 }
    shipperTitle.getCell(9).font = { bold: true, size: 12 }

    const company = worksheet.addRow(['', 'Company Name', shipper.companyName, '', '', '', '', '', '', shippingMethod, '']);
    company.getCell(3).font = { bold: true, size: 12 }
    company.getCell(2).font = { size: 12 }
    company.getCell(10).font = { bold: true, size: 12 }
    const noOfpkgs = worksheet.addRow(['', 'Address', shipper.address, '', '', '', '', '', 'No. of pkgs', '1', '']);
    noOfpkgs.getCell(9).font = { bold: true, size: 12 }
    noOfpkgs.getCell(2).font = { size: 12 }
    noOfpkgs.getCell(3).font = { size: 12 }
    noOfpkgs.getCell(10).border = { bottom: { style: 'thin' } }
    noOfpkgs.getCell(10).font = { size: 12 }
    const rowWeight = worksheet.addRow(['', 'Town/ Area Code', shipper.areaCode, '', '', '', '', '', 'Weight', weight, '']);
    rowWeight.getCell(9).font = { bold: true, size: 12 }
    rowWeight.getCell(2).font = { size: 12 }
    rowWeight.getCell(3).font = { size: 12 }
    rowWeight.getCell(10).border = { bottom: { style: 'thin' } }
    rowWeight.getCell(10).font = { size: 12 }
    const rowDimensions = worksheet.addRow(['', 'State/ Country', 'VIETNAM', '', '', '', '', '', 'Dimensions', dimensions[0], '']);
    rowDimensions.getCell(3).font = { bold: true, size: 12 }
    rowDimensions.getCell(2).font = { size: 12 }
    rowDimensions.getCell(9).font = { bold: true, size: 12 }
    rowDimensions.getCell(10).border = { bottom: { style: 'thin' } }
    rowDimensions.getCell(10).font = { size: 12 }
    const tax = worksheet.addRow(['', 'Tax Code', '0399321278', '', '', '', '', '', '', '']);
    tax.getCell(2).font = { size: 12 }
    tax.getCell(3).font = { size: 12 }
    const contact = worksheet.addRow(['', 'Contact Name', shipper.contactName, '', '', '', '', '', '', '']);
    contact.getCell(3).font = { size: 12 }
    contact.getCell(2).font = { size: 12 }
    const fax = worksheet.addRow(['', 'Phone/Fax No.', shipper.phone, '', '', '', '', '', '', '']);
    fax.getCell(3).font = { size: 12 }
    fax.getCell(2).font = { size: 12 }
    worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);

    worksheet.mergeCells('J3:K3');
    worksheet.mergeCells('J4:K4');
    worksheet.mergeCells('J5:K5');
    worksheet.mergeCells('J6:K6');
    worksheet.mergeCells('J7:K7');

    const consigneeTitle = worksheet.addRow(['', 'CONSIGNEE', '', '', '', '', '', '', '', '']);
    consigneeTitle.getCell(2).font = { bold: true, underline: true, size: 12 };

    const company_consignee = worksheet.addRow(['', 'Company Name', consignee.company, '', '', '', '', '', '', '']);
    company_consignee.getCell(2).font = { size: 12 }
    company_consignee.getCell(3).font = { bold: true, size: 12 }
    const add = worksheet.addRow(['', 'Address', consignee.address, '', '', '', '', '', '']);
    add.getCell(2).font = { size: 12 }
    add.getCell(3).font = { size: 12 }
    const postal = worksheet.addRow(['', 'Postal code', consignee.postCode, '', '', '', '', '', '']);
    postal.getCell(2).font = { size: 12 }
    postal.getCell(3).font = { size: 12 }
    const countryConsignee = worksheet.addRow(['', 'State/ Country', consignee.country, '', '', '', '', '', '', '']);
    countryConsignee.getCell(2).font = { size: 12 }
    countryConsignee.getCell(3).font = { bold: true, size: 12 }
    const cont = worksheet.addRow(['', 'Contact Name', consignee.name, '', '', '', '', '', '', '']);
    cont.getCell(2).font = { size: 12 }
    cont.getCell(3).font = { size: 12 }
    const phone = worksheet.addRow(['', 'Phone/Fax No.', consignee.phone, '', '', '', '', '', '', '']);
    phone.getCell(2).font = { size: 12 }
    phone.getCell(3).font = { size: 12 }
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
      'Subtotal\n(in USD)',
      'Uses\n(If any)'
    ]);
    headerRow.height = 45; // Tăng chiều cao để hiển thị xuống dòng

    // Merge các ô tương ứng
    worksheet.mergeCells('B20:D20'); // merge mô tả hàng hóa
    worksheet.mergeCells('G20:H20');

    headerRow.eachCell((cell, colNumber) => {
      if (colNumber !== 1) {
        cell.font = { bold: true, size: 12 };
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
        item.subtotal,
        ''
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
      worksheet.mergeCells('D' + (lastRow - 7) + ':K' + (lastRow - 7));
      worksheet.mergeCells('B' + (lastRow - 6) + ':K' + (lastRow - 6));
      worksheet.mergeCells('B' + (lastRow - 5) + ':K' + (lastRow - 5));
      worksheet.mergeCells('G' + (lastRow - 4) + ':K' + (lastRow - 4));
      worksheet.mergeCells('C' + (lastRow - 4) + ':F' + (lastRow - 4));
      worksheet.mergeCells('B' + (lastRow - 3) + ':K' + (lastRow - 3));
      worksheet.mergeCells('B' + (lastRow - 2) + ':K' + (lastRow - 2));
      worksheet.mergeCells('G' + (lastRow - 1) + ':K' + (lastRow - 1));
      worksheet.mergeCells('G' + lastRow + ':K' + lastRow);
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
          size: 12
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
        const row = startRow + index;
        const col = colIndex;

        worksheet.getCell(row, col).value = d;
        worksheet.getCell(row, col).border = { bottom: { style: 'thin' } };
        worksheet.getCell(row, col).font = { size: 12 };
        worksheet.mergeCells(row, col, row, col + 1);
      }
    });


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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                    {item.description.split('\n').map((line: any, i: any) => (
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
              <p className="text-sm text-gray-600">Country</p>
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


    </div>
  );
}
