import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "../cart/CartDrawer";

export function PublicLayout() {
  return (
    // overflow-x-clip : le hero full-bleed fait 100vw (barre de defilement comprise
    // sous Windows) ; on coupe le depassement pour eviter un scroll horizontal parasite.
    <div className="flex min-h-screen flex-col overflow-x-clip bg-canvas">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
