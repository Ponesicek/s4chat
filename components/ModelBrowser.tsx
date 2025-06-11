import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

function ModelCard({
  name,
  description,
  model,
  modelId,
  setCurrentModel,
}: {
  name: string;
  description: string;
  model: string;
  modelId: string;
  setCurrentModel: (modelId: string) => void;
}) {
  const onClick = useCallback(() => {
    Cookies.set("model", modelId);
    setCurrentModel(name);
  }, [modelId, setCurrentModel, name]);

  return (
    <div
      onClick={onClick}
      className="group relative p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 cursor-pointer"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-card-foreground group-hover:text-accent-foreground text-sm leading-tight">
            {name}
          </h3>
          <div className="flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        {description && (
          <p className="text-xs text-muted-foreground group-hover:text-accent-foreground/80 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-mono text-muted-foreground/60 group-hover:text-accent-foreground/60 bg-muted px-2 py-1 rounded">
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
  const modelsMemo = useMemo(() => models, [models]);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const currentModelID = Cookies.get("model");
  useEffect(() => {
    setCurrentModel(modelsMemo?.find((model) => model._id === currentModelID)?.name ?? null);
  }, [currentModelID, modelsMemo]);

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

  return (
    <div className="flex flex-col gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-fit flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {currentModel ? currentModel : "Select Model"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-base text-foreground">
              Available Models
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a model to use for chat
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {modelsMemo?.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-3m-13 0h3m-3 0v-3m0 3v3"
                    />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  No models available
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {modelsMemo?.map((model) => (
                  <ModelCard
                    key={model._id}
                    name={model.name}
                    description={model.description}
                    model={model.model}
                    modelId={model._id}
                    setCurrentModel={setCurrentModel}
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
