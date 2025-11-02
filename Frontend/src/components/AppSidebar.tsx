import { Home, List, TrendingUp, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { mockUser } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSidebar } from "@/contexts/SidebarContext";

export const AppSidebar = () => {
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "All Questions", url: "/questions", icon: List },
    { title: "My Progress", url: "/progress", icon: TrendingUp },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/auth");
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out z-50",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn(
        "border-b border-sidebar-border flex items-center justify-between",
        isCollapsed ? "p-4" : "p-6"
      )}>
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-primary">SystemDesign.io</h1>
            <p className="text-xs text-muted-foreground mt-1">Master system design</p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-lg text-sm font-medium transition-smooth",
                isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
            title={isCollapsed ? item.title : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center rounded-lg bg-sidebar-accent",
          isCollapsed ? "justify-center p-2" : "gap-3 p-3"
        )}>
          <img
            src={mockUser.avatar}
            alt={mockUser.name}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {mockUser.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{mockUser.email}</p>
            </div>
          )}
        </div>
        
        {/* Theme Toggle */}
        {!isCollapsed && (
          <div className="mt-2">
            <ThemeToggle />
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center text-sm text-muted-foreground hover:text-foreground transition-smooth mt-2",
            isCollapsed ? "justify-center p-2" : "gap-2 px-4 py-2"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
