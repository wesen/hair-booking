import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import * as yaml from "js-yaml";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check } from "lucide-react";
import type { DecisionTreeDSL, DecisionTreeState, SelectedService, DecisionTreeOption } from "@shared/types";

/**
 * Client intake interface for navigating decision trees
 * Displays questions, options, and dynamic pricing
 */
export default function Intake() {
  const [, params] = useRoute("/intake/:id");
  const [, setLocation] = useLocation();
  const treeId = params?.id ? parseInt(params.id) : null;

  const { data: tree, isLoading } = trpc.decisionTrees.getById.useQuery(
    { id: treeId! },
    { enabled: !!treeId }
  );

  const [dsl, setDsl] = useState<DecisionTreeDSL | null>(null);
  const [state, setState] = useState<DecisionTreeState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse DSL when tree loads
  useEffect(() => {
    if (!tree) return;

    try {
      const parsed = yaml.load(tree.dslContent) as DecisionTreeDSL;
      setDsl(parsed);

      // Initialize state
      setState({
        currentNodeId: parsed.root,
        selectedServices: [],
        totalPrice: 0,
        totalDuration: 0,
        appliedRules: [],
      });
    } catch (err) {
      setError(`Failed to parse decision tree: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [tree]);

  const handleOptionSelect = (option: DecisionTreeOption) => {
    if (!dsl || !state) return;

    const currentNode = dsl.nodes[state.currentNodeId];
    if (!currentNode) return;

    // Calculate price and duration
    const price = calculateOptionPrice(option, state);
    const duration = calculateOptionDuration(option);

    // Create selected service
    const selectedService: SelectedService = {
      nodeId: state.currentNodeId,
      question: currentNode.question,
      selectedOption: option,
      price,
      duration,
    };

    // Update state
    const newState: DecisionTreeState = {
      currentNodeId: option.next || state.currentNodeId,
      selectedServices: [...state.selectedServices, selectedService],
      totalPrice: state.totalPrice + price,
      totalDuration: state.totalDuration + duration,
      appliedRules: state.appliedRules,
    };

    setState(newState);

    // Check if we've reached terminal node
    if (option.next && dsl.nodes[option.next]?.type === "terminal") {
      // Save booking data to sessionStorage
      sessionStorage.setItem(
        `booking-${treeId}`,
        JSON.stringify({
          selectedServices: newState.selectedServices,
          totalPrice: newState.totalPrice,
          totalDuration: newState.totalDuration,
          appliedRules: newState.appliedRules,
        })
      );
      // Navigate to summary
      setLocation(`/summary/${treeId}`);
    }
  };

  const handleBack = () => {
    if (!state || state.selectedServices.length === 0) {
      setLocation("/");
      return;
    }

    // Remove last selection and go back
    const lastService = state.selectedServices[state.selectedServices.length - 1];
    const newState: DecisionTreeState = {
      currentNodeId: lastService.nodeId,
      selectedServices: state.selectedServices.slice(0, -1),
      totalPrice: state.totalPrice - lastService.price,
      totalDuration: state.totalDuration - lastService.duration,
      appliedRules: state.appliedRules,
    };
    setState(newState);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading decision tree...</p>
        </div>
      </div>
    );
  }

  if (error || !dsl || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Failed to load decision tree"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} variant="outline" className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentNode = dsl.nodes[state.currentNodeId];
  if (!currentNode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Invalid node state</p>
      </div>
    );
  }

  const progress = (state.selectedServices.length / Object.keys(dsl.nodes).length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with progress */}
      <div className="border-b border-border bg-card">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-medium text-foreground">{tree?.name}</h1>
              <p className="text-sm text-muted-foreground">
                {state.selectedServices.length} {state.selectedServices.length === 1 ? "service" : "services"} selected
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">${(state.totalPrice / 100).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">{formatDuration(state.totalDuration)}</div>
            </div>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Main content */}
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{currentNode.question}</CardTitle>
            {currentNode.optional && (
              <CardDescription>Optional - you can skip this step</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {currentNode.options && currentNode.options.length > 0 ? currentNode.options.map((option, index) => {
              const price = calculateOptionPrice(option, state);
              const duration = calculateOptionDuration(option);

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className="w-full text-left p-4 border border-border rounded hover:border-foreground hover:bg-accent/5 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-foreground group-hover:text-accent-foreground">
                        {option.label}
                      </div>
                      {option.note && (
                        <div className="text-sm text-muted-foreground mt-1">{option.note}</div>
                      )}
                      {duration > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDuration(duration)}
                        </div>
                      )}
                    </div>
                    {price > 0 && (
                      <div className="text-lg font-semibold text-foreground whitespace-nowrap">
                        ${(price / 100).toFixed(2)}
                      </div>
                    )}
                  </div>
                </button>
              );
            }) : (
              <p className="text-muted-foreground text-center py-4">No options available</p>
            )}
          </CardContent>
        </Card>

        {/* Selected services summary */}
        {state.selectedServices.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Selected Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {state.selectedServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-foreground">{service.selectedOption.label}</span>
                    </div>
                    {service.price > 0 && (
                      <span className="text-muted-foreground">${(service.price / 100).toFixed(2)}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper functions (matching server-side logic)

function parseDuration(duration: string): number {
  let minutes = 0;
  const hrMatch = duration.match(/(\d+)\s*hr/i);
  if (hrMatch) minutes += parseInt(hrMatch[1]) * 60;
  const minMatch = duration.match(/(\d+)\s*min/i);
  if (minMatch) minutes += parseInt(minMatch[1]);
  return minutes;
}

function hasCutService(services: SelectedService[]): boolean {
  return services.some(
    s =>
      s.question.toLowerCase().includes("cut") ||
      s.selectedOption.label.toLowerCase().includes("cut")
  );
}

function calculateOptionPrice(option: DecisionTreeOption, state: DecisionTreeState): number {
  if (option.price_with_cut !== undefined && hasCutService(state.selectedServices)) {
    return option.price_with_cut;
  }
  return option.price || 0;
}

function calculateOptionDuration(option: DecisionTreeOption): number {
  if (option.books_for) return parseDuration(option.books_for);
  if (option.duration) return parseDuration(option.duration);
  return 0;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}hr`;
  return `${hours}hr ${mins}min`;
}
