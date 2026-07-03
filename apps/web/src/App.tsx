import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Recommendations } from "./pages/Recommendations";
import { Resources } from "./pages/Resources";
import { Leaderboard } from "./pages/Leaderboard";
import { AppStateProvider } from "./lib/appState";

function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="resources" element={<Resources />} />
            <Route path="teams" element={<Leaderboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
