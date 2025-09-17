import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Box,
    Alert,
    Chip
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const ActionComercialModal = ({ open, onClose, cliente, gestores, onSave }) => {
    const [clienteData, setClienteData] = useState({
        nombre: "",
        email: "",
        telefono: "",
        gestor: "",
        observaciones: "",
        accion: "",
        estado: "",
        motivo: "",
        fechaPromesaPago: null,
    });

    const [estadoEditable, setEstadoEditable] = useState(true);
    const [mostrarFechaPromesa, setMostrarFechaPromesa] = useState(false);
    const [errors, setErrors] = useState([]);

    // Validar formulario
    const validateForm = () => {
        const newErrors = [];

        if (!clienteData.accion) {
            newErrors.push("Estado/Acción es requerido");
        }

        if (!clienteData.observaciones.trim()) {
            newErrors.push("Observaciones son requeridas");
        }

        if (mostrarFechaPromesa && !clienteData.fechaPromesaPago) {
            newErrors.push("Fecha de promesa de pago es requerida");
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    // Verificar si el formulario es válido
    const isFormValid = () => {
        return clienteData.accion &&
            clienteData.observaciones.trim() &&
            (!mostrarFechaPromesa || clienteData.fechaPromesaPago);
    };

    useEffect(() => {
        if (cliente) {
            setClienteData({
                id: cliente.id || "",
                nombre: cliente.nombre || "",
                email: cliente.email || "",
                telefono: cliente.celular || "",
                gestor: cliente.gestor || "",
                observaciones: cliente.observaciones || "",
                accion: cliente.accion || "",
                estado: cliente.estado || "",
                motivo: cliente.motivo || "",
                fechaPromesaPago: cliente.fechaPromesaPago ? dayjs(cliente.fechaPromesaPago) : null,
            });

            if (cliente.accion === "No interesado" || cliente.accion === "Promesa de Pago") {
                setEstadoEditable(false);
            } else {
                setEstadoEditable(true);
            }

            setMostrarFechaPromesa(cliente.accion === "Promesa de Pago");
        }
    }, [cliente]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "accion") {
            let nuevoEstado = clienteData.estado;
            let bloquearEstado = false;
            let mostrarFecha = false;

            if (value === "No interesado") {
                nuevoEstado = "No interesado";
                bloquearEstado = true;
            } else if (value === "Promesa de Pago") {
                nuevoEstado = "Promesa de Pago";
                bloquearEstado = true;
                mostrarFecha = true;
            } else {
                bloquearEstado = false;
            }

            setClienteData((prev) => ({ ...prev, accion: value }));
            setEstadoEditable(!bloquearEstado);
            setMostrarFechaPromesa(mostrarFecha);
        } else {
            setClienteData((prev) => ({ ...prev, [name]: value }));
        }

        // Limpiar errores al cambiar valores
        setErrors([]);
    };

    const handleDateChange = (date) => {
        setClienteData((prev) => ({ ...prev, fechaPromesaPago: date }));
        setErrors([]);
    };

    const handleSave = () => {
        if (validateForm()) {
            onSave(clienteData);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 115, 145, 0.15)',
                    border: '1px solid rgba(0, 115, 145, 0.1)'
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #007391 0%, #005c6b 100%)',
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    py: 2.5,
                    position: 'relative'
                }}
            >
                Gestión Comercial
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {/* Cliente info compacto */}
                <Box sx={{
                    mb: 2.5,
                    p: 2,
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }}>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                        Cliente
                    </Typography>
                    <Typography variant="subtitle1" sx={{
                        color: '#1e293b',
                        fontWeight: 600,
                        fontSize: '1rem'
                    }}>
                        {cliente?.nombre || "N/A"}
                    </Typography>
                </Box>

                {/* Errores de validación */}
                {errors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2, py: 1 }}>
                        <Typography variant="body2">
                            Campos requeridos:
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                            {errors.map((error, index) => (
                                <Chip
                                    key={index}
                                    label={error}
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }}
                                />
                            ))}
                        </Box>
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Gestor - Solo lectura */}
                    <Box sx={{
                        p: 2,
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mb: 0.5 }}>
                            Gestor Asignado
                        </Typography>
                        <Typography variant="subtitle1" sx={{
                            color: '#1e293b',
                            fontWeight: 600,
                            fontSize: '1rem'
                        }}>
                            {clienteData.gestor || "Sin asignar"}
                        </Typography>
                    </Box>

                    

                    <FormControl fullWidth margin="dense">
                        <InputLabel>Nuevo estado</InputLabel>
                        <Select name="accion" value={clienteData.accion} onChange={handleChange}>
                            <MenuItem value="">Seleccionar acción</MenuItem>
                            <MenuItem value="Reclamo activo">Reclamo activo</MenuItem>
                            <MenuItem value="No interesado">No interesado</MenuItem>
                            <MenuItem value="Indeciso">Indeciso</MenuItem>
                            <MenuItem value="Fecha de Pago">Fecha de Pago</MenuItem>
                            <MenuItem value="Interesado en reactivar">Interesado en reactivar</MenuItem>
                        </Select>
                    </FormControl>



                    {/*<FormControl fullWidth margin="dense">
                    <InputLabel>Estado</InputLabel>
                    <Select name="estado" value={clienteData.estado} onChange={handleChange} disabled={!estadoEditable}>
                        <MenuItem value="">Seleccionar estado</MenuItem>
                        <MenuItem value="Interesado">Interesado</MenuItem>
                        <MenuItem value="En seguimiento">En seguimiento</MenuItem>
                        <MenuItem value="No interesado">No interesado</MenuItem>
                        <MenuItem value="Promesa de Pago">Promesa de Pago</MenuItem>
                        <MenuItem value="Finalizado">Finalizado</MenuItem>
                    </Select>
                </FormControl>*/}

                    {mostrarFechaPromesa && (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Fecha de Promesa de Pago"
                                value={clienteData.fechaPromesaPago}
                                onChange={handleDateChange}
                                slotProps={{ textField: { fullWidth: true, margin: "dense" } }}
                            />
                        </LocalizationProvider>
                    )}

                    <FormControl fullWidth margin="dense">
                        <InputLabel>Motivo</InputLabel>
                        <Select name="motivo" value={clienteData.motivo} onChange={handleChange}>
                            <MenuItem value="">Seleccionar motivo</MenuItem>
                            <MenuItem value="Economico">Económico</MenuItem>
                            <MenuItem value="Personal">Personal</MenuItem>
                            <MenuItem value="Mal asesoramiento">Mal asesoramiento</MenuItem>
                            <MenuItem value="Sin determinar">Sin determinar</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Observaciones *"
                        fullWidth
                        size="small"
                        name="observaciones"
                        multiline
                        rows={2}
                        value={clienteData.observaciones}
                        onChange={handleChange}
                        error={!clienteData.observaciones.trim() && errors.length > 0}
                        placeholder="Describe la interacción con el cliente..."
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: 'white'
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: '0.95rem',
                                fontWeight: 500
                            }
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        fontWeight: 500,
                        borderColor: '#d1d5db',
                        color: '#6b7280',
                        '&:hover': {
                            borderColor: '#9ca3af',
                            backgroundColor: '#f9fafb'
                        }
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!isFormValid()}
                    sx={{
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        background: isFormValid()
                            ? 'linear-gradient(135deg, #007391 0%, #005c6b 100%)'
                            : '#e5e7eb',
                        color: isFormValid() ? 'white' : '#9ca3af',
                        '&:hover': {
                            background: isFormValid()
                                ? 'linear-gradient(135deg, #005c6b 0%, #004d58 100%)'
                                : '#e5e7eb'
                        },
                        '&:disabled': {
                            background: '#e5e7eb',
                            color: '#9ca3af'
                        }
                    }}
                >
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ActionComercialModal;

