import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "./components/layout/PublicLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { RequireAdmin } from "./components/layout/RequireAdmin";
import { CatalogPage } from "./pages/public/CatalogPage";
import { ProductDetailPage } from "./pages/public/ProductDetailPage";
import { OrderConfirmationPage } from "./pages/public/OrderConfirmationPage";
import { LoginPage } from "./pages/admin/LoginPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { ProductListPage } from "./pages/admin/ProductListPage";
import { ProductCreatePage } from "./pages/admin/ProductCreatePage";
import { ProductEditPage } from "./pages/admin/ProductEditPage";
import { ExcelImportPage } from "./pages/admin/ExcelImportPage";
import { OrdersPage } from "./pages/admin/OrdersPage";
import { WilayasPage } from "./pages/admin/WilayasPage";
import { CategoriesPage } from "./pages/admin/CategoriesPage";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/categorie/:slug" element={<CatalogPage />} />
        <Route path="/produit/:slug" element={<ProductDetailPage />} />
        <Route path="/commande/:id/confirmation" element={<OrderConfirmationPage />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="commandes" element={<OrdersPage />} />
        <Route path="produits" element={<ProductListPage />} />
        <Route path="produits/nouveau" element={<ProductCreatePage />} />
        <Route path="produits/import" element={<ExcelImportPage />} />
        <Route path="produits/:id" element={<ProductEditPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="wilayas" element={<WilayasPage />} />
      </Route>
    </Routes>
  );
}

export default App;
