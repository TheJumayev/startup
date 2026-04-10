import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import Footer from "components/footer/Footer";
import routes from "../../routes/student";
import ApiCall from "config";

export default function Student(props) {
  const { ...rest } = props;
  const location = useLocation();
  const navigate = useNavigate();

  // 📌 Mobil qurilma tekshirish
  const isMobileDevice = () => {
    return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent
    );
  };

  // 📌 Cookie o‘rnatish
  const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  };

  // 📌 Cookie o‘qish
  const getCookie = (name) => {
    const cname = name + "=";
    const decoded = decodeURIComponent(document.cookie);
    const arr = decoded.split("; ");
    for (let c of arr) {
      if (c.indexOf(cname) === 0) {
        return c.substring(cname.length, c.length);
      }
    }
    return null;
  };

  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState("Bosh sahifa");
  const [user, setUser] = React.useState(null);
  const [showWeeklyModal, setShowWeeklyModal] = React.useState(false);

  // 📌 Haftalik tasdiqlashni cookie orqali tekshirish
  React.useEffect(() => {
    if (!isMobileDevice()) return;

    const lastConfirm = getCookie("weeklyConfirmDate");

    if (!lastConfirm) {
      setShowWeeklyModal(true);
      return;
    }

    const last = new Date(lastConfirm).getTime();
    const now = Date.now();
    const diffMs = now - last;

    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (diffMs >= sevenDays) {
      setShowWeeklyModal(true);
    }
  }, [user]);

  // 📌 Haftalik tasdiqlashni yozish (COOKIE)
  const handleWeeklyConfirm = () => {
    setCookie("weeklyConfirmDate", new Date().toISOString(), 7);
    setShowWeeklyModal(false);
  };

  // 📌 Student ma'lumotlarini olish
  const fetchData = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await ApiCall(
        "/api/v1/student/account/all/me/" + token,
        "GET"
      );
      setUser(response.data);
    } catch (error) {
      navigate("/student/login");
      console.error("Error fetching student data:", error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // 📌 Sidebar resize
  React.useEffect(() => {
    const onResize = () => setOpen(window.innerWidth >= 1200);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    getActiveRoute(routes);
  }, [location.pathname]);

  const getActiveRoute = (routes) => {
    let activeRoute = "Bosh sahifa";
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(
          routes[i].layout + "/" + routes[i].path
        ) !== -1
      ) {
        setCurrentRoute(routes[i].name);
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].secondary;
      }
    }
    return activeNavbar;
  };

  const getRoutes = (routes) => {
    const online = user?.isOnline === true;
    return routes.map((prop, key) => {
      if (prop.layout === "/student") {
        if (prop.isOnline && !online) {
          return null;
        }
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = "ltr";

  return (
    <div className="flex h-full w-full">
      {showWeeklyModal && (
        <div className="bg-black/50 fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="w-[90%] max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-3 text-center text-lg font-semibold">
              Haftalik Tasdiqlash
            </h2>
            <p className="mb-4 text-center text-gray-600">
              Ilova sizning mobil qurilmangizdan foydalanayotganingizni
              tasdiqlang.
            </p>

            <a
              href="https://t.me/bxu_uz"
              target="_blank"
              onClick={() => {
                // kanalga o'tilganda cookie yozish
                setCookie("weeklyConfirmDate", new Date().toISOString(), 7);

                // modalni yopish
                setShowWeeklyModal(false);
              }}
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700"
            >
              Telegram kanalga o‘tish
            </a>
          </div>
        </div>
      )}

      <Sidebar open={open} onClose={() => setOpen(false)} user={user} />

      <div className="h-full w-full bg-lightPrimary dark:!bg-navy-900">
        <main className="mx-[12px] h-full flex-none transition-all md:pr-2 xl:ml-[313px]">
          <div className="h-full">
            <Navbar
              onToggleSidenav={() => setOpen((prev) => !prev)}
              logoText={""}
              brandText={currentRoute}
              secondary={getActiveNavbar(routes)}
              user={user}
            />

            <div className="pt-5s mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
              <Routes>
                {getRoutes(routes)}
                <Route
                  path="/"
                  element={<Navigate to="/student/default" replace />}
                />
              </Routes>
            </div>

            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
