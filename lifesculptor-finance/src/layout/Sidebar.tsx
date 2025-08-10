import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass =
    "block px-3 py-2 rounded-md text-sm font-medium hover:bg-neutral-800 aria-[current=page]:bg-neutral-800";

  return (
    <aside className="w-64 border-r border-neutral-800 p-4 hidden md:block">
      <div className="text-lg font-bold mb-4">LifeSculptor · Finance</div>
      <nav className="space-y-1">
        <NavLink to="/" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/accounts" className={linkClass}>
          Accounts
        </NavLink>
        <NavLink to="/transactions" className={linkClass}>
          Transactions
        </NavLink>
        <NavLink to="/forecast" className={linkClass}>
          Forecast
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}
