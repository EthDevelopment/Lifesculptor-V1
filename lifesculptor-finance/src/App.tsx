import "./App.css";

// src/App.tsx
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div className="p-10 bg-neutral-900 min-h-screen text-white">
      <Button variant="default">Default</Button>
      <Button variant="secondary" className="ml-2">
        Secondary
      </Button>
    </div>
  );
}
