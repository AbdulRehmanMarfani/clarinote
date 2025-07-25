import { AppShell } from "@/components/AppShell";
import { ImportDeckClient } from "@/components/flashcards/ImportDeckClient";

export default function ImportPage() {
    return (
        <AppShell>
            <div className="container mx-auto px-4 py-8">
                <ImportDeckClient />
            </div>
        </AppShell>
    );
}
