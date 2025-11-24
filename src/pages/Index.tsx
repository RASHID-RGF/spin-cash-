import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Coins, TrendingUp, Users, Zap, Sparkles } from "lucide-react";
import bgImage from "@/assets/RASHID.jpeg";
import moneyImage from "@/assets/Money Realistic Pictures.jpeg";
import affiliateImage from "@/assets/Affiliate Marketing Legal MUST-KNOWS (FTC).jpeg";
import referralImage from "@/assets/How to Make Money From Home _ Free Money Hacks & Get $1000 Free Cash.jpeg";
import withdrawalImage from "@/assets/_.jpeg";
import educationImage from "@/assets/The Flow of Wealth.jpeg";
import updatesImage from "@/assets/werew.jpeg";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [expandedFeature, setExpandedFeature] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 -z-10">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-block animate-float">
            <div className="relative">
              <Sparkles className="w-20 h-20 text-accent animate-glow" />
              <div className="absolute inset-0 blur-xl bg-accent/50 rounded-full" />
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent animate-fade-in">
            Spincash Agencies
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Turn your network into profit. Earn commissions, bonuses, and rewards through our revolutionary affiliate system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6 rounded-full shadow-glass"
              onClick={() => navigate("/signup")}
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Earning Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary/50 hover:bg-primary/10 text-lg px-8 py-6 rounded-full backdrop-blur-sm"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <div className="backdrop-blur-md bg-card/50 border border-border/50 rounded-2xl p-6 hover:scale-105 transition-transform shadow-glass">
              <Coins className="w-12 h-12 text-accent mb-4 mx-auto" />
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">100 KES</div>
              <div className="text-muted-foreground">Registration Fee</div>
            </div>
            <div className="backdrop-blur-md bg-card/50 border border-border/50 rounded-2xl p-6 hover:scale-105 transition-transform shadow-glass">
              <TrendingUp className="w-12 h-12 text-primary mb-4 mx-auto" />
              <div className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">Unlimited</div>
              <div className="text-muted-foreground">Earning Potential</div>
            </div>
            <div className="backdrop-blur-md bg-card/50 border border-border/50 rounded-2xl p-6 hover:scale-105 transition-transform shadow-glass">
              <Users className="w-12 h-12 text-secondary mb-4 mx-auto" />
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">2 Levels</div>
              <div className="text-muted-foreground">Referral System</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-muted-foreground">Join thousands earning with Spincash Agencies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              initials: "WB",
              src: moneyImage,
              title: "Welcome Bonus",
              description: "Get rewarded instantly when you join our community",
              details: "Receive a 50 KES welcome bonus immediately upon registration. This bonus can be used to start earning right away through our affiliate system and helps you get familiar with our platform."
            },
            {
              initials: "FS",
              src: affiliateImage,
              title: "Free Spins",
              description: "Win exciting prizes with our casino-style spin wheel",
              details: "Spin our virtual wheel daily to win prizes ranging from cash rewards to bonus multipliers. Each spin costs 10 KES, but winnings can be substantial! It's an entertaining way to potentially boost your earnings."
            },
            {
              initials: "RE",
              src: referralImage,
              title: "Referral Earnings",
              description: "Earn commissions from 2 levels of referrals",
              details: "Earn 20% commission on your direct referrals' earnings and 10% on their referrals. Build your network and watch your income grow exponentially through our powerful 2-level referral system."
            },
            {
              initials: "EW",
              src: withdrawalImage,
              title: "Easy Withdrawals",
              description: "Cash out via MPESA with just 150 KES minimum",
              details: "Withdraw your earnings anytime with a minimum of 150 KES. Funds are processed via MPESA within 24 hours. No hidden fees, fast and secure transactions to get your money when you need it."
            },
            {
              initials: "EC",
              src: educationImage,
              title: "Educational Content",
              description: "Access forex classes, quizzes, and valuable resources",
              details: "Access comprehensive forex trading courses, take interactive quizzes, and learn from expert traders. Knowledge is power in the financial markets - equip yourself with the skills to maximize your earnings."
            },
            {
              initials: "IU",
              src: updatesImage,
              title: "Instant Updates",
              description: "Real-time notifications and earnings tracking",
              details: "Get real-time notifications about your earnings, new opportunities, and system updates. Stay informed and maximize your potential with instant alerts on all important activities."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="backdrop-blur-md bg-card/50 border border-border/50 rounded-2xl p-8 hover:scale-105 transition-all shadow-glass group"
            >
              <Avatar className="w-16 h-16 mb-4">
                {feature.src && <AvatarImage src={feature.src} />}
                <AvatarFallback className="bg-primary text-white">{feature.initials}</AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              {expandedFeature === feature && (
                <p className="text-muted-foreground mb-4 text-sm">{feature.details}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setExpandedFeature(expandedFeature === feature ? null : feature)}
              >
                {expandedFeature === feature ? "Show Less" : "Show More"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="backdrop-blur-md bg-gradient-primary rounded-3xl p-12 text-center shadow-glass relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-accent opacity-50 animate-pulse-slow" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Transform Your Income?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join Spincash Agencies today for just 100 KES and unlock unlimited earning potential
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-full"
              onClick={() => navigate("/signup")}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 Spincash Agencies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
