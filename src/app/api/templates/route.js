import { NextResponse } from "next/server";
import client from "@/lib/twilio";

export async function GET() {
    try {
        // 🔹 Obtener los templates de Twilio desde la API v1
        const templates = await client.messaging.v1.templates.list();

        // 🔹 Formatear datos antes de enviarlos al frontend
        const formattedTemplates = templates.map(template => ({
            id: template.sid,
            nombre_template: template.friendlyName,
            category: template.category,
        }));

        return NextResponse.json(formattedTemplates);
    } catch (error) {
        console.error("Error al obtener templates:", error);
        return NextResponse.json({ error: "Error al obtener templates" }, { status: 500 });
    }
}
