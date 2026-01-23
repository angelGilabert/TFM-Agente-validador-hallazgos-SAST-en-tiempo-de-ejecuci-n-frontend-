import React, { useState } from 'react';


export function FolderSelector({ }) {

    const [rutaCarpeta, setRutaCarpeta] = useState('Ninguna seleccionada');

    const manejarSeleccion = async () => {
        // Llamamos al puente
        const ruta = await window.electronAPI.abrirSelectorCarpeta();

        if (ruta) {
            setRutaCarpeta(ruta);
            console.log("Carpeta guardada en variable:", ruta);
        }
    };

    return (
        <button onClick={manejarSeleccion}>Seleccionar Carpeta 📁</button>
    );
}