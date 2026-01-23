import React, { useState, useRef } from 'react';

export function FolderSelector({ }) {

    const [rutaCarpeta, setRutaCarpeta] = useState('Ninguna carpeta seleccionada');

    const manejarSeleccion = async () => {
        const ruta = await window.electronAPI.abrirSelectorCarpeta();

        if (ruta) {
            setRutaCarpeta(ruta);
            console.log("Carpeta guardada en variable:", ruta);
        }
    };

    return (
        <div className='item'>
            <div style={{ width: "100%", height: "70%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <img className='img_folder'
                    src="src/assets/folder.png"
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
                    onClick={manejarSeleccion}
                    alt="Imagen de directorio" />
            </div>

            <div style={{ width: "100%", height: "20%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p className='text_path'> {rutaCarpeta} </p>
            </div>
        </div>
    );
}

export function AgentSelector({ }) {

    const [actualAgent, setActualAgent] = useState("Gemini");

    const select_agent = (num) => {
        if (num == 1) {
            setActualAgent("Claude Code");
        } else if (num == 2) {
            setActualAgent("Gemini");
        } else {
            setActualAgent("ChatGPT");
        }
    };

    return (
        <div className='item'>
            <div style={{ width: "100%", height: "70%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", gap: "3%" }}>

                <button className={`boton-logo ${actualAgent === "ChatGPT" ? "activo" : ""}`}>
                    <img className='chatgpt-logo.png'
                        src="src/assets/chatgpt-logo.png"
                        style={{ maxWidth: "95%", maxHeight: "95%", objectFit: "contain", display: "block" }}
                        onClick={() => select_agent(3)}
                        alt="Imagen ChatGPT" />
                </button>

                <button className={`boton-logo ${actualAgent === "Gemini" ? "activo" : ""}`}>
                    <img className='gemini-logo.png'
                        src="src/assets/gemini-logo.png"
                        style={{ maxWidth: "95%", maxHeight: "95%", objectFit: "contain", display: "block" }}
                        onClick={() => select_agent(2)}
                        alt="Imagen Gemini" />
                </button>

                <button className={`boton-logo ${actualAgent === "Claude Code" ? "activo" : ""}`}>
                    <img className='claude.png'
                        src="src/assets/claude.png"
                        style={{ maxWidth: "95%", maxHeight: "95%", objectFit: "contain", display: "block" }}
                        onClick={() => select_agent(1)}
                        alt="Imagen Claude" />
                </button>


            </div>

            <div style={{ width: "100%", height: "20%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p className='text_path'> {actualAgent} </p>
            </div>
        </div>
    );
}

export function NeightnLocation({ }) {
    return (
        <div className='item' style={{ justifyContent: "space-between" }}>
            <div style={{ width: "70%", height: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <img
                    src="src/assets/n8n-logo.png"
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
                    alt="Imagen de directorio" />
            </div>

            <div style={{
                display: "grid", gridTemplateColumns: "repeat(2, 0.9fr)", gridTemplateRows: "repeat(2, 1fr)",
                gap: "15px 0px", justifyContent: "center", alignItems: "center", height: "30%", marginBottom: "7%"
            }}>
                <label className="label-ip">Dirección IPv4:</label>
                <IpInput />
                <label className="label-ip">Puerto:</label>
                <PortInput />
            </div>
        </div>
    );
}

export function WebLocation({ }) {
    return (
        <div className='item' style={{ justifyContent: "space-between" }}>
            <div style={{
                width: "70%", height: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", overflow: "hidden"
            }}>
                <img
                    src="src/assets/www.png"
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
                    alt="Imagen de directorio" />
            </div>

            <div style={{
                display: "grid", gridTemplateColumns: "repeat(2, 0.9fr)", gridTemplateRows: "repeat(2, 1fr)",
                gap: "15px 0px", justifyContent: "center", alignItems: "center", height: "30%", marginBottom: "7%"
            }}>
                <label className="label-ip">Dirección IPv4:</label>
                <IpInput />
                <label className="label-ip">Puerto:</label>
                <PortInput />
            </div>
        </div>
    );
}


export function PlayLoading({ }) {

    const [play, setPlay] = useState(0);

    return (
        <div className='play-section'>

            {play ? (
                <img className='loading-button'
                    src="src/assets/loading.png"
                    style={{ width: "35%", height: "35%", objectFit: "contain", display: "block" }}
                    alt="Imagen cargando" />
            ) : (
                <img className='play_button'
                    src="src/assets/play.png"
                    style={{ width: "25%", height: "25%", objectFit: "contain", display: "block" }}
                    onClick={() => setPlay(1)}
                    alt="Imagen play" />
            )}

        </div>
    );
}

function IpInput({ }) {
    const [octetos, setOctetos] = useState(["127", "0", "0", "1"]);

    const inputsRef = useRef([]);

    const manejarCambio = (index, e) => {
        const valor = e.target.value.replace(/\D/g, ""); // Solo números
        if (valor.length > 3) return; // Máximo 3 números por octeto

        const nuevosOctetos = [...octetos];
        nuevosOctetos[index] = valor;
        setOctetos(nuevosOctetos);

        // Salto automático al siguiente input si ya tiene 3 números
        if (valor.length === 3 && index < 3) {
            inputsRef.current[index + 1].focus();
        }
    };

    const manejarBorrado = (index, e) => {
        // Si borra y el campo está vacío, vuelve al anterior
        if (e.key === "Backspace" && !octetos[index] && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    return (
        <div className="campos-ip">
            {octetos.map((octeto, i) => (
                <div key={i} className="octeto-wrapper">
                    <input
                        ref={(el) => (inputsRef.current[i] = el)}
                        type="text"
                        className="input-octeto"
                        value={octeto}
                        onChange={(e) => manejarCambio(i, e)}
                        onKeyDown={(e) => manejarBorrado(i, e)}
                        placeholder="0"
                    />
                    {i < 3 && <span className="punto-separador">.</span>}
                </div>
            ))}
        </div>
    );
}

function PortInput({ }) {
    const [puerto, setPuerto] = useState("5000");

    const manejarCambioPuerto = (e) => {
        const valor = e.target.value.replace(/\D/g, ""); // Solo números
        if (valor.length > 4) return;
        setPuerto(valor);
    };

    return (
        <div className="campo-port">
            <div>
                <input
                    type="text"
                    style={{ width: "40px" }}
                    className="input-octeto"
                    value={puerto}
                    onChange={(e) => manejarCambioPuerto(e)}
                    placeholder="0"
                />
            </div>
        </div>
    )

}