import { useState } from 'react'
import { WebLocation, FolderSelector, AgentSelector, NeightnLocation, PlayLoading } from './components/option_items.jsx';
import { Header } from './components/header.jsx';
import './accordion.css';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import './App.css'

export function App() {

  const [isStarted, setIsStarted] = useState(false);

  const [rutaCarpeta, setRutaCarpeta] = useState('Ninguna carpeta seleccionada');

  const [vulnList, setVulnList] = useState([
    {
      "check_id": "python.django.security.injection.tainted-sql-string.tainted-sql-string",
      "path": "/home/angel/VSProjects/vulnApp2/app.py",
      "line": 192,
      "message": "Detected user input used to manually construct a SQL string. This is usually bad practice because manual construction could accidentally result in a SQL injection. An attacker could use a SQL injection to steal or modify contents of the database. Instead, use a parameterized query which is available by default in most database engines. Alternatively, consider using the Django object-relational mappers (ORM) instead of raw SQL queries.",
      "cwe": ["CWE-915: Improperly Controlled Modification of Dynamically-Determined Object Attributes"],
      "impact": "LOW",
      "likelihood": "MEDIUM",
      "confidence": "HIGH"
    }
  ])

  return (
    <>
      <Header />

      {isStarted ? (
        // Results screen
        <ResultsView vulnList={vulnList} rutaCarpeta={rutaCarpeta} />
      ) : (
        // Start options screen
        <OptionsView setIsStarted={setIsStarted} vulnList={vulnList} setVulnList={setVulnList} rutaCarpeta={rutaCarpeta} setRutaCarpeta={setRutaCarpeta} />
      )}
    </>
  )
}

function OptionsView({ setIsStarted, setVulnList, rutaCarpeta, setRutaCarpeta }) {

  const [webIp, setWebIp] = useState(["127", "0", "0", "1"]);
  const [webPort, setWebPort] = useState(4280)

  const [agentIp, setAgentIp] = useState(["127", "0", "0", "1"]);
  const [agentPort, setAgentPort] = useState(5678)

  const [actualAgent, setActualAgent] = useState("Gemini");

  return (
    <>
      <div class="contenedor">
        <WebLocation webIp={webIp} setWebIp={setWebIp} webPort={webPort} setWebPort={setWebPort} />
        <FolderSelector rutaCarpeta={rutaCarpeta} setRutaCarpeta={setRutaCarpeta} />
        <NeightnLocation agentIp={agentIp} setAgentIp={setAgentIp} agentPort={agentPort} setAgentPort={setAgentPort} />
        <AgentSelector actualAgent={actualAgent} setActualAgent={setActualAgent} />

        <PlayLoading rutaCarpeta={rutaCarpeta} webIp={webIp} webPort={webPort} agentIp={agentIp}
          agentPort={agentPort} actualAgent={actualAgent} setIsStarted={setIsStarted}
          setVulnList={setVulnList} />
      </div>
    </>
  )
}

function ResultsView({ vulnList, rutaCarpeta }) {
  return (
    <>
      <div className="accordion-container">
        <Accordion items={vulnList} />
        <BotonDescargaPdf vulnList={vulnList} rutaCarpeta={rutaCarpeta} />
      </div>
    </>
  )
}





const Accordion = ({ items }) => {

  // Indice ítem activo
  const [activeIndex, setActiveIndex] = useState(null);

  const handleItemClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <div key={index} className={`accordion-item ${activeIndex === index ? 'active' : ''}`} >

          <button className="accordion-header" onClick={() => handleItemClick(index)}>

            <div style={{ width: '4%' }}>
              {!item.resultado ? (
                <svg className="espiner-svg" viewBox="0 0 100 100">
                  <circle className="arco" cx="50" cy="50" r="25" stroke="#1D89E4" strokeWidth="10" fill="none" strokeLinecap="round"></circle>
                </svg>
              ) : item.resultado === 'FALSO_POSITIVO' ? (
                <img src={"src/assets/good.png"} alt="Falso-positivo" className="img-result" />
              ) : (
                <img src={"src/assets/bad.png"} alt="Confirmada" className="img-result" />
              )}
            </div>

            <div style={{ width: '15%' }}>
              <span className="accordion-category">{item.cwe[0].split(':')[0]}</span>
            </div>

            <div style={{ width: '76%', paddingRight: '1%' }}>
              <span className="accordion-title">{item.cwe[0].split(':')[1]}</span>
            </div>

            <div style={{ width: '15%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <RiskBadge label="confidence" value={item.confidence} />
              <RiskBadge label="impact" value={item.impact} />
              <RiskBadge label="likelihood" value={item.likelihood} />
            </div>

            <div style={{ width: '5%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span className="signo-mas" style={{ transform: activeIndex === index ? 'rotate(180deg)' : 'rotate(90deg)' }}>
                {activeIndex === index ? '−' : '+'}
              </span>
            </div>
          </button>

          <div className="accordion-content">
            <div className="content-inner">

              {item.resultado && (
                <>
                  <span className={`title ${item.resultado === 'FALSO_POSITIVO' ? 'falso-positivo' : 'confirmado'}`}>
                    ✓ {item.resultado}
                  </span>

                  <div className='vuln-info-container'>

                    <div className="contenedor-redondeado">
                      <p> {item.razonamiento} </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: "column", margin: '0px 10px', width: '65%' }}>

                      <table class="tabla-moderna">
                        <thead>
                          <tr>
                            <th>URL atacada</th>
                            <th>Payload</th>
                            <th>Respuesta</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{item.url_atacada}</td>
                            <td>{item.payload_enviado}</td>
                            <td>Status: {item.respuesta_servidor.status} <br></br> Response: {item.respuesta_servidor.fragmento_cuerpo}</td>
                          </tr>
                        </tbody>
                      </table>

                      <span className='linea-corregida-label'> Linea Corregida: </span>
                      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e1e4e8', fontSize: '16px' }}>
                        <SyntaxHighlighter
                          language="python"
                          style={oneLight}
                          customStyle={{
                            margin: 0,
                            paddingRight: '20px',
                            backgroundColor: '#f8f9fa',
                          }}
                          showLineNumbers={true}
                          startingLineNumber={item.line || 1}
                        >
                          {item.correccion || "aaasql_query = fSELECT username FROM users WHERE username = '{username}' AND password = '{password}'"}
                        </SyntaxHighlighter>
                      </div>

                      <div className="path-wrapper">
                        <span className="file-path">
                          {item.path || "src/api/v1/auth_controller.py"}
                        </span>
                      </div>

                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      ))
      }
    </div >
  );
};

const RiskBadge = ({ label, value }) => {
  const color = getSeverityColor(value);
  return (
    <div className='column-row'>
      {/* Label)*/}
      <span className="column-label"> {label}: </span>

      {/* Value */}
      <span className="column-value" style={{ color: color, backgroundColor: `${color}15` }}>
        {value}
      </span>
    </div>
  );
};

const getSeverityColor = (value) => {
  const val = value?.toUpperCase();
  switch (val) {
    case 'HIGH':
      return '#ff4d4d'; // Rojo
    case 'MEDIUM':
      return '#ffcc00'; // Amarillo/Dorado
    case 'LOW':
      return '#00cc66'; // Verde
  }
};

const BotonDescargaPdf = ({ vulnList, rutaCarpeta }) => {

  const descargarPdf = async () => {
    //! CLAVE:: window.open('/ruta/a/tu/archivo.pdf', '_blank');
    alert("Iniciando descarga de PDF...");

    const resultPDF = await window.electronAPI.procesarPDF(vulnList, rutaCarpeta);

    if (!resultPDF.success) {
      alert("Error: " + result.error);
    }

  };

  return (
    <button
      className="boton-flotante-pdf"
      onClick={descargarPdf}
      title="Descargar documento PDF"
      aria-label="Descargar PDF"
    >
      {/* Icono de Descarga PDF (SVG) */}
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="icono-pdf"
      >
        <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />      </svg>
    </button>
  );
};