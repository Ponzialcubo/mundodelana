import { getCustomerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/public/ProfileForm";
import { NewsletterToggle } from "@/components/public/NewsletterToggle";
import { LogoutButton } from "@/components/public/LogoutButton";

export const metadata = { title: "Mis datos", robots: { index: false } };

export default async function DatosPage() {
  const customerId = (await getCustomerSession())!;
  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: customerId } });

  return (
    <div className="flex max-w-xl flex-col gap-5 pt-6 md:pt-0">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-[28px] font-normal md:text-[34px]">Mis datos</h1>
        <p className="text-[14px] text-ink/60">{customer.email}</p>
      </div>
      <ProfileForm initialName={customer.name} initialPhone={customer.phone ?? ""} hasPassword={Boolean(customer.passwordHash)} />
      <NewsletterToggle initialActive={customer.newsletterOptIn} />
      <div className="md:hidden">
        <LogoutButton />
      </div>
    </div>
  );
}
