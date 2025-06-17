import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table/index.js";
import { NavLink } from "react-router";
import { PencilIcon, TrashBinIcon } from "../../../icons/index.js";
import React, { useEffect, useState } from "react";
import Label from "../form/Label.js";
import Input from "../form/input/InputField.js";
import Button from "../../../elements/Button/index";
import { Modal } from "../ui/modal/index.js";
import { useModal } from "../../../hooks/useModal";
import {
  DeleteOverSize,
  GetOverSizeByName,
  PostOverSize,
  PutOverSize,
} from "../../../service/api.admin.service.jsx";
import { useLoading } from "../../../hooks/useLoading";
import { Spin } from "antd";

const OverSizeTable = () => {
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    length: 0,
    width: 0,
    height: 0,
    price: 0,
  });
  const { loading, withLoading } = useLoading();

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const [overSize, setOverSize] = useState([]);

  const nameCompany = "ups";

  const [newOverSize, setNewOverSize] = useState({
    name: "",
    price: "",
    description: "",
    nameCompany: nameCompany,
  });

  useEffect(() => {
    async function fetchData() {
      const dataOverSize = await GetOverSizeByName(nameCompany);

      console.log("dataOverSize", dataOverSize);

      setOverSize(dataOverSize);
    }
    fetchData();
  }, []);

  const handleAddNew = async () => {
    const data = await PostOverSize(newOverSize);
    if (data) {
      setOverSize([...overSize, data]);
      setNewOverSize({
        name: "",
        nameCompany: nameCompany,
        price: "",
        description: "",
      });
    }
    console.log("data", data);
  };

  const { isOpen, openModal, closeModal } = useModal();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    await withLoading(
      async () => {
        // Kiểm tra dữ liệu đầu vào
        if (
          !editValues.length ||
          !editValues.width ||
          !editValues.height ||
          !editValues.price
        ) {
          throw new Error("Vui lòng nhập đầy đủ thông tin");
        }

        // TODO: Gọi API để lưu dữ liệu
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Giả lập API call
        setIsEditing(false);
      },
      "Cập nhật dữ liệu thành công",
      "Cập nhật dữ liệu thất bại"
    );
  };

  const handleCancel = () => {
    setEditValues({
      length: 0,
      width: 0,
      height: 0,
      price: 0,
    });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditValues({
      length: 0,
      width: 0,
      height: 0,
      price: 0,
    });
    setIsEditing(true);
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    nameCompany: nameCompany,
  });

  // Khi nhấn nút Pencil
  const handleEditClick = (item) => {
    setEditItem(item);
    setEditForm({
      id: item.id, // Thêm id vào form
      name: item.name,
      price: item.price,
      description: item.description,
      nameCompany: item.nameCompany,
    });
    setEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    const updated = await PutOverSize(editItem.id, editForm);
    if (updated) {
      setOverSize((prev) =>
        prev.map((item) => (item.id === editItem.id ? updated : item))
      );
      setEditModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Nút Thêm mới */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openModal}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Thêm mới
        </button>

        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[700px] m-4"
        >
          <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Thêm dịch vụ
              </h4>
            </div>
            <form className="flex flex-col">
              <div className="px-2 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>name</Label>
                    <Input
                      type="text"
                      value={newOverSize.name}
                      onChange={(e) =>
                        setNewOverSize({ ...newOverSize, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>price</Label>
                    <Input
                      type="number"
                      value={overSize.price}
                      onChange={(e) =>
                        setNewOverSize({
                          ...newOverSize,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      type="text"
                      value={overSize.description}
                      onChange={(e) =>
                        setNewOverSize({
                          ...newOverSize,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    await handleAddNew();
                    closeModal();
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>

      <Table>
        <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            {[
              { key: "name", label: "name" },
              { key: "price", label: "Price" },
              { key: "description", label: "Description" },
            ].map(({ key, label }) => (
              <TableCell
                key={key}
                isHeader
                className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleSort(key)}
                >
                  <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">
                    {label}
                  </p>
                  <button className="flex flex-col gap-0.5">
                    <svg
                      className={`text-gray-300 dark:text-gray-700  ${
                        sortKey === key && sortOrder === "asc"
                          ? "text-brand-500"
                          : ""
                      }`}
                      width="8"
                      height="5"
                      viewBox="0 0 8 5"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
                        fill="currentColor"
                      />
                    </svg>
                    <svg
                      className={`text-gray-300 dark:text-gray-700  ${
                        sortKey === key && sortOrder === "desc"
                          ? "text-brand-500"
                          : ""
                      }`}
                      width="8"
                      height="5"
                      viewBox="0 0 8 5"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              </TableCell>
            ))}
            <TableCell
              isHeader
              className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]"
            >
              <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">
                Action
              </p>
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {overSize.map((item, i) => (
            <TableRow key={i + 1}>
              <TableCell className="px-4 py-4 font-medium text-gray-800 border border-gray-100 dark:border-white/[0.05] dark:text-white text-theme-sm whitespace-nowrap ">
                <NavLink to="/quan-ly/shipment-detail">{item.name}</NavLink>
              </TableCell>
              <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-gray-400 whitespace-nowrap ">
                {item.price}
              </TableCell>
              <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-gray-400 whitespace-nowrap ">
                {item.description}
              </TableCell>

              <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap ">
                <div className="flex items-center w-full gap-2">
                  <button
                    className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
                    onClick={async () => {
                      const target = item.id;
                      await DeleteOverSize(item.id);
                      setOverSize(
                        overSize.filter((item) => item.id !== target)
                      );
                    }}
                  >
                    <TrashBinIcon className="size-5" />
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                    onClick={() => handleEditClick(item)}
                  >
                    <PencilIcon className="size-5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal chỉnh sửa */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Chỉnh sửa phí quá khổ
            </h4>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div>
                  <Label>price</Label>
                  <Input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    type="text"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={async (e) => {
                  //   e.preventDefault();
                  const updated = await PutOverSize(editForm);
                  if (updated) {
                    setOverSize((prev) =>
                      prev.map((item) =>
                        item.id === editForm.id ? updated : item
                      )
                    );
                    setEditModalOpen(false);
                  }
                }}
              >
                Cập nhật
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default OverSizeTable;
