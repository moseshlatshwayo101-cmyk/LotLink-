import { redirect } from "next/navigation";

/** Admin UI is a static shell under public/admin/index.html */
export default function AdminPage() {
  redirect("/admin/index.html");
}
