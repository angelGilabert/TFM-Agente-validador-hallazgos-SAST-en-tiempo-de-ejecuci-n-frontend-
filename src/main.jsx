import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.jsx'
import { HeroUIProvider } from "@heroui/react";

function Root() {
  return (
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  );
}

createRoot(document.getElementById('root')).render(<Root />);
