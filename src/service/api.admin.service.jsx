import axios from "./axios.admin.customize";

// price net
const GetPriceNet = async (nameCompany, nameService) => {
    const API = `/prices?nameCompany=${nameCompany}&nameService=${nameService}`;
    return await axios.get(API);
};

const PostPriceNet = async (nameHang, nameService, data) => {
    const API = `/prices?nameCompany=${nameHang}&nameService=${nameService}`;
    data = {
        data: data,
    }
    return await axios.post(API, data);
};

// country
const GetZoneCountry = async () => {
    const API = `/zone-country/all`;
    return await axios.get(API);
}

const PostZoneCountry = async (data) => {
    const API = `zone-country`;
    data = {
        data: data,
    }
    console.log("data", data);
    return await axios.post(API, data);
}

const GetAZoneCountry = async (name) => {
    const API = `zone-country?name=${name}`;
    return await axios.get(API);
}

// service

const GetNameService = async (name) => {
    const API = `service-company?name=${name}`;
    return await axios.get(API);
}

const PostNameService = async (data) => {
    const API = `service-company`;

    return await axios.post(API, data);
}

const UpdateNameService = async (data) => {
    const API = `service-company`;
    return await axios.put(API, data);
}

const DeleteServiceCompany = async (nameService) => {
    const API = `service-company?name=${nameService}`;
    return await axios.delete(API);
}

const GetAllServiceCompany = async () => {
    const API = `service-company/all`;
    return await axios.get(API);
}


export { GetAllServiceCompany, GetNameService, PostNameService, UpdateNameService, DeleteServiceCompany };

const GetAPriceNet = async (name, zone, weight) => {
    const API = `/prices/getPriceNet?name=${name}&weight=${weight}&zone=${zone}`;
    console.log("API", API);
    return await axios.get(API);
};


// price gas Oline
const GetPriceAllGasoline = async (name) => {
    const API = `price-gas-oline?name=${name}`;
    return await axios.get(API);
}
const GetAllPriceGasoline = async () => {
    const API = `price-gas-oline/all`;
    return await axios.get(API);
}

const PostPriceGasoline = async (data) => {
    const API = `price-gas-oline`;
    return await axios.post(API, data);
}

const PutPriceGasoline = async (data) => {
    const API = `price-gas-oline`;
    return await axios.put(API, data);
}

const DeletePriceGasonline = async (id) => {
    const API = `price-gas-oline/${id}`;
    return await axios.delete(API);
}

export { PutPriceGasoline, GetAllPriceGasoline };


// const net 

const GetConstNet = async (name) => {
    const API = `const-net?name=${name}`;
    return await axios.get(API);
}

const PutConstNet = async (data) => {
    const API = `const-net`;
    return await axios.put(API, data);
}

const PostConstNet = async (data) => {
    const API = `const-net`;
    return await axios.post(API, data);
}

const GetAllConstNet = async () => {
    const API = `const-net/all`;
    return await axios.get(API);
}

// price a quote
const GetListPriceQuote = async (data) => {
    const API = "price";
    return await axios.post(API, data);
}

export { GetListPriceQuote };


// ovserSize

const GetOverSizeByName = async (nameCompany) => {
    const API = `over-size/all?nameCompany=${nameCompany}`;
    return await axios.get(API);
}

const PostOverSize = async (data) => {
    const API = `over-size`;
    return await axios.post(API, data);
}

const PutOverSize = async (data) => {
    const API = `over-size`;
    return await axios.put(API, data);
}

const DeleteOverSize = async (id) => {
    const API = `over-size/${id}`;
    return await axios.delete(API);
}

// account - base_user

const PostBaseUser = async (data) => {
    console.log("data", data);
    const API = `base_user`;
    return await axios.post(API, data);
}



const GetAllBaseUser = async (nameRole) => {
    const API = `base_user/${nameRole}`;
    return await axios.get(API);
}
const PutBaseUser = async (data) => {
    const API = `base_user`;
    return await axios.put(API, data);
}

export { PostBaseUser, GetAllBaseUser, PutBaseUser };



export { GetOverSizeByName, PostOverSize, PutOverSize, DeleteOverSize };


export { GetPriceNet, PostPriceNet, PostZoneCountry, GetZoneCountry, GetAZoneCountry, GetAPriceNet, GetPriceAllGasoline, PostPriceGasoline, DeletePriceGasonline };

export { GetAllConstNet, GetConstNet, PutConstNet, PostConstNet };

