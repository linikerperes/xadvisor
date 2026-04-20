import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface AIAnalysisResult {
  response: string;
  loading: boolean;
  error: string | null;
}

export function useAIAnalysis() {
  const [result, setResult] = useState<AIAnalysisResult>({
    response: "",
    loading: false,
    error: null,
  });

  const mutation = trpc.ai.analyze.useMutation({
    onSuccess: (data) => {
      setResult({ response: data.response, loading: false, error: null });
    },
    onError: (err) => {
      setResult({
        response: "",
        loading: false,
        error: err.message || "Erro ao conectar com a IA",
      });
    },
  });

  const analyze = async (prompt: string, context: string) => {
    setResult({ response: "", loading: true, error: null });
    mutation.mutate({ prompt, context });
  };

  return { ...result, analyze };
}
