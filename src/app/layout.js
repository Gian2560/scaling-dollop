import "./globals.css"; // Importa los estilos globales aquí
import ClientWrapper from "./components/ClientWrapper";

export const metadata = {
  title: "Maqui+",
  description: "Descripción de tu aplicación",
  icons: {
    icon: "https://maquimas.pe/wp-content/themes/maquisistema/img/common/maquiplus-logo.png"
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
