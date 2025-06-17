import { useEffect, useState } from "react";
import { MoreDotIcon } from "../../../icons";
import { Dropdown } from "../../admin/ui/dropdown/Dropdown";
import { DropdownItem } from "../../admin/ui/dropdown/DropdownItem";
import CountryMap from "../../client/ecommerce/CountryMap";
import countries from "world-countries";
import { GetAnalyticsCountry } from "../../../service/api.admin.service";

interface CountryData {
  nameCountry: string;
  totalDebit: number;
  totalBill: number;
  percentage: number;
}

interface CountryDataWithLatLng extends CountryData {
  latLng: [number, number];
}

function getLatLngByCountryName(name: string): [number, number] | null {
  const lowerName = name.toLowerCase();
  const match = name.match(/\(([^)]+)\)/);
  const code = match ? match[1].toUpperCase() : "";
  const country = countries.find(
    c =>
      c.cca2.toUpperCase() === code ||
      c.name.common.toLowerCase() === lowerName
  );
  return country ? (country.latlng as [number, number]) : null;
}

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [countryData, setCountryData] = useState<CountryDataWithLatLng[]>([]);

  useEffect(() => {
    GetAnalyticsCountry()
      .then((res: any) => {
        // Nếu API trả về AxiosResponse, dùng res.data, nếu trả về mảng thì dùng res
        const data = res;
        const dataWithLatLng = (data || []).map((item: CountryData) => ({
          ...item,
          latLng: getLatLngByCountryName(item.nameCountry) || [0, 0],
        }));
        setCountryData(dataWithLatLng);
      })
      .catch(() => setCountryData([]));
  }, []);

  console.log("Country Data with LatLng:", countryData);



  // console.log("Country Data:", countryData);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Thống kê khu vực nước đến
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Số lượng đơn hàng theo khu vực nước đến
          </p>
        </div>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl dark:border-gray-800 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          {countryData.length === 0 ? (
            <div>Loading map data...</div>
          ) : (
            <CountryMap countries={countryData} />
          )}
        </div>
      </div>

      <div className="space-y-5">
        {countryData.map((country, idx) => (
          <div className="flex items-center justify-between" key={country.nameCountry}>
            <div className="flex items-center gap-3">
              <div>
                <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                  {country.nameCountry}
                </p>
                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                  {country.totalBill} đơn
                </span>
              </div>
            </div>

            <div className="flex w-full max-w-[140px] items-center gap-3">
              <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                <div
                  className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                  style={{ width: `${country.percentage}%` }}
                ></div>
              </div>
              <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {Math.round(country.percentage)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
