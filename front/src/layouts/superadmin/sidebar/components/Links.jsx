/* eslint-disable */
import React from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import DashIcon from "components/icons/DashIcon";

export function SidebarLinks(props) {
  let location = useLocation();
  const { routes } = props;

  // checks if route is active (also works with /:id)
  const activeRoute = (fullPath) => {
    return matchPath(
      { path: fullPath, end: false }, // end:false → boshlanishiga qaraydi
      location.pathname
    );
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.layout === "/superadmin") {
        const fullPath = route.layout + "/" + route.path;

        return (
          <Link key={index} to={fullPath}>
            <div className="relative mb-3 flex hover:cursor-pointer">
              <li
                className="flex cursor-pointer items-center px-8"
                key={index}
              >
                <span
                  className={`${activeRoute(fullPath)
                      ? "font-bold text-brand-500 dark:text-white"
                      : "font-medium text-gray-600"
                    }`}
                >
                  {route.icon ? route.icon : <DashIcon />}
                </span>
                <p
                  className={`leading-1 ml-4 flex ${activeRoute(fullPath)
                      ? "font-bold text-navy-700 dark:text-white"
                      : "font-medium text-gray-600"
                    }`}
                >
                  {route.name}
                </p>
              </li>
              {activeRoute(fullPath) ? (
                <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
              ) : null}
            </div>
          </Link>
        );
      }
      return null;
    });
  };

  return createLinks(routes);
}

export default SidebarLinks;
