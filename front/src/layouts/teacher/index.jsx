import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import TeacherNavbar from "./navbar/index";
import TeacherSidebar from "./sidebar/index";
import teacherRoutes, { teacherDetailRoutes } from "../../routes/teacher";

export default function TeacherLayout(props) {
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
    getActiveRoute(teacherRoutes);
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
      if (prop.layout === "/teacher") {
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
      <TeacherSidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TeacherNavbar
          onOpenSidenav={() => setOpen(true)}
          logoText=""
          brandText={currentRoute}
          {...rest}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Routes>
              {getRoutes(teacherRoutes)}
              {getDetailRoutes(teacherDetailRoutes)}
              <Route
                path="/"
                element={<Navigate to="/teacher/default" replace />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

