import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavbarModern from "./navbar/NavbarModern";
import SidebarModern from "./sidebar/SidebarModern";
import routesModern, { detailRoutes } from "../../routes/superadminModern";

export default function SuperAdminLayoutModern(props) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const [currentRoute, setCurrentRoute] = React.useState("Bosh sahifa");

  React.useEffect(() => {
    window.addEventListener("resize", () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );
  }, []);

  React.useEffect(() => {
    getActiveRoute(routesModern);
  }, [location.pathname]);

  const getActiveRoute = (routes) => {
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(
          routes[i].layout + "/" + routes[i].path
        ) !== -1
      ) {
        setCurrentRoute(routes[i].name);
        return;
      }
    }
  };

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/superadmin") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      }
      return null;
    });
  };

  const getDetailRoutes = (routes) => {
    return routes.map((prop, key) => {
      return (
        <Route path={`/${prop.path}`} element={prop.component} key={key} />
      );
    });
  };

  document.documentElement.dir = "ltr";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <SidebarModern open={open} onClose={() => setOpen(false)} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <NavbarModern
          onOpenSidenav={() => setOpen(true)}
          logoText=""
          brandText={currentRoute}
          {...rest}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Routes */}
            <Routes>
              {getRoutes(routesModern)}
              {getDetailRoutes(detailRoutes)}
              <Route
                path="/"
                element={<Navigate to="/superadmin/default" replace />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

