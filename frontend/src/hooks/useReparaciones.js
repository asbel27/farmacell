import { useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export const useReparaciones = () => {
    const [reparaciones, setReparaciones] = useState([]);

    // Función para traer los datos de Postgres
    const listarReparaciones = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:9000/reparaciones');
            // Si los datos vienen dentro de un objeto 'rows', los extraemos
            const datos = Array.isArray(res.data) ? res.data : (res.data.rows || []);
            setReparaciones(datos);
        } catch (err) {
            console.error("Error al cargar taller:", err);
            setReparaciones([]);
        }
    }, []);

    // Función para Guardar
    const crearReparacion = async (datos) => {
        try {
            await axios.post('http://localhost:9000/reparaciones', datos);
            await listarReparaciones(); // Recargamos la tabla
            Swal.fire('¡Listo!', 'Orden guardada', 'success');
            return true;
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo guardar', 'error');
            return false;
        }
    };

    // Función para Actualizar
    const actualizarReparacion = async (id, datos) => {
        try {
            await axios.put(`http://localhost:9000/reparaciones/${id}`, datos);
            await listarReparaciones();
            Swal.fire('Actualizado', 'Registro modificado', 'success');
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    // Función para Eliminar
    const eliminarReparacion = async (id) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar?',
            text: "Esta acción no tiene vuelta atrás",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar'
        });

        if (confirm.isConfirmed) {
            try {
                await axios.delete(`http://localhost:9000/reparaciones/${id}`);
                await listarReparaciones();
                Swal.fire('Borrado', 'La orden fue eliminada', 'success');
                return true;
            } catch (err) {
                Swal.fire('Error', 'No se pudo eliminar', 'error');
                return false;
            }
        }
    };

    // LA PARTE CLAVE: Exportamos TODO para que el componente lo vea
    return { 
        reparaciones, 
        listarReparaciones, 
        crearReparacion, 
        actualizarReparacion, 
        eliminarReparacion 
    };
};