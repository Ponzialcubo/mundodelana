import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/session";
import { AuthTabs } from "./AuthTabs";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";

export default async function AccesoPage() {
  const customerId = await getCustomerSession();
  if (customerId) redirect("/cuenta");

  return (
    <>
      <AuthTabs />
      <FooterWithSettings />
    </>
  );
}
