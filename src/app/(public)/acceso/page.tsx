import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/session";
import { AuthTabs } from "./AuthTabs";
import { Footer } from "@/components/public/Footer";

export default async function AccesoPage() {
  const customerId = await getCustomerSession();
  if (customerId) redirect("/cuenta");

  return (
    <>
      <AuthTabs />
      <Footer />
    </>
  );
}
