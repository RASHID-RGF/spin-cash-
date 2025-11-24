import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Home } from "lucide-react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    profileName?: string;
    profileImage?: string;
}

const PageHeader = ({ title, subtitle, profileName = "User", profileImage }: PageHeaderProps) => {
    const navigate = useNavigate();

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="border-b border-border/50 backdrop-blur-md bg-card/30 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-primary">
                            <AvatarImage src={profileImage || "/RASHID.jpeg"} alt={profileName} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(profileName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                                {title}
                            </h1>
                            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/dashboard")}
                            className="hover:bg-primary/10"
                        >
                            <Home className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PageHeader;
