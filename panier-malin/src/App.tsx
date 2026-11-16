import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import { DataProvider } from './data/DataContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { PromotionsPage } from './pages/PromotionsPage';
import { ComparePage } from './pages/ComparePage';
import { ShoppingListPage } from './pages/ShoppingListPage';
import { BasketPage } from './pages/BasketPage';
import { AdminPage } from './pages/AdminPage';
import { SourcesPage } from './pages/SourcesPage';
import { EmptyState } from './components/ui';

function NotFound() {
  return (
    <EmptyState title="Page introuvable" icon="🧭">
      <Link to="/" className="btn-primary mt-2">
        Retour à l’accueil
      </Link>
    </EmptyState>
  );
}

/** HashRouter : compatible GitHub Pages sans configuration serveur (pas de 404 au rechargement). */
export function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="comparer" element={<ComparePage />} />
            <Route path="liste" element={<ShoppingListPage />} />
            <Route path="panier" element={<BasketPage />} />
            <Route path="sources" element={<SourcesPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  );
}
