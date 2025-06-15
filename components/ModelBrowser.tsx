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

const getModelIcon = (provider: string, author: string) => {
  if (
    provider === "openrouter" &&
    (author.toLowerCase().includes("openai") || author === "OpenAI")
  ) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center">
        <svg
          className="w-10 h-10 text-foreground"
          fill="currentColor"
          viewBox="118 118 500 500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M304.246 294.611V249.028C304.246 245.189 305.687 242.309 309.044 240.392L400.692 187.612C413.167 180.415 428.042 177.058 443.394 177.058C500.971 177.058 537.44 221.682 537.44 269.182C537.44 272.54 537.44 276.379 536.959 280.218L441.954 224.558C436.197 221.201 430.437 221.201 424.68 224.558L304.246 294.611ZM518.245 472.145V363.224C518.245 356.505 515.364 351.707 509.608 348.349L389.174 278.296L428.519 255.743C431.877 253.826 434.757 253.826 438.115 255.743L529.762 308.523C556.154 323.879 573.905 356.505 573.905 388.171C573.905 424.636 552.315 458.225 518.245 472.141V472.145ZM275.937 376.182L236.592 353.152C233.235 351.235 231.794 348.354 231.794 344.515V238.956C231.794 187.617 271.139 148.749 324.4 148.749C344.555 148.749 363.264 155.468 379.102 167.463L284.578 222.164C278.822 225.521 275.942 230.319 275.942 237.039V376.186L275.937 376.182ZM360.626 425.122L304.246 393.455V326.283L360.626 294.616L417.002 326.283V393.455L360.626 425.122ZM396.852 570.989C376.698 570.989 357.989 564.27 342.151 552.276L436.674 497.574C442.431 494.217 445.311 489.419 445.311 482.699V343.552L485.138 366.582C488.495 368.499 489.936 371.379 489.936 375.219V480.778C489.936 532.117 450.109 570.985 396.852 570.985V570.989ZM283.134 463.99L191.486 411.211C165.094 395.854 147.343 363.229 147.343 331.562C147.343 294.616 169.415 261.509 203.48 247.593V356.991C203.48 363.71 206.361 368.508 212.117 371.866L332.074 441.437L292.729 463.99C289.372 465.907 286.491 465.907 283.134 463.99ZM277.859 542.68C223.639 542.68 183.813 501.895 183.813 451.514C183.813 447.675 184.294 443.836 184.771 439.997L279.295 494.698C285.051 498.056 290.812 498.056 296.568 494.698L417.002 425.127V470.71C417.002 474.549 415.562 477.429 412.204 479.346L320.557 532.126C308.081 539.323 293.206 542.68 277.854 542.68H277.859ZM396.852 599.776C454.911 599.776 503.37 558.513 514.41 503.812C568.149 489.896 602.696 439.515 602.696 388.176C602.696 354.587 588.303 321.962 562.392 298.45C564.791 288.373 566.231 278.296 566.231 268.224C566.231 199.611 510.571 148.267 446.274 148.267C433.322 148.267 420.846 150.184 408.37 154.505C386.775 133.392 357.026 119.958 324.4 119.958C266.342 119.958 217.883 161.22 206.843 215.921C153.104 229.837 118.557 280.218 118.557 331.557C118.557 365.146 132.95 397.771 158.861 421.283C156.462 431.36 155.022 441.437 155.022 451.51C155.022 520.123 210.682 571.466 274.978 571.466C287.931 571.466 300.407 569.549 312.883 565.228C334.473 586.341 364.222 599.776 396.852 599.776Z" />
        </svg>
      </div>
    );
  }

  // Check for Google/Gemini models
  if (provider === "google" || author === "Google") {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center">
        <svg
          className="w-7 h-7 text-foreground"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" />
        </svg>
      </div>
    );
  }

  // Check for Anthropic/Claude models
  if (provider === "anthropic" || author === "Anthropic") {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center">
        <svg
          className="w-7 h-7 text-foreground"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
        </svg>
      </div>
    );
  }

  // Default AI icon
  return (
    <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center">
      <svg
        className="w-6 h-6 text-foreground"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    </div>
  );
};

function ModelCard({
  name,
  description,
  model,
  modelId,
  provider,
  author,
  setCurrentModel,
}: {
  name: string;
  description: string;
  model: string;
  modelId: string;
  provider: string;
  author: string;
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

  return (
    <div className="flex flex-col gap-4">
      <Popover>
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
            {models?.length === 0 ? (
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
                {models?.map((model) => (
                  <ModelCard
                    key={model._id}
                    name={model.name}
                    description={model.description}
                    model={model.model}
                    modelId={model._id}
                    provider={model.provider}
                    author={model.author}
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
