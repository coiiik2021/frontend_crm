import axios from "./axios.admin.customize";

const token = localStorage.getItem("token");

// price net
const GetPriceNet = async (nameCompany, nameService) => {
  const API = `/prices?nameCompany=${nameCompany}&nameService=${nameService}`;
  return await axios.get(API);
};

const PostPriceNet = async (nameHang, nameService, data) => {
  const API = `/prices?nameCompany=${nameHang}&nameService=${nameService}`;
  data = {
    data: data,
  };
  return await axios.post(API, data);
};

// country
const GetZoneCountry = async () => {
  const API = `/zone-country/all`;
  return await axios.get(API);
};

const PostZoneCountry = async (data) => {
  const API = `zone-country`;
  data = {
    data: data,
  };
  console.log("data", data);
  return await axios.post(API, data);
};

const GetAZoneCountry = async (name) => {
  const API = `zone-country?name=${name}`;
  return await axios.get(API);
};

const GetAllByServiceCompany = async (id) => {
  const API = `zone-country/${id}`;
  return await axios.get(API);
};

// service

const GetNameService = async (name) => {
  const API = `service-company?name=${name}`;
  return await axios.get(API);
};

const GetNameServiceByUser = async (isAdmin) => {
  const API = isAdmin
    ? `service-company/allByUser`
    : `service-company/allByManager`;
  return await axios.get(API);
};

const PostNameService = async (data) => {
  const API = `service-company`;

  return await axios.post(API, data);
};

const UpdateNameService = async (data) => {
  const API = `service-company`;
  return await axios.put(API, data);
};

const DeleteServiceCompany = async (nameService) => {
  const API = `service-company?name=${nameService}`;
  return await axios.delete(API);
};

const GetAllServiceCompany = async () => {
  const API = `service-company/all`;
  return await axios.get(API);
};

export {
  GetAllServiceCompany,
  GetNameService,
  PostNameService,
  UpdateNameService,
  DeleteServiceCompany,
  GetNameServiceByUser,
};

const GetAPriceNet = async (name, zone, weight) => {
  const API = `/prices/getPriceNet?name=${name}&weight=${weight}&zone=${zone}`;
  console.log("API", API);
  return await axios.get(API);
};

// price gas Oline
const GetPriceAllGasoline = async (name) => {
  const API = `price-gas-oline?name=${name}`;
  return await axios.get(API);
};
const GetAllPriceGasoline = async () => {
  const API = `price-gas-oline/all`;
  return await axios.get(API);
};

const PostPriceGasoline = async (data) => {
  const API = `price-gas-oline`;
  return await axios.post(API, data);
};

const PutPriceGasoline = async (data) => {
  const API = `price-gas-oline`;
  return await axios.put(API, data);
};

const DeletePriceGasonline = async (id) => {
  const API = `price-gas-oline/${id}`;
  return await axios.delete(API);
};

export { PutPriceGasoline, GetAllPriceGasoline };

// const net

const GetConstNet = async (name) => {
  const API = `const-net?name=${name}`;
  return await axios.get(API);
};

const PutConstNet = async (data) => {
  const API = `const-net`;
  return await axios.put(API, data);
};

const PostConstNet = async (data) => {
  const API = `const-net`;
  return await axios.post(API, data);
};

const GetAllConstNet = async () => {
  const API = `const-net/all`;
  return await axios.get(API);
};

// price a quote
const GetListPriceQuote = async (data) => {
  const API = "price";
  return await axios.post(API, data);
};

export { GetListPriceQuote };

// overSize

const GetOverSizeByName = async (nameCompany) => {
  const API = `over-size/all?nameCompany=${nameCompany}`;
  return await axios.get(API);
};

const PostOverSize = async (data) => {
  const API = `over-size`;
  return await axios.post(API, data);
};

const PutOverSize = async (data) => {
  const API = `over-size`;
  return await axios.put(API, data);
};

const DeleteOverSize = async (id) => {
  const API = `over-size/${id}`;
  return await axios.delete(API);
};

// account - base_user

const PostBaseUser = async (data) => {
  const API = `base_user`;
  return await axios.post(API, data);
};

const GetAllBaseUser = async (nameRole) => {
  const API = `base_user/${nameRole}`;
  return await axios.get(API);
};
const PutBaseUser = async (data) => {
  const API = `base_user/update`;
  return await axios.put(API, data);
};

const GetUserOfManager = async (manager_id) => {
  const API = `base_user/userOfManager/${manager_id}`;
  return await axios.get(API);
};

const GetConstUser = async (user_id) => {
  const API = `const_user/${user_id}`;
  return await axios.get(API);
};

export {
  PostBaseUser,
  GetAllBaseUser,
  PutBaseUser,
  GetConstUser,
  GetUserOfManager,
};

//const_user

// bill
const GetAllBill = async () => {
  const API = `bill/all`;
  return await axios.get(API);
};

const CreateBill = async (data) => {
  const API = `bill/create`;
  return await axios.post(API, data);
};

const UpdateBillCS = async (data) => {
  const API = `bill/cs`;
  console.log("data", data);
  return await axios.put(API, data);
};

const UpdateBillAccountant = async (data) => {
  const API = `bill/accountant`;
  console.log("data", data);
  return await axios.put(API, data);
};

const UpdateBillTRANSPORTER = async (data) => {
  const API = `bill/transporter`;
  console.log("data/", data);
  return await axios.put(API, data);
};

// const user
const GetConstsByUser = async (user_id) => {
  const API = `const_user/${user_id}`;
  return await axios.get(API);
};

const PostConstUser = async (data) => {
  const API = `const_user`;
  return await axios.post(API, data);
};

const PutConstUser = async (data) => {
  const API = `const_user/update`;
  return await axios.put(API, data);
};

const DeleteConstUser = async (data) => {
  const API = `const_user/delete`;
  return await axios.post(API, data);
};
export { GetConstsByUser, PostConstUser, PutConstUser, DeleteConstUser };

// price net user by zone and weight

const PostPriceNetUserByWeightAndZone = async (data) => {
  const API = "price-user-weight-zone";
  return await axios.post(API, data);
};

const DeletePriceNetUserByWeightAndZone = async (id) => {
  const API = `price-user-weight-zone/${id}`;
  return await axios.delete(API);
};

const GetAllPriceNetForUserByZoneAndWeight = async (data) => {
  const API = "price-user-weight-zone/getPriceUserOfServiceCompany";
  return await axios.post(API, data);
};

// invoice
const GetInvoiceById = async (id) => {
  const API = `invoice/${id}`;
  return await axios.get(API);
};
const GetInvoicePdf = async () => {
  const API = "invoice/export-pdf";
  return await instance.get(API, {
    responseType: "blob",
    transformResponse: [(data) => data], // bỏ qua interceptor JSON
  });
};

export { GetInvoiceById, GetInvoicePdf };

// favorite

const GetAllConsigneeFavorite = async () => {
  const API = `consignee-favorite`;
  return await axios.get(API);
};

const PostConsigneeFavorite = async (data) => {
  const API = `consignee-favorite`;
  return await axios.post(API, data);
};

const DeleteConsigneeFavorite = async (id) => {
  const API = `consignee-favorite/${id}`;
  return await axios.delete(API);
};

export {
  GetAllConsigneeFavorite,
  PostConsigneeFavorite,
  DeleteConsigneeFavorite,
};

// price order

const GetAllPriceOrder = async (id) => {
  const API = `price-order/${id}`;
  return await axios.get(API);
};

const PostPriceOrder = async (data) => {
  const API = `price-order`;
  return await axios.post(API, data);
};

const PutPriceOrder = async (id) => {
  const API = `price-order/${id}`;
  return await axios.put(API);
};
const DeletePriceOrder = async (id) => {
  const API = `price-order/${id}`;
  return await axios.delete(API);
};

export { GetAllPriceOrder, PostPriceOrder, PutPriceOrder, DeletePriceOrder };

export {
  GetAllBill,
  CreateBill,
  UpdateBillTRANSPORTER,
  UpdateBillCS,
  UpdateBillAccountant,
};

export { GetOverSizeByName, PostOverSize, PutOverSize, DeleteOverSize };

export {
  GetPriceNet,
  PostPriceNet,
  PostZoneCountry,
  GetZoneCountry,
  GetAZoneCountry,
  GetAllByServiceCompany,
  GetAPriceNet,
  GetPriceAllGasoline,
  PostPriceGasoline,
  DeletePriceGasonline,
  PostPriceNetUserByWeightAndZone,
  GetAllPriceNetForUserByZoneAndWeight,
  DeletePriceNetUserByWeightAndZone,
};

export { GetAllConstNet, GetConstNet, PutConstNet, PostConstNet };

// API để lấy tất cả các quyền hạn có thể có
const GetAllPermissions = async (id) => {
  const API = `permission/full_permission_role/${id}`;
  return await axios.get(API);
};

// API để lấy những quyền hạn mà một user cụ thể đã được cấp
const GetUserPermissions = async (userId) => {
  const API = `permission/${userId}`;
  return await axios.get(API);
};

// API để cập nhật quyền người dùng
const UpdateUserPermissions = async (data) => {
  const API = `permission/update`;
  return await axios.put(API, data);
};

// API để lấy thông tin thanh toán của một hóa đơn
const GetPaymentDetails = async (billId) => {
  const API = `payment/${billId}`;
  return await axios.get(API);
};

// API để cập nhật thông tin thanh toán của một hóa đơn
const UpdatePaymentDetails = async (data) => {
  const API = `payment`;
  return await axios.put(API, data);
};

export {
  GetAllPermissions,
  GetUserPermissions,
  UpdateUserPermissions,
  GetPaymentDetails,
  UpdatePaymentDetails,
};
