import ComponentCard from "../common/ComponentCard";
import PageBreadcrumb from "../common/PageBreadCrumb";
import ContentTable from "./ContentTable.jsx";
import { useEffect, useState } from "react";
import { GetAllBaseUser } from "../../../service/api.admin.service.jsx";

export default function UserTable() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const dataBaseUser = await GetAllBaseUser("user");
      console.log(dataBaseUser);
      setUsers(dataBaseUser);
    };
    loadData();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Tables User" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="User">
          <ContentTable users={users} setUsers={setUsers} />
        </ComponentCard>
      </div>
    </>
  );
}
