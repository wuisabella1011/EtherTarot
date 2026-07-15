import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import EffectsLayer from './components/Effects/EffectsLayer';
import HomePage from './pages/HomePage';
import ReadingPage from './pages/ReadingPage';

export default function App() {
  return (
    <>
      <EffectsLayer />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reading" element={<ReadingPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
