const fs = require('fs');
const path = require('path');


function procesarReporteSemgrep(ip_string, webPort, actualAgent) {
    try {
        const rutaArchivo = path.join(__dirname, '..', 'results.json');
        const rutaDestino = path.join(__dirname, '..', 'processed_report.json');

        const rawData = fs.readFileSync(rutaArchivo, 'utf8');
        const semgrepJson = JSON.parse(rawData);


        const findingsLimpios = semgrepJson.results
            .filter(finding => finding.extra.severity === 'ERROR')
            .map(finding => {
                return {
                    check_id: finding.check_id,
                    path: finding.path,
                    line: finding.start.line,
                    message: finding.extra.message,
                    cwe: finding.extra.metadata.cwe,
                    impact: finding.extra.metadata.impact,
                    likelihood: finding.extra.metadata.likelihood,
                    confidence: finding.extra.metadata.confidence
                };
            });

        const finalReport = {
            ip_web: ip_string,
            port_web: webPort,
            agent_model: actualAgent,
            results: findingsLimpios
        };

        fs.writeFileSync(rutaDestino, JSON.stringify(finalReport, null, 2));

        return finalReport;

    } catch (error) {
        console.error("Error en procesarReporteSemgrep:", error.message);
        throw error;
    }
}

// procesarReporteSemgrep();


module.exports = { procesarReporteSemgrep };