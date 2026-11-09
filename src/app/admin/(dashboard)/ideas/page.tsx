import { redirect } from "next/navigation";

// Ideas became the assistant: the owner asks for changes there and they get done. Old links land on it.
export default function AdminIdeasPage() {
  redirect("/admin/asistente");
}
