import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './view/home';
import 'tailwindcss/tailwind.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
