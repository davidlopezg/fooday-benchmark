import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import DataEntry from './pages/DataEntry';
import Benchmark from './pages/Benchmark';
import Simulacion from './pages/Simulacion';
import Informe from './pages/Informe';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/fooday-benchmark">
        <Layout>
          <Routes>
            <Route path="/" element={<DataEntry />} />
            <Route path="/benchmark" element={<Benchmark />} />
            <Route path="/simulacion" element={<Simulacion />} />
            <Route path="/informe" element={<Informe />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
