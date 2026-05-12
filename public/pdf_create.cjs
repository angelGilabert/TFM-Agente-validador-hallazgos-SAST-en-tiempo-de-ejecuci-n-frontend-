const fs = require('fs');
const path = require('path');


function procesarPDF(vulnList, rutaCarpeta) {
    try {
        const rutaArchivo = path.join(__dirname, '..', '/report_pdf/main.tex');

        const nombreCarpeta = path.basename(rutaCarpeta);
        const proyecto = nombreCarpeta.replace(/_/g, '\\\\_');

        // 1. DEPENDENCIAS
        const preambulo = `\\documentclass[12pt]{article}
\\usepackage[spanish]{babel}
\\usepackage[utf8]{inputenc}
\\usepackage[letterpaper,top=2cm,bottom=2cm,left=2cm,right=2cm,marginparwidth=1.75cm]{geometry}

% --- 1. QUITAR SANGRÍA Y MEJORAR PÁRRAFOS ---
\\usepackage{parskip}

% --- 2. COLORES ---
\\usepackage[dvipsnames,table]{xcolor}
\\definecolor{deepblue}{rgb}{0,0,0.5}
\\definecolor{deepred}{rgb}{0.6,0,0}
\\definecolor{deepgreen}{rgb}{0,0.5,0}
\\definecolor{mGreen}{rgb}{0,0.6,0}
\\definecolor{mGray}{rgb}{0.5,0.5,0.5}
\\definecolor{mPurple}{rgb}{0.58,0,0.82}
\\definecolor{backgroundColour}{rgb}{0.95,0.95,0.92}

% --- 3. FUENTES Y GRÁFICOS ---
\\DeclareFixedFont{\\ttb}{T1}{txtt}{bx}{n}{12}
\\DeclareFixedFont{\\ttm}{T1}{txtt}{m}{n}{12}
\\usepackage{graphicx}
\\usepackage{wrapfig}
\\usepackage{caption}
\\usepackage{subcaption}
\\usepackage{sectsty}
\\usepackage{tikz}
\\usetikzlibrary{positioning}

% --- 4. CONFIGURACIÓN DE CÓDIGO ---
\\usepackage{listings}

\\newcommand\\pythonstyle{\\lstset{
language=Python,
basicstyle=\\ttm,
keywordstyle=\\ttb\\color{deepblue},
stringstyle=\\color{deepgreen},
frame=tb,
showstringspaces=false
}}
\\lstnewenvironment{python}[1][]{\\pythonstyle\\lstset{#1}}{}

\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}

\\usepackage[most]{tcolorbox}

\\usepackage{pgf-pie}
\\usetikzlibrary{shadows}
\\usetikzlibrary{shadows.blur}

\\usepackage[T1]{fontenc}

% Definición de colores
\\definecolor{danger}{HTML}{E74C3C}
\\definecolor{low}{HTML}{D5F5E3}
\\definecolor{medium}{HTML}{FCF3CF}
\\definecolor{darkgray}{HTML}{2C3E50}
\\definecolor{lightgray}{HTML}{F8F9F9}

\\begin{document}
`;
        // CREAR / TRUNCAR el archivo con el preámbulo
        fs.writeFileSync(rutaArchivo, preambulo, { flag: 'w' });

        // 2. PORTADA
        const portada = `
\\begin{titlepage}
    \\centering
    {\\includegraphics[width=0.8\\textwidth]{logos.png}\\par}
    
    \\vspace{2cm}
    
    {\\scshape\\Large AGENTE VALIDADOR DE HALLAZGOS SAST \\par}
    {\\scshape\\Large EN TIEMPO DE EJECUCIÓN \\par}
    
    \\vspace{1.5cm}
    
    % --- LÍNEA DECORATIVA ---
    \\rule{\\linewidth}{0.2mm} \\\\[1cm]
    
    % --- TÍTULO PRINCIPAL ---
    {\\Huge \\bfseries REPORTE DE VULNERABILIDADES \\par}
    \\vspace{1cm}
    
    {\\huge Proyecto: \\colorbox{black!5}{\\hspace{0.3cm}\\texttt{\\textbf{${proyecto}}}\\hspace{0.3cm}}} \\par
    \\vspace{0.4cm}

    % --- LÍNEA DECORATIVA ---
    \\rule{\\linewidth}{0.2mm} \\\\[2cm]

    \\vfill
    \\vspace{2cm}

    % --- FECHA ---
    {\\large \\today \\par} 

\\end{titlepage}

\\newpage
`;
        // Append en el archivo
        fs.appendFileSync(rutaArchivo, portada);


        const obtenerColorStatus = (nivel) => {
            const valor = nivel.toUpperCase();
            switch (valor) {
                case 'HIGH':
                    return { fondo: 'red!10', texto: 'red!80!black' };
                case 'MEDIUM':
                    return { fondo: 'yellow!20', texto: 'orange!90!black' };
                case 'LOW':
                    return { fondo: 'green!10', texto: 'green!60!black' };
                default:
                    return { fondo: 'gray!10', texto: 'black' };
            }
        };


        // 3. VULNERABILIDADES

        vulnList.forEach((vuln) => {
            // Solo procesamos y escribimos si esta variable es true
            if (vuln.resultado === "CONFIRMADO") {
                const colConf = obtenerColorStatus(vuln.confidence);
                const colImp = obtenerColorStatus(vuln.impact);
                const colLik = obtenerColorStatus(vuln.likelihood);

                const seccionVuln = `
        \\subsection*{${vuln.cwe[0]}}
        
        ${vuln.message}
        
        \\begin{minipage}[t]{0.45\\textwidth}
        \\vspace{0pt}
            \\begin{tcolorbox}[colback=white, colframe=gray!20, arc=8pt, title=Descripción ataque, coltitle=black, fonttitle=\\bfseries, detach title, before upper={\\tcbtitle\\par\\medskip}]
                \\small
                ${vuln.razonamiento}
            \\end{tcolorbox}
        \\end{minipage}
        \\hfill
        \\begin{minipage}[t]{0.52\\textwidth}
        \\vspace{7pt}
            \\small
            \\textbf{Categoría:} \\hspace{1em} \\texttt{${vuln.categoria}} \\\\
            \\textbf{Archivo:} \\hspace{1em} \\texttt{${vuln.path.replace(/_/g, '\\_')}}
            
            \\begin{tcolorbox}[colback=white, colframe=gray!20, arc=8pt, before upper={\\tcbtitle\\par\\medskip}, width=0.9\\textwidth]
                \\small
                CONFIDENCE: \\colorbox{${colConf.fondo}}{\\textcolor{${colConf.texto}}{${vuln.confidence.toUpperCase()}}} \\\\
                IMPACT: \\colorbox{${colImp.fondo}}{\\textcolor{${colImp.texto}}{${vuln.impact.toUpperCase()}}} \\\\
                LIKELIHOOD: \\colorbox{${colLik.fondo}}{\\textcolor{${colLik.texto}}{${vuln.likelihood.toUpperCase()}}}
            \\end{tcolorbox}
        \\end{minipage}
        
        
        % --- LÍNEA CORREGIDA ---
        \\begin{tcolorbox}[colback=lightgray, colframe=gray!10, title=\\textcolor{green!60!black}{LINEA CORREGIDA:}, fonttitle=\\bfseries\\small, detach title, before upper={\\tcbtitle\\par}]
        \\begin{flushleft}
            \\texttt{\\small ${vuln.line}\\quad ${vuln.correccion}} 
        \\end{flushleft}
        \\end{tcolorbox}
        
        `;

                // Solo se añade al archivo si pasó el "if"
                fs.appendFileSync(rutaArchivo, seccionVuln);
            }
        });


        // 4. RESULTADOS FINALES

        const total = vulnList.length;
        const demostrados = vulnList.filter(v => v.resultado === "CONFIRMADO").length;
        const falsos_positivos = total - demostrados;


        const categorias = vulnList
            .filter(v => v.resultado === "CONFIRMADO")
            .reduce((acc, v) => {
                acc[v.categoria] = (acc[v.categoria] || 0) + 1;
                return acc;
            }, {});

        const archivos = vulnList
            .filter(v => v.resultado === "CONFIRMADO")
            .reduce((acc, v) => {
                // 1. Extraemos solo el nombre (ej: "hola.py")
                const soloNombre = path.basename(v.path);

                // 2. Limpiamos para LaTeX (guiones bajos)
                const nombreLimpio = soloNombre.replace(/_/g, '\\\\_');

                acc[nombreLimpio] = (acc[nombreLimpio] || 0) + 1;
                return acc;
            }, {});


        const entradasArchivos = Object.entries(archivos);

        // 1. Generamos las etiquetas del eje Y (yticklabels)
        const yTickLabels = entradasArchivos.map(([file, _]) => {
            // Detectamos la extensión (quitando el escape de LaTeX para comprobarlo)
            const nombreReal = file.replace(/\\\\_/g, '_');
            const ext = nombreReal.split('.').pop().toLowerCase();

            // Decidimos el icono
            let icono = 'file_icon.png'; // Icono por defecto
            if (ext === 'py') icono = 'python_icon.png';
            if (ext === 'js') icono = 'js_icon.png';

            // Devolvemos el formato de LaTeX: {\includegraphics... nombre}
            return `{\\includegraphics[height=20pt]{${icono}} ${file}}`;
        }).join(', ');

        // 2. Generamos la lista de nombres para symbolic y coords
        const symbolicCoords = entradasArchivos.map(([file, _]) => file).join(', ');

        // 3. Generamos las coordenadas del gráfico (num, archivo)
        const plotCoordinates = entradasArchivos.map(([file, num]) => `(${num}, ${file})`).join(' ');


        const resumenEjecutivo = `
\\newpage
\\section{Resumen Ejecutivo de Seguridad}

\\begin{tcolorbox}[
    width=0.7\\textwidth,
    colback=gray!5!white, 
    colframe=gray!75!black, 
    title=\\textbf{Configuración del Análisis},
    fonttitle=\\bfseries,
    toptitle=6pt, bottomtitle=6pt,
    arc=3pt, boxrule=0.5pt,
    left=10pt, right=10pt, top=8pt, bottom=10pt
]
    \\textbf{Analizador SAST:} \\hspace{1em} \\texttt{semgrep Community edition}\\\\[2pt]
    \\textbf{Agente utilizado:} \\hspace{1em} \\texttt{Gemini}\\\\[2pt]
    \\textbf{Modelo IA:} \\hspace{1em} \\texttt{gemini-2.5-flash}\\\\[2pt]
    \\textbf{Proyecto analizado:} \\hspace{1em} \\texttt{${proyecto}}
\\end{tcolorbox}

\\subsection{Vulnerabilidades detectadas}

\\begin{figure}[h]
    \\centering
    \\begin{tikzpicture}
        \\pie[color={gray!30, red!95!black}, 
            text=pin,
            sum=${total},               
            radius=2.5,
            font=\\bfseries
        ]{
            ${falsos_positivos}/Seguros, 
            ${demostrados}/Vulnerables
        }
    \\end{tikzpicture}
\\end{figure}

\\subsection{Categorías más frecuentes}

\\begin{figure}[h]
    \\centering
    \\begin{tikzpicture}
    \\begin{axis}[
        ybar,
        enlarge x limits=0.25,
        legend style={at={(0.5,-0.2)}, anchor=north, legend columns=-1},
        ylabel={Vulnerabilidades demostradas},
        symbolic x coords={${Object.keys(categorias).join(', ')}},
        xtick=data,
        nodes near coords,
        nodes near coords align={vertical},
        bar width=25pt,
        width=\\textwidth,
        height=7cm,
        axis x line*=bottom,
        axis y line*=left,
        ymajorgrids=true,
        grid style=dashed
    ]
    \\addplot[fill=deepblue!70, draw=deepblue] coordinates {
        ${Object.entries(categorias).map(([cat, num]) => `(${cat}, ${num})`).join(' ')}
    };
    \\end{axis}
    \\end{tikzpicture}
\\end{figure}

\\newpage
\\subsection{Vulnerabilidades por archivo}

\\begin{figure}[h]
    \\centering
    \\begin{tikzpicture}
    \\begin{axis}[
        xbar,
        width=0.67\\textwidth,
        height={${Object.keys(archivos).length} * 2cm},
        enlarge y limits=0.2,
        xmin=0,
        symbolic y coords={${Object.keys(archivos).join(', ')}},
        ytick=data,  
        xtick=\\empty,
        axis line style={draw=none},
        yticklabel style={
            text width=0.3\\textwidth,  
            align=left,    
            font=\\large\\bfseries,
            xshift=-0.2cm   
        },    
        yticklabels={${yTickLabels}},
        nodes near coords,      
        nodes near coords align={horizontal},
        bar width=15pt,
        axis x line*=bottom,
        axis y line*=left,
        xmajorgrids=true,
        grid style=dashed
    ]
    \\addplot[fill=orange!80!black, draw=orange!40!black] coordinates {
        ${Object.entries(archivos).map(([file, num]) => `(${num},${file})`).join(' ')}
    };
    \\end{axis}
    \\end{tikzpicture}
\\end{figure}
`;
        fs.appendFileSync(rutaArchivo, resumenEjecutivo);

        fs.appendFileSync(rutaArchivo, "\n\\end{document}");

        console.log("✅ Documento LaTeX generado con éxito.");

        return true;

    } catch (error) {
        console.error("❌ Error al generar el reporte:", error.message);
        return false;
    }
}

module.exports = { procesarPDF };