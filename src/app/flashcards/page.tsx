import { AppShell } from "@/components/AppShell";
import { FlashcardsClient } from "@/components/flashcards/FlashcardsClient";

export default function FlashcardsPage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <FlashcardsClient />
      </div>
    </AppShell>
  );
}
