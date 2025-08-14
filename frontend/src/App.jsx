import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import MainPage from './components/pages/MainPage.jsx';
import PageNotFound from './components/pages/PageNotFound.jsx';

export default function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<MainPage/>}/>
              <Route path="*" element={<PageNotFound/>}/>
          </Routes>
      </Router>
  );
}

