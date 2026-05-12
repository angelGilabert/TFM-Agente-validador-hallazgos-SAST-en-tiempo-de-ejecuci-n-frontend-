
const fs = require('fs');

//! De momento solo para python, deberá ser actualizada.
function obtenerBloqueCodigo(rutaArchivo, numLinea) {
    try {
        // Leemos el archivo y lo dividimos por líneas
        const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
        const lineas = contenido.split(/\r?\n/);

        let errorLine = "";
        let postLine = "";

        // Ajusta el índice
        const indiceActual = numLinea - 1;
        let codigo = [];

        // Recorremos hacia atrás desde el error
        for (let i = indiceActual; i >= 0; i--) {
            const linea = lineas[i];

            if (errorLine === "") {
                errorLine = linea;
            }

            codigo.push(linea);

            // Verificamos si la línea (quitando espacios) empieza con @
            if (linea.trimStart().startsWith('@')) {
                postLine = linea;
                break;
            }
        }
        // Invertimos el orden
        const result = codigo.reverse().join('\n');

        return result;

    } catch (error) {
        if (error.code === 'ENOENT') {
            return "Error: No se encontró el archivo en esa ruta.";
        }
        return "Error al leer el archivo: " + error.message;
    }
}

// Ejemplo de uso:
// const snippet = obtenerBloqueCodigo('/home/angel/VSProjects/vulnApp2/app.py', 192);
// console.log(snippet);

module.exports = { obtenerBloqueCodigo };