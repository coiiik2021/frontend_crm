import axios from "axios";
import { useEffect, useState } from "react";

type UploadedFile = {
  name: string;
  url: string;
  created_at: string;
};

export default function AWBContent({ bill_id }: { bill_id: string }) {
  if (!bill_id) {
    console.warn("bill_id is not provided");
  }

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // State để lưu từ khóa tìm kiếm

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const dataRequest = {
          bill_id,
          type: "pdf",
        };
        const response = await axios.post(
          "http://localhost:8080/api/files/get",
          dataRequest
        );
        setUploadedFiles(response.data.data);
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
      }
    };
    fetchUploadedFiles();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      alert("Vui lòng chọn file trước khi upload!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ebay_express");
    formData.append("resource_type", "auto");
    // formData.append("access_mode", "public");
    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/ds1zbrgib/auto/upload",
        formData
      );

      const fileUrl = res.data.secure_url;
      console.log("File uploaded to:", fileUrl);

      const dataRequest = {
        bill_id,
        url: fileUrl,
        type: "pdf",
        name: file.name,
      };

      await axios.post("http://localhost:8080/api/files", dataRequest);

      const newFile: UploadedFile = {
        name: file.name,
        url: fileUrl,
        created_at: new Date().toLocaleDateString(),
      };
      setUploadedFiles((prev) => [...prev, newFile]);

      setFile(null);
      setFileName(null);

      alert("Upload thành công!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload thất bại!");
    }
  };

  const handleRemoveFile = (fileUrl: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.url !== fileUrl));
    alert("File đã được xóa!");
  };

  const handleOpenFile = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  // Lọc danh sách file dựa trên từ khóa tìm kiếm
  const filteredFiles = uploadedFiles.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="relative w-full mb-5">
        <form>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
              <svg
                className="fill-gray-500 dark:fill-gray-400"
                width="20"
                height="20"
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật từ khóa tìm kiếm
              className="flex-1 h-10 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <label
            htmlFor="fileInput"
            className="block w-full cursor-pointer rounded-lg bg-blue-500 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Chọn File
          </label>
          <input
            id="fileInput"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
                setFileName(e.target.files[0].name);
              }
            }}
          />
          {fileName && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              File đã chọn: <strong>{fileName}</strong>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          className="w-full rounded-lg bg-green-500 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        >
          Upload File
        </button>

        <div className="mt-4 space-y-3">
          {filteredFiles.map((file) => (
            <div
              key={file.url}
              className="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-white/[0.03] cursor-pointer"
              onClick={() => handleOpenFile(file.url)}
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ngày upload: {file.created_at}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(file.url);
                }}
                className="text-red-500 hover:underline text-xs"
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
