import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          navigate("/login");
          return;
        }

        if (session) {
          // Check if there's a referral code in the URL
          const refCode = searchParams.get("ref");
          
          if (refCode) {
            // Update the profile with referral code if it's a new user
            const { data: profile } = await supabase
              .from("profiles")
              .select("referred_by")
              .eq("id", session.user.id)
              .single();

            // Only update if not already referred
            if (profile && !profile.referred_by) {
              // Find the referrer's ID by their referral code
              const { data: referrer } = await supabase
                .from("profiles")
                .select("id")
                .eq("referral_code", refCode)
                .single();

              if (referrer) {
                await supabase
                  .from("profiles")
                  .update({ referred_by: referrer.id })
                  .eq("id", session.user.id);
              }
            }
          }

          // Successfully authenticated, redirect to dashboard
          navigate("/dashboard");
        } else {
          // No session found, redirect to login
          navigate("/login");
        }
      } catch (error) {
        console.error("Unexpected error in auth callback:", error);
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <p className="text-lg text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;