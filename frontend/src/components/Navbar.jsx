import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Badge from "./Badge";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  const mobileNavLinkClass = (path) =>
    `block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
      isActive(path)
        ? "bg-indigo-50 text-indigo-700 font-semibold"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to={user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <span>Trucksy</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-1.5">
            {user ? (
              <>
                <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                  Dashboard
                </Link>

                {user.role === "driver" && (
                  <Link to="/my-routes" className={navLinkClass("/my-routes")}>
                    My Routes
                  </Link>
                )}

                {user.role === "business" && (
                  <Link to="/my-shipments" className={navLinkClass("/my-shipments")}>
                    My Shipments
                  </Link>
                )}

                <Link to="/bookings" className={navLinkClass("/bookings")}>
                  Bookings
                </Link>

                <Link to="/history" className={navLinkClass("/history")}>
                  History
                </Link>

                <div className="h-5 w-px bg-slate-200 mx-2" />

                <div className="flex items-center gap-2 pl-1 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                    {(user.name || "U")[0]}
                  </div>
                  <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                    {user.name || "User"}
                  </span>
                  <Badge status={user.role} />
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {user ? (
            <>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl mb-3 border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm uppercase">
                  {(user.name || "U")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <Badge status={user.role} />
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/dashboard")}
              >
                Dashboard
              </Link>

              {user.role === "driver" && (
                <Link
                  to="/my-routes"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass("/my-routes")}
                >
                  My Routes
                </Link>
              )}

              {user.role === "business" && (
                <Link
                  to="/my-shipments"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass("/my-shipments")}
                >
                  My Shipments
                </Link>
              )}

              <Link
                to="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/bookings")}
              >
                Bookings
              </Link>

              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/history")}
              >
                History
              </Link>

              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
