import "./globals.css"; // Importa los estilos globales aquí
import ClientWrapper from "./components/ClientWrapper";

export const metadata = {
  title: "Maqui+",
  description: "Descripción de tu aplicación",
  icons: {
    icon: "https://trasplantecapilar.pe/wp-content/uploads/2024/09/logo-ifc.jpg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
