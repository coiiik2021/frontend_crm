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
import { DeleteConstUser, GetNameServiceByUser, PostConstUser, PutConstUser } from "../../../service/api.admin.service";
import { set } from "date-fns";
import { Delete } from "lucide-react";

export default function UserService({ user }) {
  const [constUsers, setConstUsers] = useState([]);
  const [nameServices, setNameServices] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editConst, setEditConst] = useState(null);

  const [priceNetUserByNameService, setPriceNetUserByNameService] = useState([]);

  const [isOpenPrice, setIsOpenPrice] = useState(false);

  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    const loadData = async () => {
      try {
        const dataBaseUser = await GetConstUser(user?.id);
        const dataNameServiceByUser = await GetNameServiceByUser();

        const dataNameServiceFillter = dataNameServiceByUser.filter((item) => {
          return !dataBaseUser.some((userService) => userService.service_id === item.id);
        });

        console.log("Dữ liệu từ dataBaseUser:", dataBaseUser);
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
    };

    console.log("Request Payload:", newConstRequest); // Kiểm tra payload

    const dataResponse = await PostConstUser(newConstRequest);
    setConstUsers((prev) => [...prev, dataResponse]); // Cập nhật danh sách
    closeModal();
  };

  const handleSetupPriceNetUser = async () => {
    setIsOpenPrice(true);
    // call api set data
    console.log("priceNetUserByNameService", priceNetUserByNameService);
  }

  const handleCreatePriceNetUser = async () => {



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
    setEditModalOpen(true); // Mở modal chỉnh sửa
  };

  const handleSaveEdit = async () => {

    const updatedConst = {
      ...editConst,
      account_id: user.id
    }
    console.log(updatedConst);
    await PutConstUser(updatedConst);

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
  });

  const handlePrice = (row) => {
    setPriceNetUserByNameService(row);
    setIsOpenPrice(true);
  }

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
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                      {constUsers.length > 0 ? (
                        constUsers.map((row, index) => (
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
                            <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEdit(row)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-500"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(row.service_id)}
                                className="inline-flex items-center px-3 py-1.5 ml-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                              >
                                Delete
                              </button>

                              <button
                                onClick={() => handlePrice(row)}
                                className="inline-flex items-center px-3 py-1.5 ml-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                              >
                                Giá
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
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

      <Modal isOpen={isOpenPrice} onClose={() => setIsOpenPrice(false)} className="max-w-[700px] m-4">
        <div className="w-full p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="w-full flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="w-full">
              <h4 className="w-full text-2xl font-semibold text-gray-800 dark:text-white/90 lg:mb-8">
                Khoảng giá ( {priceNetUserByNameService?.nameService} )
              </h4>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    const newPriceNetUser = {
                      nameService: priceNetUserByNameService?.nameService,
                      kgMin: 0,
                      kgMax: 0,
                      Zone: 0,
                      price: 100,
                    }

                    setPriceNetUserByNameService({
                      ...priceNetUserByNameService,
                    });
                  }
                  }
                  className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
                >
                  Thêm
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
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHeader>

                      <TableBody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                        {constUsers.length > 0 ? (
                          constUsers.map((row, index) => (
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
                              <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(row)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-500"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(row.service_id)}
                                  className="inline-flex items-center px-3 py-1.5 ml-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                                >
                                  Delete
                                </button>

                                <button
                                  onClick={() => handlePrice(row)}
                                  className="inline-flex items-center px-3 py-1.5 ml-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                                >
                                  Giá
                                </button>
                              </TableCell>
                            </TableRow>
                          ))
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
    </>
  );
}
