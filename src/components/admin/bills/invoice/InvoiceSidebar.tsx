  import axios from "axios";
  import { useEffect, useState } from "react";
  import ExcelJS from 'exceljs';
  import { GetShipperServiceCompany } from "../../../../service/api.admin.service.jsx"
import { m } from "framer-motion/dist/types.d-DSjX-LJB.js";

  type UploadedFile = {
    name: string;
    url: string;
    created_at: string;
    bill_id: string; // Optional property for file identification
    id: string; // Optional property for file identification
  };

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

  export default function InvoiceSidebar({ bill_id, recipientInfo, packages, products, productsTotal, selectedService }: InvoiceMainProps) {
    if (!bill_id) {
      console.warn("bill_id is not provided");
    }

    const [dataShipper, setDataShipper] = useState({});

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
      airWaybillNo: selectedService?.awb,


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


    useEffect(() => {
      console.log("recipientInfo", recipientInfo);
      console.log("packages", packages);
      console.log("products", products);
      console.log("productsTotal", productsTotal);
      console.log("selectedService", selectedService);
    }, [])

    ///====
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

    useEffect(() => {
      const fetchUploadedFiles = async () => {
        try {
          const dataRequest = {
            bill_id,
            type: "excel",
          };
          const response = await axios.post("http://localhost:8080/api/files/get", dataRequest);
          setUploadedFiles(response.data.data);
          console.log("Fetched uploaded files:", response.data.data);
        } catch (error) {
          console.error("Error fetching uploaded files:", error);
        }
      };
      fetchUploadedFiles();
    }, [bill_id]);

    const handleUpload = async () => {
      if (!file) {
        alert("Vui lòng chọn file trước khi upload!");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ebay_express");

      try {
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/ds1zbrgib/raw/upload",
          formData
        );

        const fileUrl = res.data.secure_url;
        const publicId = res.data.public_id;

        const dataRequest = {
          bill_id,
          url: fileUrl,
          public_id: publicId,
          type: "excel",
          name: "invoice " + bill_id.substring(0, 5),
        };

        const newFile = await axios.post("http://localhost:8080/api/files", dataRequest);


        setUploadedFiles((prev) => [
          ...prev,
          {
            name: newFile.data.name,
            url: newFile.data.url,
            created_at: newFile.data.created_at,
            bill_id: newFile.data.bill_id,
            id: newFile.data.id
          },
        ]);

        setFile(null);
        setFileName(null);

        alert("Upload thành công!");
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Upload thất bại!");
      }
    };

    const handleRemoveFile = async (file: UploadedFile) => {
      // Hiển thị hộp thoại xác nhận
      const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa file "${file.name}" không?`);

      if (!isConfirmed) {
        // Nếu người dùng không xác nhận, hủy hành động xóa
        return;
      }

      try {
        // Gửi yêu cầu xóa file lên server
        const response = await axios.delete(`http://localhost:8080/api/files/${file.id}`);
        console.log("Response from delete API:", response.data);

        if (response.status === 200) {
          // Xóa file khỏi danh sách hiển thị
          setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id));
          alert("Xóa file thành công!");
        } else {
          console.error("Error deleting file:", response.data);
          alert("Xóa file thất bại!");
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        alert("Xóa file thất bại!");
      }
    };

    const handleOpenFile = (fileUrl: string) => {
      window.open(fileUrl, "_blank");
    };

    const exportENExcel = async () => {
      const shipper = invoiceData.shipper;
      const consignee = invoiceData.consignee;
      const items = invoiceData.items;
      const invoiceNo = invoiceData.invoiceNo;
      const date = invoiceData.date;
      const airWaybillNo = invoiceData?.airWaybillNo || "";
      const shippingMethod = selectedService?.carrier || "";
      const weight = invoiceData.weight + " KGS";
      const dimensions = invoiceData.dimensions;
      const totalValue = invoiceData.totalValue;
      const totalDimensions = dimensions.length;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Export Notice');

      worksheet.columns = [
          { width: 2 },    // A
          { width: 5 },   // B
          { width: 8 },   // C
          { width: 22 },   // D
          { width: 15 },   // E
          { width: 15 },   // F
          { width: 15 },   // G
          { width: 15 },   // H
          { width: 20 },   // I
          { width: 15 },   // J
      ];

      // Set default font size for cells with values
      worksheet.eachRow((row) => {
          row.eachCell((cell) => {
              if (cell.value && !cell.font) {
                  cell.font = { size: 12 };
              }
          });
      });

      worksheet.addRow(['', 'UPS VietNam', '', '', '', '', '', '', '', '']);
      worksheet.addRow(['', '18A Cong Hoa, Ward 12, Tan Binh Dist', '', '', '', '', '', '', '', '']);
      worksheet.addRow(['', 'Ho Chi Minh, VietNam', '', '', '', '', '', '', '', '']);
      worksheet.addRow(['', 'Tel: 028 3848 8888', '', '', '', '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);

      worksheet.mergeCells('B1:D1');
      worksheet.mergeCells('B2:D2');
      worksheet.mergeCells('B3:D3');
      worksheet.mergeCells('B4:D4');
      worksheet.mergeCells('B5:D5');

      const titleRow = worksheet.addRow(['', 'THÔNG TIN XUẤT KHẨU - EXPORT NOTICE', '', '', '', '', '', '', '', '', '']);
      titleRow.height = 40;
      worksheet.mergeCells('B6:J6');
      const titleCell = worksheet.getCell('B6');
      titleCell.font = { size: 22, bold: true };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      const actual_package = worksheet.addRow(['', `Tổng số kiện: ${totalDimensions} (Actual weight: ${weight})`, '', '', '', '', '', '', '', '']);
      actual_package.height = 30;
      worksheet.mergeCells('B7:J7');
      const packageCell = worksheet.getCell('B7');
      packageCell.font = { size: 14, bold: true };
      packageCell.alignment = { horizontal: 'center', vertical: 'middle' };

      const awb = worksheet.addRow(['', 'AWB','', airWaybillNo, '', '', '', '', '', '', '']);
      awb.height = 25;
      awb.getCell(2).font = { size: 12, bold: true };
      awb.getCell(4).font = { size: 12};
      worksheet.mergeCells('B8:C8');
      worksheet.mergeCells('D8:J8');

      const nguoiGui = worksheet.addRow(['', 'Người gửi:','', shipper.companyName, '', '', '', '', '', '', '']);
      nguoiGui.height = 25;
      nguoiGui.getCell(2).font = { size: 12, bold: true };
      nguoiGui.getCell(4).font = { size: 12};
      nguoiGui.getCell(4).value = shipper.companyName.toUpperCase();
      worksheet.mergeCells('D9:J9');
      worksheet.mergeCells('B9:C9');

      const diaChi = worksheet.addRow(['', 'Địa chỉ:','', shipper.address, '', '', '', '', '', '', '']);
      diaChi.height = 25;
      diaChi.getCell(2).font = { size: 12, bold: true };
      diaChi.getCell(4).font = { size: 12 };
      diaChi.getCell(4).value = shipper.address.toUpperCase();
      worksheet.mergeCells('D10:J10');
      worksheet.mergeCells('B10:C10');

      worksheet.addRow(['','','', '.....................................................................................', '', '', '', '', '', '', '']);
      worksheet.mergeCells('D11:J11');
      worksheet.addRow(['','','', '.....................................................................................', '', '', '', '', '', '', '']);
      worksheet.mergeCells('D12:J12');

      const tell = worksheet.addRow(['', 'Tel:','', shipper.phone, '', '', 'Fax:', '', '', '']);
      tell.height = 25;
      tell.getCell(2).font = { size: 12, bold: true };
      tell.getCell(7).font = { size: 12, bold: true };
      tell.getCell(4).font = { size: 12 };

      const duKien = worksheet.addRow(['', 'Dự kiến sẽ xuất qua UPS vào ngày 22/05/2025', '', '', '', '', '', '', '', '']);
      duKien.height = 25;
    
      worksheet.mergeCells('B14:J14');

      worksheet.addRow([''])

      const x = worksheet.addRow(['', 'X', '', '', '', '', '', '', '', '']);
      x.height = 25;
      x.getCell(2).font = { size: 12, bold: true };
      x.getCell(2).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      x.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

      const txt1 = worksheet.addRow(['', 'Quý khách vui lòng cung cấp những thông tin sau:', '', '', '', '', '', '', '', '']);
      txt1.height = 25;
      txt1.getCell(2).font = { size: 12, bold: true };
      worksheet.mergeCells('B17:J17');

      const ma_so_thue = worksheet.addRow(['', '* Mã số thuế (công ty hoặc cá nhân):', '','', '2300680991', '', '', '', '', '', '']);
      ma_so_thue.height = 25;
      ma_so_thue.getCell(2).font = { size: 12 };
      ma_so_thue.getCell(5).font = { size: 12 };
      worksheet.mergeCells('B18:D18');

      const so_dien_thoai = worksheet.addRow(['', '* Số điện thoại di động:', '', '', '028 3848 8888', '', '', '', '', '', '']);
      so_dien_thoai.height = 25;
      so_dien_thoai.getCell(2).font = { size: 12 };
      so_dien_thoai.getCell(5).font = { size: 12 };
      worksheet.mergeCells('B19:D19');

      if (items.length <= 5) {
        const txt2 = worksheet.addRow(['', '* Quí khách vui lòng khai tên hàng bằng tiếng Việt theo thứ tự trong invoice ( mã HS, trị giá …..  nếu có )', '', '', '', '', '', '', '', '']);
        txt2.height = 35;
        txt2.getCell(2).font = { size: 12, bold: true, color: { argb: 'FF0070C0' } };
        worksheet.mergeCells('B20:J20');

        worksheet.addRow(['', '']);

        const headerRow = worksheet.addRow([
          '',
          'STT',
          'Tên hàng (mô tả chi tiết)',
          '',
          '',
          'Mã HS',
          'Xuất xứ',
          'Số Lượng',
          'Đơn giá hóa đơn\n(USD)',
          'Trị giá hóa đơn\n(USD)',
        ]);

        headerRow.height = 45;

        const rowIndex = headerRow.number; // <-- lấy dòng số hiện tại
        worksheet.mergeCells(`C${rowIndex}:E${rowIndex}`);

        headerRow.eachCell((cell, colNumber) => {
          if (colNumber !== 1) {
            cell.font = { bold: true, size: 12 };
            cell.alignment = {
              horizontal: 'center',
              vertical: 'middle',
              wrapText: true
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
                items.indexOf(item) + 1,
                item.description,
                '',
                '',
                '',
                item.origin,
                item.quantity,
                item.unitPrice,
                item.subtotal,
            ]);
            row.height = 250;

            worksheet.mergeCells(`C${row.number}:E${row.number}`);

            row.eachCell((cell, colNumber) => {
                if (colNumber !== 1) {
                    cell.font = { name: 'Times New Roman', size: 14 };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };

                    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

                    // if (colNumber === 3) {
                    //     cell.alignment = { wrapText: true, vertical: 'top' };
                    // } else if (colNumber >= 5 && colNumber <= 10) {
                    //     cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    // }
                }
            });
        });

        const totalRow = worksheet.addRow(['', 'Total Value (in USD)', '', '', '', '', '', '', '', totalValue]);
        totalRow.height = 25;
        totalRow.eachCell((cell, colNumber) => {
            if (colNumber === 2 || colNumber === 10) {
                cell.font = { name: 'Times New Roman', size: 12 };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                if (colNumber === 2) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                } else{
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
            }
        });

        worksheet.mergeCells('B' + totalRow.number + ':I' + totalRow.number);

      }

      

      worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);

      const txt3 = worksheet.addRow(['', '* Nếu trên 5 dòng hàng vui lòng điền vào sheet " Product details "', '', '', '', '', '', '', '']);
      txt3.height = 25;
      txt3.getCell(2).font = { size: 12, bold: true, color: { argb: 'FF0070C0' } };
      worksheet.mergeCells('B' + txt3.number + ':J' + txt3.number);

      const txt4 = worksheet.addRow(['', '* Nếu hàng là hóa chất (bột, lỏng): cung cấp C/A hoặc MSDS, Công văn cam kết, Tờ khai đường hàng không', '', '', '', '', '', '', '']);
      txt4.height = 25;

      const txt5 = worksheet.addRow(['', "* Nếu hàng là điện tử: cung cấp 'Tờ khai đường hàng không', MSDS (nếu có)'", '', '', '', '', '', '', '']);
      txt5.height = 25;

      const txt6 = worksheet.addRow(['', '* Nếu hàng xuất có điều kiện: vui lòng bổ sung Giấy phép xuất khẩu ngay khi khai thông tin cho thông báo này.', '', '', '', '', '', '', '']);
      txt6.height = 25;

      const txt7 = worksheet.addRow(['', 'Quý khách vui lòng gởi thông tin này qua những địa chỉ email sau :', '', '', '', '', '', '', '']);
      txt7.height = 25;
      txt7.getCell(2).font = { size: 12, bold: true };

      const txt8 = worksheet.addRow(['', 'Công ty UPS Việt Nam - Phòng Thông quan - Bộ phận Hàng xuất: 028.3948.7999', '', '', '', '', '', '', '']);
      txt8.height = 25;

      const txt9 = worksheet.addRow(['', '* Mr. Giang (dhgiang@ups.com) - Ext : 212', '', '', '', '', '', '', '']);
      txt9.height = 25; 

      const txt10 = worksheet.addRow(['', '* Mr. Vinh (phantrongvinh@ups.com) - Ext : 112', '', '', '', '', '', '', '']);
      txt10.height = 25;

      const txt11 = worksheet.addRow(['', '* Mr. Khánh (dinhkhanhnguyen@ups.com) - Ext: 210', '', '', '', '', '', '']);
      txt11.height = 25;

      const txt12 = worksheet.addRow(['', '* Mr. Hải ( nhai@ups.com)', '', '', '', '', '', '', '']);
      txt12.height = 25;

      worksheet.addRow(['', '', '', '', '', '', '', '', '', '']);
      const txt13 = worksheet.addRow(['', 'Cảm ơn Quí khách đã sử dụng dịch vụ UPS.', '', '', '', '', '', '', 'Xác nhận của khách hàng', '']);
      txt13.height = 25;

      const txt14 = worksheet.addRow(['', '', '', '', '', '', '', '', '(Đóng dấu, ký tên)', '']);
      txt14.height = 25;

      const lastRow = worksheet.lastRow?.number || 0;
      if (lastRow > 0) {
          
          // worksheet.mergeCells('B' + (lastRow - 12) + ':J' + (lastRow - 12));
          worksheet.mergeCells('B' + (lastRow - 11) + ':J' + (lastRow - 11));
          worksheet.mergeCells('B' + (lastRow - 10) + ':J' + (lastRow - 10));
          worksheet.mergeCells('B' + (lastRow - 9) + ':J' + (lastRow - 9));
          worksheet.mergeCells('B' + (lastRow - 8) + ':J' + (lastRow - 8));
          worksheet.mergeCells('B' + (lastRow - 7) + ':J' + (lastRow - 7));
          worksheet.mergeCells('B' + (lastRow - 6) + ':J' + (lastRow - 6));
          worksheet.mergeCells('B' + (lastRow - 5) + ':J' + (lastRow - 5));
          worksheet.mergeCells('B' + (lastRow - 4) + ':J' + (lastRow - 4));
          worksheet.mergeCells('B' + (lastRow - 3) + ':J' + (lastRow - 3));

          worksheet.mergeCells('B' + (lastRow - 1) + ':D' + (lastRow - 1));
          worksheet.mergeCells('I' + (lastRow - 1) + ':J' + (lastRow - 1));
          worksheet.mergeCells('I' + lastRow + ':J' + lastRow);
      }
      worksheet.getCell('I' + lastRow).alignment = { horizontal: 'center' };
      worksheet.getCell('I' + (lastRow - 1)).alignment = {horizontal: 'center' };

      // Thêm sheet thứ hai cho chi tiết sản phẩm

      const sheet2 = workbook.addWorksheet('Product details');
      sheet2.columns = [
        { header: 'STT', key: 'stt', width: 10 },
        { header: 'Tên hàng (mô tả chi tiết)', key: 'description', width: 45 },
        { header: 'Mã HS', key: 'codeHS', width: 20 },
        { header: 'Xuất xứ', key: 'origin', width: 20 },
        { header: 'Số lượng', key: 'quantity', width: 20 },
        { header: 'Đơn vị', key: 'unit', width: 20 },
        { header: 'Đơn giá hóa đơn\n(USD)', key: 'unitPrice', width: 30 },
        { header: 'Trị giá hóa đơn\n(USD)', key: 'totalPrice', width: 30 },
      ];

      const headerRow2 = sheet2.getRow(1);

      headerRow2.eachCell((cell, colNumber) => {
        cell.font = { bold: true, size: 12 };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F0F0' },
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };      
      });

      headerRow2.height = 45;


      if (items.length > 5) {
        
        items.forEach((item, index) => {
          const row = sheet2.addRow([
          index + 1,
          item.description,
          '', // HS
          item.origin,
          item.quantity,
          item.unit,
          item.unitPrice,
          item.subtotal
        ]);


          row.eachCell((cell) => {
            cell.font = { name: 'Times New Roman', size: 14 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' , wrapText: true };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
          row.height = 250;
        });
      }



      // Save file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Export_Notice_${airWaybillNo}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg dark:bg-gray-800">
        <div className="relative w-full mb-6">
          <form>
            <div className="flex items-center gap-3">
              <button className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="24"
                  height="24"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z"
                    fill=""
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Tìm kiếm file..."
                className="flex-1 h-12 rounded-lg border border-gray-300 bg-transparent px-4 text-lg text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <label
              htmlFor="fileInput"
              className="block w-full cursor-pointer rounded-lg bg-blue-500 px-6 py-3 text-center text-lg font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Chọn File
            </label>
            <input
              id="fileInput"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setFileName(e.target.files[0].name);
                }
              }}
            />
            {fileName && (
              <div className="text-lg text-gray-700 dark:text-gray-300">
                File đã chọn: <strong>{fileName}</strong>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            className="w-full rounded-lg bg-green-500 px-6 py-3 text-center text-lg font-semibold text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            Upload File
          </button>

          

          <div className="mt-6 space-y-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.url}
                className="flex items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-gray-700 cursor-pointer"
                onClick={() => handleOpenFile(file.url)}
              >
                <div>
                  <p className="text-lg font-medium text-gray-800 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ngày upload: {file.created_at}
                  </p>
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await handleRemoveFile(file);
                  }}
                  className="text-red-500 hover:underline text-sm"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
            {invoiceData.totalValue > 200 && selectedService.carrier.toLowerCase() === 'ups' && (
              <button
                onClick={exportENExcel}
                className="w-full rounded-lg bg-green-500 px-6 py-3 text-center text-lg font-semibold text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              >
                Xuất EN
              </button>
            )}

        </div>


      </div>
    );
  }
