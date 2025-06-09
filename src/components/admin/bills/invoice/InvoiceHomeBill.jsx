import { GetInvoicePdf } from "../../../../service/api.admin.service";
import React, { useEffect, useState } from "react";

const PdfViewer = ({ bill_id }) => {
  const id = bill_id || "";
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("PDF Viewer mounted with bill_id:", id);
    const loadPdf = async () => {
      try {
        const response = await GetInvoicePdf(id);
        const blob = new Blob([response], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        alert("Lấy PDF thất bại");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPdf(); // tự động gọi khi component mount
  }, []);

  return (
    <div>
      {loading && <p>Đang tải PDF...</p>}

      {!loading && pdfUrl && (
        <iframe
          src={pdfUrl}
          title="PDF Viewer"
          width="100%"
          height="800px"
          style={{ border: "1px solid #ccc", marginTop: "10px" }}
        />
      )}
    </div>
  );
};

export default PdfViewer;
