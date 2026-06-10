import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export function ThemeShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <ThemeProvider>{children}</ThemeProvider>
    </Suspense>
  );
}
