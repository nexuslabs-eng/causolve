import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AuthBackButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export const AuthBackButton = ({ disabled = false, onClick }: AuthBackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="ghost"
      disabled={disabled}
      onClick={onClick ?? (() => navigate(-1))}
      className="mb-6 gap-2 px-2 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft aria-hidden="true" />
      Back
    </Button>
  );
};
