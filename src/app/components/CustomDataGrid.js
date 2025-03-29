"use client";
import { DataGrid } from "@mui/x-data-grid";

export default function CustomDataGrid({ rows, columns, totalRows, pagination, setPagination, sortModel, setSortModel }) {
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <DataGrid
        rows={rows}
        columns={columns}
        pagination
        paginationMode="server"
        rowCount={totalRows}
        pageSizeOptions={[5, 10, 20, 50]} // 🔹 Opciones de filas por página
        paginationModel={{
          page: pagination.page - 1, // 🔹 DataGrid usa base 0
          pageSize: pagination.pageSize,
        }}
        onPaginationModelChange={({ page, pageSize }) => {
          setPagination((prev) => ({ ...prev, page: page + 1, pageSize })); // 🔹 Reactualiza el estado de paginación
        }}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        autoHeight
        getRowHeight={(params) => {
          // Esto permite que el alto de la fila se ajuste según el contenido
          return 'auto'; // O puedes calcular una altura basada en el contenido
        }}
        sx={{
          '--DataGrid-containerBackground': '#007391',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'var(--DataGrid-containerBackground)',
            color: '#ffffff',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '1rem',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f0fdfa',
          },
          '& .MuiDataGrid-cell': {
  paddingTop: '15px',
  paddingBottom: '12px',
},
        }}
      />
    </div>
  );
}
