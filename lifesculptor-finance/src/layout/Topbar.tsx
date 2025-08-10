import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Topbar() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <div className="text-sm text-neutral-400">Finance</div>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={() => navigate("/transactions")} className="h-9">
            Add Transaction
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/accounts")}
            className="h-9"
          >
            Add Account
          </Button>
        </div>
      </div>
    </header>
  );
}
