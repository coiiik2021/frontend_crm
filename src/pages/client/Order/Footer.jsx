import { CreateBill } from "../../../service/api.admin.service.jsx";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function Footer({
  currentStep,
  setCurrentStep,
  products,
  setProductsErrors,
  dataRequest,
}) {
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Cuộn trang lên đầu khi quay lại bước trước
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    console.log(dataRequest);
  });

  const validateProducts = () => {
    if (currentStep === 3) {
      const newErrors = {};
      let isValid = true;

      products.forEach((pkg) => {
        const requiredFields = [
          "Mô tả sản phẩm",
          "Xuất xứ",
          "Số lượng",
          "Kiểu đơn vị",
          "Giá trên 1 sản phẩm",
        ];

        requiredFields.forEach((field) => {
          const val = pkg[field];
          const key = `${pkg.id}-${field}`;

          if (!val || val === "" || val === undefined || val === null) {
            newErrors[key] = "Vui lòng điền đầy đủ thông tin";
            isValid = false;
          } else if (["Số lượng", "Giá trên 1 sản phẩm"].includes(field)) {
            const numVal = parseFloat(val);
            if (isNaN(numVal) || numVal <= 0) {
              newErrors[key] = "Vui lòng nhập số lớn hơn 0";
              isValid = false;
            }
          }
        });
      });

      setProductsErrors(newErrors);
      return isValid;
    }
    return true;
  };

  const handleContinue = async () => {
    if (currentStep < 4) {
      if (validateProducts()) {
        console.log(dataRequest, dataRequest);
        setCurrentStep(currentStep + 1);
        // Cuộn trang lên đầu khi chuyển sang bước tiếp theo
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
    if (currentStep === 4) {
      try {
        // Hiển thị thông báo đang xử lý
        const loadingToast = toast.loading("Đang tạo đơn hàng...");

        console.log(dataRequest);
        const response = await CreateBill(dataRequest);
        console.log(response);

        if (response === "created successfully") {
          toast.update(loadingToast, {
            render: "Đơn hàng đã được tạo thành công!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });

          // // Chuyển hướng sau khi hiển thị thông báo thành công
          // setTimeout(() => {
          //     window.location.href = "/";
          // }, 2000);
        } else {
          toast.update(loadingToast, {
            render: "Có lỗi xảy ra khi tạo đơn hàng.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      } catch (error) {
        // Xử lý lỗi và hiển thị thông báo
        console.error("Error creating order:", error);
        toast.error(`Lỗi: ${error.message || "Không thể tạo đơn hàng"}`);
      }
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 1:
        return "Continue to Sender & Recipient";
      case 2:
        return "Continue to Package & Service";
      case 3:
        return "Continue to Review & Confirm";
      case 4:
        return "Submit Order";
      default:
        return "Continue";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        padding: "24px 32px",
        margin: "32px 0 0 0",
      }}
    >
      {currentStep > 1 && (
        <button
          onClick={handleBack}
          style={{
            padding: "10px 20px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#1737e6",
            fontWeight: 500,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Back
        </button>
      )}
      <button
        onClick={handleContinue}
        style={{
          padding: "10px 20px",
          borderRadius: 6,
          border: "none",
          background: "#1737e6",
          color: "#fff",
          fontWeight: 600,
          fontSize: 16,
          cursor: "pointer",
          marginLeft: "auto",
        }}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
