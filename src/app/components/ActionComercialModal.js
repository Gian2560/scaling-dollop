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
    Typography
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
        fechaPromesaPago: null, 
    });

    const [estadoEditable, setEstadoEditable] = useState(true);
    const [mostrarFechaPromesa, setMostrarFechaPromesa] = useState(false);

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
    };

    const handleDateChange = (date) => {
        setClienteData((prev) => ({ ...prev, fechaPromesaPago: date }));
    };

    const handleSave = () => {
        onSave(clienteData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Acción Comercial (Cliente)</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle1" fontWeight="bold">
                    Usuario actual: {cliente?.nombre || "N/A"}
                </Typography>

                <TextField label="Nombre" fullWidth margin="dense" name="nombre" value={clienteData.nombre} onChange={handleChange} />
                <TextField label="Email" fullWidth margin="dense" name="email" value={clienteData.email} onChange={handleChange} />
                <TextField label="Teléfono" fullWidth margin="dense" name="telefono" value={clienteData.telefono} onChange={handleChange} />

                <FormControl fullWidth margin="dense">
                    <InputLabel>Gestor</InputLabel>
                    <Select name="gestor" value={clienteData.gestor} onChange={handleChange}>
                        <MenuItem value="">Sin gestor asignado</MenuItem>
                        {gestores.map((gestor) => (
                            <MenuItem key={gestor.id} value={gestor.nombre_completo}>
                                {gestor.nombre_completo}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField label="Observaciones" fullWidth margin="dense" name="observaciones" multiline rows={3} value={clienteData.observaciones} onChange={handleChange} />

                <FormControl fullWidth margin="dense">
                    <InputLabel>Acción Comercial</InputLabel>
                    <Select name="accion" value={clienteData.accion} onChange={handleChange}>
                        <MenuItem value="">Seleccionar acción</MenuItem>
                        <MenuItem value="Volver a contactar">Volver a contactar</MenuItem>
                        <MenuItem value="No interesado">No interesado</MenuItem>
                        <MenuItem value="Promesa de Pago">Promesa de Pago</MenuItem>
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
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cerrar
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ActionComercialModal;
