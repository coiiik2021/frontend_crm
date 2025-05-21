import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { PutConstNet } from "../../../service/api.admin.service.jsx";

const PriceNetTable = ({ selectedDate, dataByDate, constNet, setConstNet }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(constNet);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setConstNet(editValues);
    console.log("editValues", editValues);

    await PutConstNet(editValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues(constNet);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditValues({ ...constNet });
    setIsEditing(true);
  };

  return (
    <div className="space-y-4">
      {/* Const Values Display/Edit */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Cấu hình giá Net</h3>
          {isEditing ? (
            <div className="space-x-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm border rounded"
              >
                Hủy
              </button>
              <button
                onClick={async () => handleSave()}
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Chỉ số Dim</label>
            {isEditing ? (
              <input
                name="dim"
                type="number"
                step="0.01"
                value={editValues.dim}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded">{constNet.dim}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Chỉ số PPXD
            </label>
            {isEditing ? (
              <input
                name="ppxd"
                type="number"
                step="0.01"
                value={editValues.ppxd}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded">{constNet.ppxd} %</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Chỉ số VAT</label>
            {isEditing ? (
              <input
                name="vat"
                type="number"
                step="0.01"
                value={editValues.vat}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded">{constNet.vat} %</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Chỉ số Oversize
            </label>
            {isEditing ? (
              <input
                name="overSize"
                type="number"
                step="0.01"
                value={editValues.overSize}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded">
                {constNet.overSize} %
              </div>
            )}
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
