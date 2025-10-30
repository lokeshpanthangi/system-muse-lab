import { Home, List, TrendingUp, Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { mockUser } from "@/data/mockData";
import { cn } from "@/lib/utils";

export const AppSidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "All Questions", url: "/questions", icon: List },
    { title: "My Progress", url: "/progress", icon: TrendingUp },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/auth");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-primary">SystemDesign.io</h1>
        <p className="text-xs text-muted-foreground mt-1">Master system design</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
          <img
            src={mockUser.avatar}
            alt={mockUser.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {mockUser.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{mockUser.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 mt-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
