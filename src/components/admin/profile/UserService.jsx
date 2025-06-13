"use client";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../ui/modal";
import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { GetConstUser } from "../../../service/api.admin.servicets";
import Select from "../form/Select";
import { DeleteConstUser, DeletePriceNetUserByWeightAndZone, GetAllByServiceCompany, GetAllPriceNetForUserByZoneAndWeight, GetNameServiceByUser, PostConstUser, PostPriceNetUserByWeightAndZone, PutConstUser } from "../../../service/api.admin.service";
import { jwtDecode } from "jwt-decode";

export default function UserService({ user }) {
  const [constUsers, setConstUsers] = useState([]);
  const [nameServices, setNameServices] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editConst, setEditConst] = useState(null);

  const [serviceNamePriceEdit, setServiceNamePriceEdit] = useState();

  const [isOpenPrice, setIsOpenPrice] = useState(false);

  const { isOpen, openModal, closeModal } = useModal();

  const [discountProfit, setDiscountProfit] = useState(150);

  const [priceNetUserByNameService, setPriceNetUserByNameService] = useState([]);
  const [savedRows, setSavedRows] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const [authorities, setAuthorities] = useState([]);

  const [serviceSelect, setServiceSelect] = useState(null);

  const [notification, setNotification] = useState({ open: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ open: true, message, type });
    setTimeout(() => setNotification({ open: false, message: "", type }), 3000);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const dataBaseUser = await GetConstUser(user?.id);

        const token = localStorage.getItem("token");

        const decoded = jwtDecode(token);
        const authoritiesResponse = decoded.authorities;
        setAuthorities(authoritiesResponse);

        let dataNameServiceByUser = await GetNameServiceByUser(true);
        if (authorities.includes("MANAGER")
        ) {
          dataNameServiceByUser = await GetNameServiceByUser(false);
        }
        const dataNameServiceFillter = dataNameServiceByUser.filter((item) => {
          return !dataBaseUser.some((userService) => userService.service_id === item.id);
        });

        console.log("Dữ liệu từ API dataNameServiceByUser:", dataNameServiceByUser);
        setConstUsers(dataBaseUser || []);
        setNameServices(dataNameServiceFillter || []);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, [user?.id]);

  const handleSave = async (event) => {

    const newConstRequest = {
      account_id: user?.id,
      service_id: newConst.service_id, // Đảm bảo id được cập nhật đúng
      dim: newConst.dim,
      ppxd: newConst.ppxd,
      vat: newConst.vat,
      overSize: newConst.overSize,
      peakSeason: newConst.peakSeason,
    };
    console.log("newConstRequest:", newConstRequest); // Kiểm tra user ID

    console.log("Request Payload:", newConstRequest); // Kiểm tra payload

    const dataResponse = await PostConstUser(newConstRequest);
    setConstUsers((prev) => [...prev, dataResponse]); // Cập nhật danh sách
    closeModal();
  };

  const [zoneOfService, setZoneOfService] = useState([]);

  const handleSetupPriceNetUser = async (service) => {
    setIsOpenPrice(true);



    const nameService = service.nameService.split("-")[0].trim();
    console.log("Name Service:", nameService); // Kiểm tra giá trị nameService

    const dataZone = await GetAllByServiceCompany(nameService);
    const zoneOptions = dataZone.map(zone => ({
      label: zone,
      value: zone
    }));
    setZoneOfService(zoneOptions);
    const dataRequest = {
      service_id: service.service_id,
      account_id: user?.id
    };


    setDiscountProfit(service.profit);

    const dataPriceResponse = await GetAllPriceNetForUserByZoneAndWeight(dataRequest);

    const formattedResponse = dataPriceResponse.map(item => ({
      ...item,
      zone: item.zone ? item.zone.toString() : ""
    }));

    setPriceNetUserByNameService(formattedResponse);
    setServiceNamePriceEdit(serviceSelect);

    const newSavedRows = {};
    formattedResponse.forEach(item => {
      if (item.id) {
        newSavedRows[item.id] = true;
      }
    });
    setSavedRows(newSavedRows);
  }

  const handleDelete = async (id) => {

    const deleteConst = {
      account_id: user.id,
      service_id: id,
    }
    await DeleteConstUser(deleteConst);

    setConstUsers((prev) => prev.filter((item) => item.service_id !== id)); // Cập nhật danh sách
  }

  const handleEdit = (row) => {
    setEditConst(row);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {

    const updatedConst = {
      ...editConst,
      account_id: user.id
    }
    console.log(updatedConst);
    const dataResponse = await PutConstUser(updatedConst);

    console.log("Response from API:", dataResponse);

    setConstUsers((prev) =>
      prev.map((item) =>
        item.service_id === editConst.service_id ? editConst : item
      )
    );
    setEditModalOpen(false); // Đóng modal chỉnh sửa
  };

  const [newConst, setNewConst] = useState({
    nameService: "",
    dim: 5000,
    ppxd: 100,
    vat: 8,
    overSize: 100,
    peakSeason: 100,
    profit: 150
  });

  const handlePrice = (row) => {
    setPriceNetUserByNameService(row);
  }

  const validatePriceNetData = (row) => {
    const errors = {};

    if (row.kgMin === undefined || row.kgMin === null || row.kgMin === '') {
      errors.kgMin = "KG MIN không được để trống";
    } else if (parseFloat(row.kgMin) < 0) {
      errors.kgMin = "KG MIN không được âm";
    }

    // Kiểm tra kgMax
    if (row.kgMax === undefined || row.kgMax === null || row.kgMax === '') {
      errors.kgMax = "KG MAX không được để trống";
    } else if (parseFloat(row.kgMax) < 0) {
      errors.kgMax = "KG MAX không được âm";
    }

    // Kiểm tra kgMin <= kgMax
    if (parseFloat(row.kgMin) > parseFloat(row.kgMax)) {
      errors.kgMax = "KG MAX phải lớn hơn hoặc bằng KG MIN";
    }

    // Kiểm tra zone
    if (!row.zone) {
      errors.zone = "Vui lòng chọn ZONE";
    }

    // Kiểm tra price
    if (row.price === undefined || row.price === null || row.price === '') {
      errors.price = "PRICE không được để trống";
    } else if (parseFloat(row.price) < 0) {
      errors.price = "PRICE không được âm";
    }

    return errors;
  };

  const handleCreatePriceNetUser = async (row) => {
    try {
      // Kiểm tra validation
      const errors = validatePriceNetData(row);

      // Nếu có lỗi, hiển thị và không gửi request
      if (Object.keys(errors).length > 0) {
        setValidationErrors(prev => ({
          ...prev,
          [row.id]: errors
        }));
        return;
      }

      // Xóa lỗi validation nếu có
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[row.id];
        return newErrors;
      });

      const dataRequest = {
        account_id: user?.id,
        service_id: serviceNamePriceEdit?.service_id,
        kgMin: row?.kgMin,
        kgMax: row?.kgMax,
        zone: row?.zone,
        price: row?.price
      };

      const dataResponse = await PostPriceNetUserByWeightAndZone(dataRequest);
      console.log("Response from API:", dataResponse);

      if (dataResponse) {
        // Cập nhật state với dữ liệu từ API và ID mới
        setPriceNetUserByNameService(prev =>
          prev.map(item => (item.id === row.id ? { ...dataResponse, id: dataResponse.id } : item))
        );

        // Đánh dấu hàng này đã được lưu với ID mới từ API
        setSavedRows(prev => {
          const newSavedRows = { ...prev };
          delete newSavedRows[row.id]; // Xóa ID cũ
          newSavedRows[dataResponse.id] = true; // Thêm ID mới
          return newSavedRows;
        });
      }
    } catch (error) {
      console.error("Error saving price net:", error);
    }
  };

  // Hàm xử lý khi người dùng bấm nút xóa
  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setDeleteConfirmOpen(true);
  };

  // Hàm xử lý khi người dùng xác nhận xóa
  const confirmDelete = async () => {
    if (!rowToDelete) return;

    try {
      console.log("Deleting row with ID:", rowToDelete.service_id); // Kiểm tra ID trước khi xóa

      // Kiểm tra ID có tồn tại không
      if (!rowToDelete.service_id) {
        console.error("Error: ID is undefined");
        alert("Không thể xóa mục này vì ID không xác định");
        setDeleteConfirmOpen(false);
        setRowToDelete(null);
        return;
      }

      handleDelete(rowToDelete.service_id);

      // Đóng modal xác nhận
      setDeleteConfirmOpen(false);
      setRowToDelete(null);
    } catch (error) {
      console.error("Error deleting price:", error);
      alert("Có lỗi xảy ra khi xóa: " + error.message);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setRowToDelete(null);
  };

  const handleUpdateProfit = async () => {
    try {
      const dataRequest = {
        account_id: user?.id,
        service_id: serviceSelect?.service_id,
        profit: discountProfit
      };

      const res = await PutConstUser(dataRequest);

      setConstUsers(prev =>
        prev.map(item =>
          item.service_id === serviceSelect?.service_id
            ? { ...item, profit: discountProfit }
            : item
        )
      );
      showNotification("Cập nhật profit thành công!", "success");
    } catch (error) {
      showNotification("Cập nhật profit thất bại!", "error");
    }
  };




  return (
    <>
      <div className="w-full p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="w-full flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            <h4 className="w-full text-2xl font-semibold text-gray-800 dark:text-white/90 lg:mb-8">
              Service Information
            </h4>
            <div className="flex justify-end">
              <Button
                onClick={openModal}
                className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
              >
                Thêm dịch vụ
              </Button>
            </div>

            <div className="w-full mt-6">
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
                <div className="overflow-x-auto custom-scrollbar">
                  <Table className="w-full min-w-[900px]">
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="sticky left-0 min-w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                        >
                          Service Name
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                        >
                          Dim
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                        >
                          PPXD
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                        >
                          VAT
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                        >
                          OverSize
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                        >
                          Peak Season
                        </TableCell>

                        <TableCell
                          isHeader
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                        >
                          Profit
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                      {constUsers.length > 0 ? (
                        constUsers.map((row, index) => {
                          return (
                            <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <TableCell className="sticky left-0 min-w-[200px] px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-900">
                                {row.nameService}
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                {row.dim}
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                {row.ppxd}
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                {row.vat}
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                {row.overSize}
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                {row.peakSeason}
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                {row.profit}
                              </TableCell>
                              <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(row)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-500"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(row)}
                                  className="inline-flex items-center px-3 py-1.5 ml-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                                >
                                  Delete
                                </button>


                                {authorities.includes("ADMIN") && (
                                  <button
                                    onClick={async () => {
                                      setServiceSelect(row);
                                      await handleSetupPriceNetUser(row);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 ml-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                                  >
                                    Giá
                                  </button>
                                )}

                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                          >
                            No services found. Please add a new service.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Service
            </h4>
          </div>
          <form className="flex flex-col" onSubmit={async (e) => {
            e.preventDefault(); await handleSave();
          }}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Service</Label>
                  <Select
                    value={newConst.nameService}
                    onChange={(selectedOption) => {
                      console.log("Selected option:", selectedOption); // Kiểm tra giá trị trả về
                      setNewConst({
                        ...newConst,
                        service_id: selectedOption || null,

                      });
                    }}
                    options={
                      nameServices?.map((item) => ({
                        value: item.id, // Đây là service_id
                        label: item.name + " " + item.nameService,
                      })) || []
                    }
                  />
                </div>
                <div>
                  <Label>DIM</Label>
                  <Input
                    type="text"
                    value={newConst.dim}
                    onChange={(e) =>
                      setNewConst({ ...newConst, dim: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>PPXD</Label>
                  <Input
                    type="text"
                    value={newConst.ppxd}
                    onChange={(e) =>
                      setNewConst({ ...newConst, ppxd: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>VAT</Label>
                  <Input
                    type="text"
                    value={newConst.vat}
                    onChange={(e) =>
                      setNewConst({ ...newConst, vat: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Oversize</Label>
                  <Input
                    type="text"
                    value={newConst.overSize}
                    onChange={(e) =>
                      setNewConst({ ...newConst, overSize: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Peak Season</Label>
                  <Input
                    type="text"
                    value={newConst.peakSeason}
                    onChange={(e) =>
                      setNewConst({ ...newConst, peakSeason: e.target.value })
                    }
                  />
                </div>



              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={isOpenPrice}
        onClose={() => setIsOpenPrice(false)}
        className="max-w-[800px] mx-auto p-0 rounded-3xl bg-white shadow-lg dark:bg-gray-900"
      >
        <div className="w-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                Khoảng giá ({serviceNamePriceEdit?.nameService || "Chưa chọn dịch vụ"})
              </h4>
              <button
                onClick={() => setIsOpenPrice(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>



          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              {/* Profit block */}
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 rounded-xl shadow border border-gray-200 dark:border-gray-700 w-full md:w-auto md:min-w-[340px]">
                <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1 text-base">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  Profit
                </span>
                <input
                  type="number"
                  value={discountProfit}
                  onChange={(e) => setDiscountProfit(e.target.value)}
                  className="w-20 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
                  placeholder="Profit"
                  min={0}
                />
                <Button
                  onClick={handleUpdateProfit}
                  className="flex items-center gap-1 px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Update
                </Button>
              </div>
              {/* Add button */}
              <div className="flex justify-end md:justify-end w-full md:w-auto">
                <Button
                  onClick={() => {
                    const newPriceNetUser = {
                      id: Date.now(),
                      kgMin: 0,
                      kgMax: 0,
                      zone: "",
                      price: 0,
                    };
                    setPriceNetUserByNameService((prev) => [...prev, newPriceNetUser]);
                  }}
                  className="px-6 py-2 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
                >
                  Thêm
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 w-1/5">
                        KG MIN
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 w-1/5">
                        KG MAX
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 w-1/5">
                        ZONE
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 w-1/5">
                        PRICE
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 w-1/5">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {Array.isArray(priceNetUserByNameService) &&
                      priceNetUserByNameService.length > 0 ? (
                      priceNetUserByNameService.map((row, index) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {savedRows[row.id] ? (
                              <span>{row.kgMin}</span>
                            ) : (
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={row.kgMin}
                                  onChange={(e) =>
                                    setPriceNetUserByNameService((prev) =>
                                      prev.map((item) =>
                                        item.id === row.id
                                          ? { ...item, kgMin: e.target.value }
                                          : item
                                      )
                                    )
                                  }
                                  placeholder="KG MIN"
                                  className={`w-full text-sm ${validationErrors[row.id]?.kgMin ? 'border-red-500' : ''}`}
                                />
                                {validationErrors[row.id]?.kgMin && (
                                  <div className="absolute text-xs text-red-500 mt-1">
                                    {validationErrors[row.id].kgMin}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {savedRows[row.id] ? (
                              <span>{row.kgMax}</span>
                            ) : (
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={row.kgMax}
                                  onChange={(e) =>
                                    setPriceNetUserByNameService((prev) =>
                                      prev.map((item) =>
                                        item.id === row.id
                                          ? { ...item, kgMax: e.target.value }
                                          : item
                                      )
                                    )
                                  }
                                  placeholder="KG MAX"
                                  className={`w-full text-sm ${validationErrors[row.id]?.kgMax ? 'border-red-500' : ''}`}
                                />
                                {validationErrors[row.id]?.kgMax && (
                                  <div className="absolute text-xs text-red-500 mt-1">
                                    {validationErrors[row.id].kgMax}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {savedRows[row.id] ? (
                              <span>{row.zone}</span>
                            ) : (
                              <div className="relative">
                                <Select
                                  value={row.zone ? row.zone.toString() : ""}
                                  onChange={(selectedOption) => {
                                    console.log("Selected option:", selectedOption);
                                    setPriceNetUserByNameService((prev) =>
                                      prev.map((item) =>
                                        item.id === row.id ? { ...item, zone: selectedOption } : item
                                      )
                                    );
                                  }}
                                  options={zoneOfService}
                                  placeholder="Select zone"
                                  className={`w-full text-sm ${validationErrors[row.id]?.zone ? 'border-red-500' : ''}`}
                                />
                                {validationErrors[row.id]?.zone && (
                                  <div className="absolute text-xs text-red-500 mt-1">
                                    {validationErrors[row.id].zone}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {savedRows[row.id] ? (
                              <span>{row.price}</span>
                            ) : (
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={row.price}
                                  onChange={(e) =>
                                    setPriceNetUserByNameService((prev) =>
                                      prev.map((item) =>
                                        item.id === row.id
                                          ? { ...item, price: e.target.value }
                                          : item
                                      )
                                    )
                                  }
                                  placeholder="PRICE"
                                  className={`w-full text-sm ${validationErrors[row.id]?.price ? 'border-red-500' : ''}`}
                                />
                                {validationErrors[row.id]?.price && (
                                  <div className="absolute text-xs text-red-500 mt-1">
                                    {validationErrors[row.id].price}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {!savedRows[row.id] && (
                                <button
                                  onClick={async () => {
                                    console.log("Lưu dữ liệu:", row);
                                    await handleCreatePriceNetUser(row);
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800"
                                >
                                  Lưu
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  setPriceNetUserByNameService((prev) =>
                                    prev.filter((item) => item.id !== row.id)
                                  );
                                  if (row.id && typeof row.id !== 'number') {
                                    await DeletePriceNetUserByWeightAndZone(row.id);
                                  }
                                  // Xóa khỏi danh sách đã lưu nếu có
                                  if (savedRows[row.id]) {
                                    setSavedRows(prev => {
                                      const newSavedRows = { ...prev };
                                      delete newSavedRows[row.id];
                                      return newSavedRows;
                                    });
                                  }
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          Không có dữ liệu. Vui lòng thêm mới.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Button
              onClick={() => setIsOpenPrice(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} className="max-w-[1000px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Service
            </h4>
          </div>
          <form
            className="flex flex-col"
            onSubmit={async (e) => {
              e.preventDefault();
              await handleSaveEdit();
            }}
          >
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>DIM</Label>
                  <Input
                    type="text"
                    value={editConst?.dim || ""}
                    onChange={(e) =>
                      setEditConst({ ...editConst, dim: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>PPXD</Label>
                  <Input
                    type="text"
                    value={editConst?.ppxd || ""}
                    onChange={(e) =>
                      setEditConst({ ...editConst, ppxd: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>VAT</Label>
                  <Input
                    type="text"
                    value={editConst?.vat || ""}
                    onChange={(e) =>
                      setEditConst({ ...editConst, vat: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Oversize</Label>
                  <Input
                    type="text"
                    value={editConst?.overSize || ""}
                    onChange={(e) =>
                      setEditConst({ ...editConst, overSize: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Peak season</Label>
                  <Input
                    type="text"
                    value={editConst?.peakSeason || ""}
                    onChange={(e) =>
                      setEditConst({ ...editConst, peakSeason: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Profit</Label>
                  <Input
                    type="text"
                    value={editConst?.profit || ""}
                    onChange={(e) =>
                      setEditConst({ ...editConst, profit: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={() => setEditModalOpen(false)}>
                Close
              </Button>
              <Button size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={cancelDelete}
        className="max-w-[400px] mx-auto p-0 rounded-3xl bg-white shadow-lg dark:bg-gray-900"
      >
        <div className="w-full">
          <div className="p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">Xác nhận xóa</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center space-x-3">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>

      {notification.open && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all
            ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {notification.message}
        </div>
      )}
    </>
  );
}
