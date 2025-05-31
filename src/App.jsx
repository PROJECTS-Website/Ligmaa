// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import HomePage from './pages/HomePage';
import BottomNav from './components/BottomNav.jsx';
import DetailsPage from './pages/DetailsPage';
import Header from './components/Header';
import SearchPage from './pages/SearchPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
// import DetailsPage from './pages/DetailsPage/DetailsPage'; // Create later
// import NotFoundPage from './pages/NotFoundPage/NotFoundPage'; // Create later

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="bg-brand-bg min-h-screen text-brand-text-primary">
          {/* <Header /> */}
          {/* Header/Desktop Nav could go here if not using CategoryFilter as main nav */}
          <main className="max-w-7xl mx-auto">
            {' '}
            {/* Optional: Constrain width on larger screens */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/:mediaType/:id" element={<DetailsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/explore/:query" element={<ExplorePage />} />
              {/* <Route path="/menu" element={<div>Menu Page (placeholder)</div>} /> */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
          </main>
          <BottomNav />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
