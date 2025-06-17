import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { getModelIcon } from "./ModelIcon";
import { Input } from "@/components/ui/input";

function ModelCard({
  name,
  description,
  model,
  modelId,
  provider,
  author,
  setCurrentModel,
  setPopoverOpen,
}: {
  name: string;
  description: string;
  model: string;
  modelId: string;
  provider: string;
  author: string;
  setCurrentModel: (modelId: string) => void;
  setPopoverOpen: (open: boolean) => void;
}) {
  const onClick = useCallback(() => {
    Cookies.set("model", modelId);
    setCurrentModel(name);
    setPopoverOpen(false);
  }, [modelId, setCurrentModel, name, setPopoverOpen]);

  return (
    <div
      onClick={onClick}
      className="group relative p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 cursor-pointer"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getModelIcon(provider, author)}
            <h3 className="font-semibold text-card-foreground group-hover:text-accent-foreground text-sm leading-tight truncate">
              {name}
            </h3>
          </div>
        </div>

        {description && (
          <p className="text-xs text-muted-foreground group-hover:text-accent-foreground/80 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-mono text-muted-foreground/60 group-hover:text-foreground bg-muted px-2 py-1 rounded">
            {model}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              className="w-4 h-4 text-accent-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModelBrowser() {
  const models = useQuery(api.generate.GetModels, {});
  const [, setCurrentModel] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [search, setSearch] = useState("");
  const currentModelID = Cookies.get("model");
  useEffect(() => {
    setCurrentModel(
      models?.find((model) => model._id === currentModelID)?.name ?? null,
    );
  }, [currentModelID, models]);

  /*
  const updateModels = useMutation(api.admin.updateModels);
  useEffect(() => {
    updateModels();
  }, [updateModels]);
  */

  if (!models) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
          <span className="text-sm">Loading models...</span>
        </div>
      </div>
    );
  }

  const filteredModels = models?.filter((model) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return model.name.toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col gap-4 ">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="w-9 h-9 flex items-center justify-center gap-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors p-0"
          >
            {getModelIcon(
              models.find((model) => model._id === currentModelID)?.provider ??
                "",
              models.find((model) => model._id === currentModelID)?.author ??
                "",
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0 " align="start">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-base text-foreground">
              Available Models
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a model to use for chat
            </p>
          </div>

          <div className="p-3 border-b border-border">
            <Input
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
          </div>

          <div className="max-h-96 overflow-y-auto no-scrollbar">
            {filteredModels?.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No models found
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {filteredModels?.map((model) => (
                  <ModelCard
                    key={model._id}
                    name={model.name}
                    description={model.description}
                    model={model.model}
                    modelId={model._id}
                    provider={model.provider}
                    author={model.author}
                    setCurrentModel={setCurrentModel}
                    setPopoverOpen={setPopoverOpen}
                  />
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
