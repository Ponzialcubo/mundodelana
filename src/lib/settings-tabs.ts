// Tabs of the settings page. Lives outside the "use client" form so the server page can read it
// (a constant imported from a client module reaches the server as a reference, not as the array).
export const SETTINGS_TABS = [
  { key: "contacto", label: "Contacto y horario", hint: "Teléfono, email, horario y redes. Salen en Contacto, en el pie de la web y en el botón de WhatsApp." },
  { key: "preguntas", label: "Preguntas frecuentes", hint: "Salen en la página de preguntas frecuentes y en «Cómo funciona»." },
  { key: "opiniones", label: "Opiniones", hint: "Lo que dicen tus clientas. Las tres primeras visibles salen en inicio y en «Cómo funciona»." },
  { key: "google", label: "Google", hint: "Cómo aparece la web en los resultados de Google." },
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number]["key"];
