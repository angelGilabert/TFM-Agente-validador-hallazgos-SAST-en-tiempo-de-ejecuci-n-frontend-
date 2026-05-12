const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const { procesarReporteSemgrep } = require('./json_functions.cjs');
const { obtenerBloqueCodigo } = require('./extract_context.cjs');
const { procesarPDF } = require('./pdf_create.cjs');
const util = require('util');
const execPromise = util.promisify(exec);
const express = require('express');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1400,
        height: 850,


        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs')
        }
    })
    win.webContents.setZoomLevel(0);
    win.webContents.setZoomFactor(1.0);

    win.loadURL('http://localhost:6767')
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// Select folder
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'] // It only can select folders (not files)
    });

    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0]; // return address of the folder
    }
});

//Execute SAST
ipcMain.handle('ejecutar-sast', async (event, pathProject) => {
    return new Promise((resolve, reject) => {
        const comando = `semgrep --config=auto --json -o results.json "${pathProject}"`;
        console.log("Iniciando analísis semgrep...");

        exec(comando, (error, stdout, stderr) => {
            if (error) {
                console.error("Error de Semgrep:", error);
                // Si hay error, devolvemos éxito falso y el mensaje
                resolve({ success: false, error: error.message });
            } else {
                // Si no hay error, éxito verdadero
                resolve({ success: true });
            }
        });
    });
})

// Escuchamos la petición desde el frontend
ipcMain.handle('json-processing', async (event, webIp, webPort, actualAgent) => {
    try {
        console.log("Capa Main: Iniciando limpieza de JSON...");
        const ip_string = webIp.join('.');

        const data = procesarReporteSemgrep(ip_string, webPort, actualAgent); // Ejecuta la función
        return { success: true, payload: data };
    } catch (error) {
        console.error("Capa Main Error:", error.message);
        return { success: false, error: error.message };
    }
});


// Pasamos la estructura del proyecto
ipcMain.handle('tree-sending', async (event, rutaCarpeta, agentIp, agentPort) => {
    try {
        console.log("Capa Main: Generando estructura proyecto...");

        const comando = `tree "${rutaCarpeta}"`;
        const { stdout, stderr } = await execPromise(comando);

        if (stderr) {
            console.warn("Advertencia en comando tree:", stderr);
        }

        const tree_map = stdout;

        const ip_string = agentIp.join('.');
        const urlDestino = `http://${ip_string}:${agentPort}/webhook/global-vars-update`;


        console.log(`Enviando a n8n: ${urlDestino}`);
        const response = await fetch(urlDestino, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                project_tree: tree_map
            })
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor n8n: ${response.statusText}`);
        }

        const result = await response.json();
        return { success: true, serverResponse: result };

    } catch (error) {
        console.error("Error en el proceso tree-sending:", error);
        return { success: false, error: error.message };
    }
});



// Levanta servidor que brinda archivos
ipcMain.handle('server-opening', async (event, rutaCarpeta) => {
    try {
        const app = express();
        const PORT_FILES = 9000;

        app.use(express.json());

        // Endpoint que usará el agente: POST /get-file
        app.post('/get-file', (req, res) => {
            const { relativaPath } = req.body;
            const rutaAbsoluta = path.join(rutaCarpeta, relativaPath);

            if (!rutaAbsoluta.startsWith(rutaCarpeta)) {
                return res.status(403).send("Acceso denegado: Fuera del proyecto");
            }

            if (fs.existsSync(rutaAbsoluta)) {
                const contenido = fs.readFileSync(rutaAbsoluta, 'utf8');
                res.json({ contenido });
            } else {
                res.status(404).send("Archivo no encontrado");
            }
        });

        serverInstance = app.listen(PORT_FILES, () => {
            console.log(`Servidor de contexto activo en puerto ${PORT_FILES}`);
        });


        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});




ipcMain.handle('extracting-code', async (event, path, line) => {
    try {
        console.log("Capa Main: Iniciando extraccion contexto...");

        const data = obtenerBloqueCodigo(path, line); // Ejecuta la función
        return { success: true, payload: data };
    } catch (error) {
        console.error("Capa Main Error:", error.message);
        return { success: false, error: error.message };
    }
});


ipcMain.handle('n8n-sending', async (event, agentIp, agentPort, vulnJson) => {
    const ip_string = agentIp.join('.');
    const urlDestino = `http://${ip_string}:${agentPort}/webhook/ai_agent_validator`;

    try {
        // POST file
        const response = await fetch(urlDestino, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vulnJson)
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.statusText}`);
        }

        const result = await response.json();
        return { success: true, serverResponse: result };
    } catch (error) {
        console.error("Error al enviar el POST:", error);
        return { success: false, error: error.message };
    }
});


// Procesar PDF
ipcMain.handle('pdf-processing', async (event, vulnList, rutaCarpeta) => {
    try {
        console.log("Capa Main: Iniciando creación del reporte pdf...");

        const escribir_pdf = procesarPDF(vulnList, rutaCarpeta);

        if (escribir_pdf) {
            console.log("¡El reporte se ha generado correctamente!");

            const folderPath = path.join(__dirname, '../report_pdf');

            const comando = `pdflatex -interaction=nonstopmode -output-directory="${folderPath}" "${path.join(folderPath, 'main.tex')}"`;


            return new Promise((resolve) => {
                exec(comando, (error, stdout, stderr) => {
                    const pdfGenerado = fs.existsSync(path.join(folderPath, 'main.pdf'));

                    if (!pdfGenerado) {
                        console.error("Error de LaTeX:", error);
                        resolve({ success: false, error: "Error al compilar el PDF (¿tienes pdflatex instalado?)" });
                    } else {
                        console.log("PDF generado con éxito.");

                        const pdfWindow = new BrowserWindow({
                            width: 900,
                            height: 800,
                            title: "Reporte de Seguridad",
                            webPreferences: {
                                // Esto es clave para que Electron permita ver el PDF
                                plugins: true
                            }
                        });
                        pdfWindow.loadFile(path.join(folderPath, 'main.pdf'));

                        pdfWindow.setMenu(null);
                        resolve({ success: true });

                    }
                });
            });

        } else {
            alert("Hubo un error al crear el archivo .tex.");
        }

        return { success: true, payload: data };
    } catch (error) {
        console.error("Capa Main Error:", error.message);
        return { success: false, error: error.message };
    }
});
