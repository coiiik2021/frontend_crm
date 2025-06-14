import { useEffect, useState } from "react";
import PageBreadcrumb from "../common/PageBreadCrumb.js";
import ComponentCard from "../common/ComponentCard.js";
import ContentTable from "./ContentTable.jsx";
import { GetAllBaseUser } from "../../../service/api.admin.service.jsx";

export default function ManagerTable() {
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const fetchManagers = async () => {
      const dataBaseManager = await GetAllBaseUser("manager");
      setManagers(dataBaseManager);
    };
    fetchManagers();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Tables Manager" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Manager">
          <ContentTable users={managers} setUsers={setManagers} />
        </ComponentCard>
      </div>
    </>
  );
}
