export function ImagePlaceholder({
  label,
  className = "",
  tone = "warm",
}: {
  label: string;
  className?: string;
  tone?: "warm" | "gray";
}) {
  const bg =
    tone === "warm"
      ? "repeating-linear-gradient(45deg,#EFE5DA 0 9px,#F7F1EA 9px 18px)"
      : "repeating-linear-gradient(45deg,#EDEBE8 0 9px,#F7F6F4 9px 18px)";
  const color = tone === "warm" ? "#A2938A" : "#9A928E";

  return (
    <div
      className={`flex items-end justify-center p-2 text-center ${className}`}
      style={{ background: bg, color, font: "9.5px/1.3 ui-monospace, Menlo, monospace", letterSpacing: ".07em", textTransform: "uppercase" }}
    >
      {label}
    </div>
  );
}
