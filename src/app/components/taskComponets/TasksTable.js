import React from 'react';
import { isGestionadoMesActual } from '../../../constants/taskColumns';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination
} from '@mui/material';

export default function TasksTable({ 
  data, 
  columns, 
  pagination, 
  onChangePage, 
  onChangeRowsPerPage, 
  page, 
  rowsPerPage,
  selectedEstado
}) {
  return (
    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#007391' }}>
              {columns.map((column) => (
                <TableCell 
                  key={column.field}
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    minWidth: column.minWidth || 'auto'
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const highlight = isGestionadoMesActual(row, selectedEstado);
              return (
                <TableRow 
                  key={row.id || index} 
                  hover
                  sx={{ bgcolor: highlight ? '#9bfab0ff' : 'transparent' }}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={`${row.id || index}-${column.field}`}
                      sx={{ 
                        minWidth: column.minWidth || 'auto',
                        flex: column.flex || 'none'
                      }}
                    >
                      {column.renderCell 
                        ? column.renderCell(row[column.field], row, index)
                        : row[column.field]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={pagination?.totalItems || 0}
        page={page}
        onPageChange={onChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          bgcolor: '#f8f9fa',
          borderTop: '1px solid #dee2e6',
          '& .MuiTablePagination-toolbar': {
            color: '#254e59'
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontWeight: 600
          }
        }}
      />
    </Paper>
  );
}