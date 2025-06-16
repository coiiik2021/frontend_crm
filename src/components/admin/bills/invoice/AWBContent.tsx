import { PutInformationAwb } from "../../../../service/api.admin.service";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";


type UploadedFile = {
  id: string;
  bill_id: string;
  name: string;
  url: string;
  created_at: string;
};

export default function AWBContent({
  bill_id,
  fetchBillData,
}: {
  bill_id: string | undefined;
  fetchBillData?: () => void;
}) {
  if (!bill_id) {
    console.warn("bill_id is not provided");
  }

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // State để lưu từ khóa tìm kiếm

  type DataInformation = {
    awb: string;
    bill_employee: string;
  };

  const [dataInformation, setDataInformation] = useState<DataInformation>({
    awb: "",
    bill_employee: "",
  });

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/bill/information-awb/${bill_id}`
        );

        setUploadedFiles(response.data.data.files);

        setDataInformation({
          awb: response.data.data.awb,
          bill_employee: response.data.data.billEmployee,
        });
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

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ebay_express");

      const res = await axios.post("https://api.cloudinary.com/v1_1/ds1zbrgib/raw/upload", formData);
      const fileUrl = res.data.secure_url;
      const publicId = res.data.public_id;
      const dataRequest = {
        bill_id,
        url: fileUrl,
        type: "pdf",
        name: file.name,
        public_id: publicId,
        category: "awb",
      };

      const saveRes = await axios.post("http://localhost:8080/api/files", dataRequest);
      const newFile: UploadedFile = saveRes.data.data;

      setUploadedFiles((prev) => [...prev, newFile]);
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

  // Lọc danh sách file dựa trên từ khóa tìm kiếm
  const filteredFiles = uploadedFiles.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async () => {
    const toastId = toast.loading("Đang cập nhật dữ liệu...");

    try {
      const dataRequest = { id: bill_id, ...dataInformation };
      await PutInformationAwb(dataRequest);

      toast.update(toastId, {
        render: "Cập nhật thành công!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      toast.update(toastId, {
        render: `Lỗi: ${error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi không xác định"
          }`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
    fetchBillData?.();
  };

  return (
    <>
      <ToastContainer
        toastClassName="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg top-12"
        progressClassName="bg-blue-500"
      />
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        {/* Nút toggle ẩn/hiện form */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 w-full flex justify-between items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          <span>{showForm ? "Ẩn form" : "Hiện form"}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transform transition-transform duration-200 ${showForm ? "rotate-180" : ""
              }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Form sẽ ẩn/hiện */}
        {showForm && (
          <div className="space-y-4">
            {/* AWB Field */}
            <div className="space-y-1">
              <label
                htmlFor="awb"
                className="block text-sm font-medium text-gray-700"
              >
                AWB
              </label>
              <input
                type="text"
                id="awb"
                value={dataInformation.awb}
                onChange={(e) =>
                  setDataInformation({
                    ...dataInformation,
                    awb: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter AWB number"
              />
            </div>

            {/* Bill Employee Field */}
            <div className="space-y-1">
              <label
                htmlFor="bill_employee"
                className="block text-sm font-medium text-gray-700"
              >
                Bill Employee
              </label>
              <input
                type="text"
                id="bill_employee"
                value={dataInformation.bill_employee}
                onChange={(e) =>
                  setDataInformation({
                    ...dataInformation,
                    bill_employee: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Enter employee name"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
            >
              Submit
            </button>
          </div>
        )}
      </div>
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
                    handleRemoveFile(file);
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
    </>
  );
}