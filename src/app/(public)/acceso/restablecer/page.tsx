import Link from "next/link";
import { RestablecerForm } from "./RestablecerForm";
import { FooterWithSettings } from "@/components/public/FooterWithSettings";

export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-14 text-center md:px-0">
          <h1 className="font-serif text-[26px] font-normal">Enlace incompleto</h1>
          <p className="text-[14px] font-light text-ink/75">
            Este enlace no es válido. Pide uno nuevo desde el correo de recuperación.
          </p>
          <Link href="/acceso/recuperar" className="text-sm font-medium text-pink-deep underline">
            Pedir enlace nuevo
          </Link>
        </div>
        <FooterWithSettings />
      </>
    );
  }

  return (
    <>
      <RestablecerForm token={token} />
      <FooterWithSettings />
    </>
  );
}
