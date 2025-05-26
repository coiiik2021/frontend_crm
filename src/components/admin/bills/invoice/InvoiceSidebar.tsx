import axios from "axios";
import { useEffect, useState } from "react";

type UploadedFile = {
  name: string;
  url: string;
  created_at: string;
  bill_id: string; // Optional property for file identification
  id: string; // Optional property for file identification
};

export default function InvoiceSidebar({ bill_id }: { bill_id: string }) {
  if (!bill_id) {
    console.warn("bill_id is not provided");
  }

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
      console.log("File uploaded to:", fileUrl);

      const dataRequest = {
        bill_id,
        url: fileUrl,
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
    </div>
  );
}