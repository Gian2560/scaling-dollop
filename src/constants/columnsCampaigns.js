import ActionButton from "@/app/components/ActionButton";

export const CAMPAIGN_COLUMNS = (onSend, onEdit, onDelete) => [
  { field: "id", headerName: "ID", width: 80 }, 
  { field: "nombre_campanha", headerName: "Nombre", width: 200 },
  { field: "descripcion", headerName: "Descripción", width: 250 },
  { field: "estado_campanha", headerName: "Estado", width: 100 },
  { field: "tipo", headerName: "Tipo", width: 80 },
  { field: "fecha_creacion", headerName: "Fecha creación", width: 200 },
  {
    field: "acciones",
    headerName: "Acciones",
    width: 150,
    renderCell: (params) => (
      <ActionButton
        options={[
          { label: "Editar", action: () => onSend(params.row) },
          { label: "Enviar", action: () => onEdit(params.row.id) },
          { label: "Eliminar", action: () => onDelete(params.row.id) }
        ]}
      />
    ),
  },
];
