import { useEffect, useState } from "react";
import PageBreadcrumb from "../common/PageBreadCrumb.js";
import ComponentCard from "../common/ComponentCard.js";
import ContentTable from "./ContentTable.jsx";
import { GetAllBaseUser } from "../../../service/api.admin.service.jsx";

export default function BDTable() {
  const [businessDeveloper, setBusinessDeveloper] = useState([]);

  useEffect(() => {
    const fetchManagers = async () => {
      const dataBD = await GetAllBaseUser("bd");
      setBusinessDeveloper(dataBD);
    };
    fetchManagers();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Tables Business Developer" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Business Developer">
          <ContentTable users={businessDeveloper} setUsers={setBusinessDeveloper} />
        </ComponentCard>
      </div>
    </>
  );
}
