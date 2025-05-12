import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

const PriceNetTable = ({ selectedDate, dataByDate }) => {
    return (
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

                {/* Table Body */}
                <TableBody>
                    {selectedDate &&
                        dataByDate[selectedDate]?.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                <TableCell
                                    className="px-4 py-3 text-xs border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-dark-900 sticky left-0 z-10"
                                >
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
    );
};

export default PriceNetTable;