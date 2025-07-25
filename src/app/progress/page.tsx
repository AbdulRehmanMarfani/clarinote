import { AppShell } from "@/components/AppShell";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

export default function ProgressPage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <ProgressDashboard />
      </div>
    </AppShell>
  );
}
