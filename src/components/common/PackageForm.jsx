import React from "react";

export default function PackageForm({
    packages, errors, handleChange, addPackage, removePackage, fields, getLabel
}) {
    return (
        <div className="space-y-6">
            {packages.map((pkg, idx) => (
                <div
                    key={pkg.id}
                    className="bg-white rounded-lg shadow border p-4 mb-2"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-blue-700">
                            Kiện {idx + 1}/{packages.length}
                        </div>
                        <button
                            type="button"
                            onClick={() => removePackage(pkg.id)}
                            className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded transition"
                        >
                            Xóa
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {fields.map(field => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {getLabel ? getLabel(field) : field.toUpperCase()}
                                </label>
                                <input
                                    type="number"
                                    value={pkg[field]}
                                    onChange={e => handleChange(pkg.id, field, e.target.value)}
                                    disabled={field === "dim"}
                                    className={`w-full border rounded px-3 py-2 text-sm transition-all duration-200 ${errors[`${pkg.id}-${field}`]
                                        ? "border-red-500"
                                        : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                        } ${field === "dim" ? "bg-gray-100" : "bg-white"}`}
                                    placeholder="0"
                                />
                                {errors[`${pkg.id}-${field}`] && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors[`${pkg.id}-${field}`]}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={addPackage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                >
                    + Thêm kiện
                </button>
            </div>
        </div>
    );
}
