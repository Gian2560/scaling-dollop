import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login'); // Redirige al login si no hay sesión
  }
  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Bienvenido a Maqui+</h1>

      {session ? (
        <div className="text-center">
          <p className="mb-4">
            Estás logueado como <span className="font-semibold">{session.user.name || session.user.email}</span>.
          </p>
          <Link 
            href="/dashboard" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Ir al Dashboard
          </Link>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p>No estás logueado.</p>
          <div className="space-x-4">
            <Link 
              href="/login" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Iniciar sesión
            </Link>
            <Link 
              href="/register" 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
