import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { Calculator, Trophy, Target, Zap, CheckCircle, XCircle, Clock, Award } from "lucide-react";

const MathQuiz = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [answers, setAnswers] = useState<{ questionId: number; answer: number }[]>([]);

    const questions = [
        {
            question: "Find the derivative of f(x) = 3x²",
            options: ["6x", "3x", "6x²", "3x²"],
            correct: 0,
            points: 15
        },
        {
            question: "What is d/dx(x³)?",
            options: ["x²", "3x²", "3x³", "x³/3"],
            correct: 1,
            points: 15
        },
        {
            question: "Find the derivative of f(x) = 5x⁴ + 2x²",
            options: ["20x³ + 4x", "5x³ + 2x", "20x⁴ + 4x²", "5x⁵ + 2x³"],
            correct: 0,
            points: 20
        },
        {
            question: "What is the limit: lim(x→0) (sin x)/x ?",
            options: ["0", "1", "∞", "undefined"],
            correct: 1,
            points: 20
        },
        {
            question: "Find d/dx(eˣ)",
            options: ["eˣ", "xeˣ⁻¹", "eˣ⁻¹", "ln(x)"],
            correct: 0,
            points: 20
        },
        {
            question: "What is the derivative of f(x) = ln(x)?",
            options: ["x", "1/x", "ln(x)/x", "eˣ"],
            correct: 1,
            points: 20
        },
        {
            question: "Find the integral: ∫ 2x dx",
            options: ["x²", "x² + C", "2x²", "2x² + C"],
            correct: 1,
            points: 25
        },
        {
            question: "What is d/dx(sin x)?",
            options: ["cos x", "-cos x", "sin x", "-sin x"],
            correct: 0,
            points: 20
        },
        {
            question: "Find the derivative of f(x) = x² · eˣ using the product rule",
            options: ["2x · eˣ", "x² · eˣ + 2x · eˣ", "x² · eˣ", "2x · eˣ + x²"],
            correct: 1,
            points: 25
        },
        {
            question: "What is the second derivative of f(x) = x³?",
            options: ["3x²", "6x", "x²", "3x"],
            correct: 1,
            points: 25
        },
        {
            question: "Find the derivative of f(x) = (3x + 2)⁴ using the chain rule",
            options: ["12(3x + 2)³", "4(3x + 2)³", "3(3x + 2)³", "12(3x + 2)⁴"],
            correct: 0,
            points: 30
        },
        {
            question: "Evaluate: ∫₀² x dx",
            options: ["1", "2", "3", "4"],
            correct: 1,
            points: 25
        }
    ];

    useEffect(() => {
        const initPage = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.user) {
                    navigate("/login");
                    return;
                }

                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                setProfile(profileData);

            } catch (error: any) {
                console.error("Error loading page:", error);
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [navigate]);

    useEffect(() => {
        if (quizStarted && !showResult && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && quizStarted) {
            handleNextQuestion();
        }
    }, [timeLeft, quizStarted, showResult]);

    const startQuiz = () => {
        setQuizStarted(true);
        setCurrentQuestion(0);
        setScore(0);
        setShowResult(false);
        setTimeLeft(30);
    };

    const handleAnswer = async (answerIndex: number) => {
        setSelectedAnswer(answerIndex);

        // Record answer
        setAnswers(prev => [...prev, { questionId: currentQuestion, answer: answerIndex }]);

        if (answerIndex === questions[currentQuestion].correct) {
            const pointsEarned = questions[currentQuestion].points;
            setScore(score + pointsEarned);

            toast({
                title: "Correct! ✅",
                description: `+${pointsEarned} points`,
            });
        } else {
            toast({
                title: "Wrong Answer ❌",
                description: "Better luck next time!",
                variant: "destructive",
            });
        }

        setTimeout(() => {
            handleNextQuestion();
        }, 1500);
    };

    const handleNextQuestion = async () => {
        setSelectedAnswer(null);
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setTimeLeft(30);
        } else {
            // Submit quiz to backend
            try {
                const response = await fetch('/api/games/quiz/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: profile?.id,
                        answers: answers.map(a => ({ questionId: a.questionId, answer: questions[a.questionId].options[a.answer] }))
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    toast({
                        title: "Quiz Submitted!",
                        description: data.message,
                    });
                } else {
                    throw new Error(data.error);
                }
            } catch (error: any) {
                console.error('Quiz submit error:', error);
                toast({
                    title: "Submission failed",
                    description: error.message,
                    variant: "destructive",
                });
            }

            setShowResult(true);
            setQuizStarted(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="fixed inset-0 -z-10">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(/RASHID.jpeg)` }}
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <PageHeader
                title="Calculus & Differentiation Quiz"
                subtitle="Master calculus concepts and earn rewards"
                profileName={profile?.full_name}
                profileImage={profile?.avatar_url}
            />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {!quizStarted && !showResult && (
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                                <Calculator className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="text-3xl">Ready for Calculus Challenge?</CardTitle>
                            <CardDescription className="text-lg">
                                Answer {questions.length} calculus questions and earn points!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 bg-primary/10 rounded-lg">
                                    <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                                    <div className="font-bold">{questions.length} Questions</div>
                                </div>
                                <div className="text-center p-4 bg-accent/10 rounded-lg">
                                    <Clock className="h-6 w-6 text-accent mx-auto mb-2" />
                                    <div className="font-bold">30s per question</div>
                                </div>
                                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                                    <Trophy className="h-6 w-6 text-secondary mx-auto mb-2" />
                                    <div className="font-bold">Win Spin Points</div>
                                </div>
                            </div>
                            <Button onClick={startQuiz} className="w-full" size="lg">
                                <Zap className="mr-2 h-5 w-5" />
                                Start Quiz
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {quizStarted && (
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardHeader>
                            <div className="flex items-center justify-between mb-4">
                                <Badge variant="outline">Question {currentQuestion + 1}/{questions.length}</Badge>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span className={`font-bold ${timeLeft < 10 ? 'text-destructive' : ''}`}>
                                        {timeLeft}s
                                    </span>
                                </div>
                            </div>
                            <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mb-4" />
                            <CardTitle className="text-2xl">{questions[currentQuestion].question}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Trophy className="h-4 w-4" />
                                <span>{questions[currentQuestion].points} points</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {questions[currentQuestion].options.map((option, index) => (
                                    <Button
                                        key={index}
                                        variant={selectedAnswer === index ? "default" : "outline"}
                                        className="h-auto p-6 text-lg justify-start"
                                        onClick={() => handleAnswer(index)}
                                        disabled={selectedAnswer !== null}
                                    >
                                        {selectedAnswer === index && (
                                            index === questions[currentQuestion].correct ? (
                                                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="mr-2 h-5 w-5 text-red-500" />
                                            )
                                        )}
                                        {option}
                                    </Button>
                                ))}
                            </div>
                            <div className="mt-6 text-center">
                                <div className="text-sm text-muted-foreground">Current Score</div>
                                <div className="text-3xl font-bold text-primary">{score}</div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {showResult && (
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                                <Award className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
                            <CardDescription className="text-lg">
                                Great job, {profile?.full_name}!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center mb-6">
                                <div className="text-sm text-muted-foreground mb-2">Your Score</div>
                                <div className="text-6xl font-bold text-primary mb-2">{score}</div>
                                <div className="text-lg text-muted-foreground">
                                    out of {questions.reduce((sum, q) => sum + q.points, 0)} points
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-4 bg-primary/10 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                                    <div className="font-bold">
                                        {questions.filter((_, i) => i <= currentQuestion).length} Answered
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-accent/10 rounded-lg">
                                    <Trophy className="h-6 w-6 text-accent mx-auto mb-2" />
                                    <div className="font-bold">+{Math.floor(score / 10)} Spin Points</div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button onClick={startQuiz} className="flex-1" variant="outline">
                                    Try Again
                                </Button>
                                <Button onClick={() => navigate("/dashboard")} className="flex-1">
                                    Back to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default MathQuiz;
