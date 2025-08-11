import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "block px-3 py-2 rounded-md text-sm font-medium",
      isActive
        ? "bg-neutral-800 text-white"
        : "text-neutral-300 hover:bg-neutral-800 hover:text-white",
    ].join(" ");

  return (
    <div className="w-full">
      <div className="text-lg font-bold mb-4">LifeSculptor · Finance</div>

      <nav className="space-y-1">
        <NavLink end to="/" className={linkClass}>
          LifeSculptor · Finance
        </NavLink>
        {/* Use absolute paths to avoid path-append behaviour */}
        <NavLink end to="/finance" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/finance/accounts" className={linkClass}>
          Accounts
        </NavLink>
        <NavLink to="/finance/transactions" className={linkClass}>
          Transactions
        </NavLink>
        <NavLink to="/finance/forecast" className={linkClass}>
          Forecast
        </NavLink>
        <NavLink to="/finance/settings" className={linkClass}>
          Settings
        </NavLink>
      </nav>
    </div>
  );
}
