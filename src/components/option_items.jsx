import React, { useState, useRef } from 'react';

export function FolderSelector({ rutaCarpeta, setRutaCarpeta }) {

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

export function AgentSelector({ actualAgent, setActualAgent }) {

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

export function NeightnLocation({ agentIp, setAgentIp, agentPort, setAgentPort }) {
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
                <IpInput octetos={agentIp} setOctetos={setAgentIp} />
                <label className="label-ip">Puerto:</label>
                <PortInput puerto={agentPort} setPuerto={setAgentPort} />
            </div>
        </div>
    );
}

export function WebLocation({ webIp, setWebIp, webPort, setWebPort }) {
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
                <IpInput octetos={webIp} setOctetos={setWebIp} />
                <label className="label-ip">Puerto:</label>
                <PortInput puerto={webPort} setPuerto={setWebPort} />
            </div>
        </div>
    );
}

export function PlayLoading({ rutaCarpeta, webIp, webPort, agentIp, agentPort, actualAgent, setIsStarted, setVulnList }) {

    const [play, setPlay] = useState(0);

    //! IMPORTANTE PIPELINE
    const play_action = async () => {
        setPlay(1);

        // 1. Ejecuta análisis SAST
        const resultSast = await window.electronAPI.ejecutarSast(rutaCarpeta);

        if (resultSast.success) {

            // 2. Procesa resultado y limpia contenido
            const resultJson = await window.electronAPI.procesarJson(webIp, webPort, actualAgent);

            // 3. Procesa jerarquía proyecto y la envía
            const resultTree = await window.electronAPI.sendTreemap(rutaCarpeta, agentIp, agentPort);

            // 4. Levanta servidor que provee archivos
            const resultServer = await window.electronAPI.openServer(rutaCarpeta);


            if (resultJson.success && resultTree.success) {
                console.log('¡Análisis y limpieza completados!');

                // 5. Actualiza la pantalla mostrando los errores
                console.log(resultJson.payload.results)
                setVulnList(resultJson.payload.results)
                setIsStarted(true)

                return;

                const { ip_web, port_web, agent_model } = resultJson.payload

                for (let i = 0; i < resultJson.payload.results.length; i++) {
                    // 6. Extrae contexto vulnerabilidad
                    const resultCode = await window.electronAPI.extraerCode(resultJson.payload.results[i].path, resultJson.payload.results[i].line);

                    if (resultCode.success) {
                        console.log('Extraido codigo vuln')
                        console.log(resultCode.payload)

                        const vulnJson = {
                            ip_web,
                            port_web,
                            agent_model,
                            vulnerability: resultJson.payload.results[i],
                            code: resultCode.payload
                        };

                        console.log(vulnJson)

                        // 7. Envía resultado
                        const post_n8n = await window.electronAPI.postN8n(agentIp, agentPort, vulnJson);

                        if (post_n8n.success) {
                            console.log(post_n8n.serverResponse)

                            setVulnList(prevLista => {
                                const nuevaLista = [...prevLista];
                                nuevaLista[i] = {
                                    ...nuevaLista[i],
                                    ...post_n8n.serverResponse
                                };
                                return nuevaLista;
                            });
                        }
                    }
                }
            }

        } else {
            console.log(`Error en el análisis: ${resultSast.error}`);
            setPlay(0);
        }
    };

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
                    onClick={() => play_action()}
                    alt="Imagen play" />
            )}

        </div>
    );
}

function IpInput({ octetos, setOctetos }) {
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

function PortInput({ puerto, setPuerto }) {

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