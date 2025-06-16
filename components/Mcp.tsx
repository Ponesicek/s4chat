import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { getModelIcon } from "./ModelIcon";
import Cookies from "js-cookie";

export function Mcp() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const cookie = Cookies.get("mcp");
    if (cookie) {
      setIsEnabled(cookie === "true");
    }
    else {
      setIsEnabled(false);
      Cookies.set("mcp", "false");
    }
  }, []);

  const toggleMcp = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    console.log("Setting MCP state to", newState);
    Cookies.set("mcp", newState.toString());
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={`w-9 h-9 flex items-center border-0 border-border justify-center gap-2 rounded-lg transition-colors p-0 ${
              isEnabled 
                ? "bg-accent text-accent-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
            onClick={toggleMcp}
          >
            {getModelIcon("openrouter", "MCP")}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs bg-card border-border border-1">
          <div className="text-center">
            <p className="font-medium text-foreground">MCPs (Work in Progress)</p>
            <p className="text-xs text-muted-foreground mt-1">
              Currently supports: EXA (web search), Context7 (docs), and sequential thinking
            </p>
            <p className="text-xs text-destructive mt-1">(Do not panic, if it looks stuck)</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
