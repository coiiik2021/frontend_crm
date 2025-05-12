import PageBreadcrumb from "../../../components/admin/common/PageBreadCrumb";
import TaskHeader from "../../../components/admin/task/TaskHeader";
import KanbanBoard from "../../../components/admin/task/kanban/KanbanBoard";
import PageMeta from "../../../components/admin/common/PageMeta";

export default function TaskKanban() {
  return (
    <div>
      <PageMeta
        title="React.js Task Kanban Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Task Kanban Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Kanban" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <TaskHeader />
        <KanbanBoard />
      </div>
    </div>
  );
}
