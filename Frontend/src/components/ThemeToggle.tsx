import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    if (theme === "light") {
      return <Sun className="h-4 w-4" />;
    } else if (theme === "dark") {
      return <Moon className="h-4 w-4" />;
    } else {
      return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    if (theme === "light") return "Light";
    if (theme === "dark") return "Dark";
    return "System";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="w-full justify-start gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
    >
      {getThemeIcon()}
      <span>{getThemeLabel()}</span>
    </Button>
  );
}