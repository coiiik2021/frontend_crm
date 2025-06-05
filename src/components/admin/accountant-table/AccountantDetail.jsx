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
import { GetConstUser } from "../../../service/api.admin.service.jsx";
import Select from "../form/Select";



export default function AccountantService({ user }) {
  const [constUsers, setConstUsers] = useState([]);
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    const loadData = async () => {
      const dataBaseUser = await GetConstUser(user?.id);
      setConstUsers(dataBaseUser);
    };
    loadData();
  }, [user?.id]);

  const handleSave = () => {
    console.log("Saving changes...");
    closeModal();
  };

  return (
    <>
      <div className="w-full p-6 border border-gray-200 rounded-2xl dark:border-gray-800 bg-white dark:bg-dark-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Service Information
            </h4>
            <Button onClick={openModal} className="mt-4">
              Thêm dịch vụ
            </Button>

            <div className="w-full overflow-x-auto custom-scrollbar mt-6">
              <div className="w-full border border-gray-300 rounded-lg shadow-lg bg-white dark:bg-dark-900">
                <Table className="w-full min-w-[900px] text-sm table-auto">
                  <TableHeader className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="sticky left-0 z-10 px-6 py-3 text-sm font-semibold bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center"
                      >
                        Service Name
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 text-sm font-semibold border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center"
                      >
                        Dim
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 text-sm font-semibold border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center"
                      >
                        PPXD
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 text-sm font-semibold border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center"
                      >
                        VAT
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 text-center"
                      >
                        OverSize
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {constUsers.length > 0 ? (
                      constUsers.map((row, index) => (
                        <TableRow
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <TableCell
                            className="sticky left-0 z-10 px-6 py-3 text-sm border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-900 text-gray-800 dark:text-gray-300 text-center"
                          >
                            {row.nameService}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300 text-center">
                            {row.dim}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300 text-center">
                            {row.ppxd}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300 text-center">
                            {row.vat}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm text-gray-800 dark:text-gray-300 text-center">
                            {row.overSize}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="px-6 py-3 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          Không tìm thấy kết quả phù hợp.
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

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-6 bg-white rounded-3xl dark:bg-gray-900 shadow-lg">
          <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
            Add Service
          </h4>
          <form className="flex flex-col space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <Label>Service</Label>
                <Select
                  options={[
                    { value: "1", label: "Service 1" },
                    { value: "2", label: "Service 2" },
                    { value: "3", label: "Service 3" },
                  ]}
                  onChange={(selectedOption) => console.log(selectedOption)}
                />
              </div>
              <div>
                <Label>DIM</Label>
                <Input type="text" placeholder="Enter DIM" />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input type="text" placeholder="Enter Postal Code" />
              </div>
              <div>
                <Label>TAX ID</Label>
                <Input type="text" placeholder="Enter TAX ID" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}