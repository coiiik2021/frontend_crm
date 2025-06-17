import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { PutConstNet } from "../../../service/api.admin.service.jsx";
import { useLoading } from "../../../hooks/useLoading";
import { Spin } from "antd";

const PriceNetTable = ({ selectedDate, dataByDate, constNet, setConstNet, isPriceNetPackage, setIsPriceNetPackage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(constNet);
  const { loading, withLoading } = useLoading();

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
        setConstNet(editValues);
        await PutConstNet(editValues);
        setIsEditing(false);
      },
      "Cập nhật dữ liệu thành công",
      "Cập nhật dữ liệu thất bại"
    );
  };

  const handleCancel = () => {
    setEditValues(constNet);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditValues({ ...constNet });
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Const Values Display/Edit */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Cấu hình giá Net</h3>

          <div className="flex space-x-2">
            <button
              onClick={() => setIsPriceNetPackage(true)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isPriceNetPackage
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                }`}
            >
              Giá Packages
            </button>
            <button
              onClick={() => setIsPriceNetPackage(false)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!isPriceNetPackage
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                }`}
            >
              Giá Document
            </button>
          </div>
          {isEditing ? (
            <div className="space-x-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm border rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
              >
                Lưu
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-sm border rounded"
            >
              Chỉnh sửa
            </button>
          )}
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Giá Net */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center p-4">
                <div className="w-full flex flex-wrap md:flex-nowrap gap-4">
                  {/* Chỉ số Dim */}
                  <div className="w-full md:w-1/5 flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Chỉ số Dim</span>
                    {isEditing ? (
                      <input
                        id="dim"
                        name="dim"
                        type="number"
                        step="0.01"
                        value={editValues.dim}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-10 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="font-medium">{constNet.dim}</span>
                      </div>
                    )}
                  </div>

                  {/* Chỉ số PPXD */}
                  <div className="w-full md:w-1/5 flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Chỉ số PPXD (%)</span>
                    {isEditing ? (
                      <input
                        id="ppxd"
                        name="ppxd"
                        type="number"
                        step="0.01"
                        value={editValues.ppxd}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-10 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="font-medium">{constNet.ppxd}</span>
                      </div>
                    )}
                  </div>

                  {/* Chỉ số VAT */}
                  <div className="w-full md:w-1/5 flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Chỉ số VAT (%)</span>
                    {isEditing ? (
                      <input
                        id="vat"
                        name="vat"
                        type="number"
                        step="0.01"
                        value={editValues.vat}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-10 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="font-medium">{constNet.vat}</span>
                      </div>
                    )}
                  </div>

                  {/* Chỉ số Oversize */}
                  <div className="w-full md:w-1/5 flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Chỉ số Oversize (%)</span>
                    {isEditing ? (
                      <input
                        id="overSize"
                        name="overSize"
                        type="number"
                        step="0.01"
                        value={editValues.overSize}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-10 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="font-medium">{constNet.overSize}</span>
                      </div>
                    )}
                  </div>

                  {/* Chỉ số Peak Season */}
                  <div className="w-full md:w-1/5 flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Chỉ số Peak Season (%)</span>
                    {isEditing ? (
                      <input
                        id="peakSeason"
                        name="peakSeason"
                        type="number"
                        step="0.01"
                        value={editValues.peakSeason}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-10 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                        <span className="font-medium">{constNet.peakSeason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Table */}
      {dataByDate && Object.keys(dataByDate).length > 0 ? (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg shadow-md">
          <Table className="min-w-full">
            <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-dark-900 sticky left-0 z-10"
                >
                  Weight (kg)
                </TableCell>
                {selectedDate &&
                  dataByDate[selectedDate]?.[0]?.values.map((_, index) => (
                    <TableCell
                      key={index}
                      isHeader
                      className="px-4 py-3 text-xs font-medium border border-gray-100 dark:border-white/[0.05]"
                    >
                      {_.zone}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {selectedDate &&
                dataByDate[selectedDate]?.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-dark-900 sticky left-0 z-10">
                      {row.weight}
                    </TableCell>
                    {row.values.map((val, priceIndex) => (
                      <TableCell
                        key={priceIndex}
                        className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05]"
                      >
                        {val.price.toLocaleString("en-US")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          Chưa có dữ liệu cho ngày này.
        </div>
      )}
    </div>
  );
};

export default PriceNetTable;
