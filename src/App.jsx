import { useState } from 'react'
import { CustomeDropdown } from './components/dropdown.jsx';
import { WebLocation, FolderSelector, AgentSelector, NeightnLocation, PlayLoading } from './components/option_items.jsx';
import { Header } from './components/header.jsx';

import './App.css'

export function App() {

  const [teoType, setTeoType] = useState(0)


  return (
    <>
      <Header />

      <div class="contenedor">
        <WebLocation />
        <FolderSelector />
        <NeightnLocation />
        <AgentSelector />
        <PlayLoading />
      </div>

    </>
  )
}


