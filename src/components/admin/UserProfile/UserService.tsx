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
type UserMetaCardProps = {
  user: any;
};
export default function UserService({ user }: UserMetaCardProps) {
  const [constUsers, setConstUsers] = useState<any[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  useEffect(() => {
    const loadData = async () => {
      const dataBaseUser = await GetConstUser(user?.id);
      setConstUsers(dataBaseUser);
    };
    loadData();
  }, []);
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  return (
    <>
      <div className="w-full p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="w-full flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            <h4 className="w-full text-2xl font-semibold text-gray-800 dark:text-white/90 lg:mb-8">
              Service Information
            </h4>
            <Button
              onClick={openModal}
            >
              Thêm dịch vụ
            </Button>

            <div className="w-full overflow-x-auto custom-scrollbar">
              <div className="w-full max-w-full mx-auto border border-gray-300 rounded-lg shadow-lg bg-white dark:bg-dark-900">
                <Table className="w-full min-w-[900px] text-base table-auto">
                  <TableHeader className="border-t border-gray-200 dark:border-white/[0.1]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="
          sticky left-0 z-10 px-8 py-4 text-sm font-semibold bg-white border border-gray-200
          dark:bg-dark-900 dark:border-white/[0.1] text-center align-middle
        "
                      >
                        Service Name
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-8 py-4 text-sm font-semibold border border-gray-200 dark:border-white/[0.1] text-center align-middle"
                      >
                        Dim
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-8 py-4 text-sm font-semibold border border-gray-200 dark:border-white/[0.1] text-center align-middle"
                      >
                        PPXD
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-8 py-4 text-sm font-semibold border border-gray-200 dark:border-white/[0.1] text-center align-middle"
                      >
                        VAT
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-8 py-4 text-sm font-semibold border border-gray-200 dark:border-white/[0.1] text-center align-middle"
                      >
                        OverSize
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {constUsers.length > 0 ? (
                      constUsers.map((row: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell
                            className="
              sticky left-0 z-10 px-8 py-4 text-sm border border-gray-200 bg-white
              dark:bg-dark-900 dark:border-white/[0.1] text-center align-middle
            "
                          >
                            {row.nameService}
                          </TableCell>

                          <TableCell className="px-8 py-4 text-sm border border-gray-200 dark:border-white/[0.1] text-center align-middle">
                            {row.dim}
                          </TableCell>

                          <TableCell className="px-8 py-4 text-sm border border-gray-200 dark:border-white/[0.1] text-center align-middle">
                            {row.ppxd}
                          </TableCell>

                          <TableCell className="px-8 py-4 text-sm border border-gray-200 dark:border-white/[0.1] text-center align-middle">
                            {row.vat}
                          </TableCell>

                          <TableCell className="px-8 py-4 text-sm border border-gray-200 dark:border-white/[0.1] text-center align-middle">
                            {row.overSize}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="px-8 py-4 text-center text-sm text-gray-500">
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

        {/* <button
          onClick={openModal}
          className=" flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button> */}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Service
            </h4>

          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
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
                  <Input type="text" value="Arizona, United States." />
                </div>

                <div>
                  <Label>Postal Code</Label>
                  <Input type="text" value="ERT 2489" />
                </div>

                <div>
                  <Label>TAX ID</Label>
                  <Input type="text" value="AS4568384" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
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
