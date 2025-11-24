import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dices, Calculator, Trophy, Settings } from "lucide-react";

const GameManagement = () => {
    const { toast } = useToast();
    const [spinSettings, setSpinSettings] = useState({
        minReward: 1,
        maxReward: 100,
        spinCost: 10,
        dailyLimit: 5,
    });

    const [quizSettings, setQuizSettings] = useState({
        rewardPerQuestion: 5,
        passingScore: 70,
        questionsPerQuiz: 10,
    });

    const [numberGameSettings, setNumberGameSettings] = useState({
        minNumber: 1,
        maxNumber: 100,
        rewardAmount: 50,
        attemptsPerDay: 3,
    });

    const handleSaveSpinSettings = () => {
        // In a real app, save to database
        toast({
            title: "Success",
            description: "Spin game settings updated",
        });
    };

    const handleSaveQuizSettings = () => {
        toast({
            title: "Success",
            description: "Quiz settings updated",
        });
    };

    const handleSaveNumberGameSettings = () => {
        toast({
            title: "Success",
            description: "Number game settings updated",
        });
    };

    return (
        <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
                <CardTitle className="text-white">Game Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="spin" className="space-y-6">
                    <TabsList className="backdrop-blur-md bg-white/10 border border-white/20 grid grid-cols-3">
                        <TabsTrigger value="spin" className="data-[state=active]:bg-blue-500/30 text-white">
                            <Dices className="h-4 w-4 mr-2" />
                            Spin Wheel
                        </TabsTrigger>
                        <TabsTrigger value="quiz" className="data-[state=active]:bg-purple-500/30 text-white">
                            <Calculator className="h-4 w-4 mr-2" />
                            Math Quiz
                        </TabsTrigger>
                        <TabsTrigger value="number" className="data-[state=active]:bg-green-500/30 text-white">
                            <Trophy className="h-4 w-4 mr-2" />
                            Number Game
                        </TabsTrigger>
                    </TabsList>

                    {/* Spin Wheel Settings */}
                    <TabsContent value="spin">
                        <Card className="backdrop-blur-md bg-white/5 border-white/20">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-blue-400" />
                                    Spin Wheel Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="minReward" className="text-white">Minimum Reward (KES)</Label>
                                        <Input
                                            id="minReward"
                                            type="number"
                                            value={spinSettings.minReward}
                                            onChange={(e) => setSpinSettings({ ...spinSettings, minReward: Number(e.target.value) })}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="maxReward" className="text-white">Maximum Reward (KES)</Label>
                                        <Input
                                            id="maxReward"
                                            type="number"
                                            value={spinSettings.maxReward}
                                            onChange={(e) => setSpinSettings({ ...spinSettings, maxReward: Number(e.target.value) })}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="spinCost" className="text-white">Spin Cost (Points)</Label>
                                        <Input
                                            id="spinCost"
                                            type="number"
                                            value={spinSettings.spinCost}
                                            onChange={(e) => setSpinSettings({ ...spinSettings, spinCost: Number(e.target.value) })}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dailyLimit" className="text-white">Daily Spin Limit</Label>
                                        <Input
                                            id="dailyLimit"
                                            type="number"
                                            value={spinSettings.dailyLimit}
                                            onChange={(e) => setSpinSettings({ ...spinSettings, dailyLimit: Number(e.target.value) })}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleSaveSpinSettings}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                >
                                    Save Spin Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Quiz Settings */}
                    <TabsContent value="quiz">
                        <Card className="backdrop-blur-md bg-white/5 border-white/20">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-purple-400" />
                                    Math Quiz Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="rewardPerQuestion" className="text-white">Reward per Correct Answer (KES)</Label>
                                        <Input
                                            id="rewardPerQuestion"
                                            type="number"
                                            value={quizSettings.rewardPerQuestion}
                                            onChange={(e) => setQuizSettings({ ...quizSettings, rewardPerQuestion: Number(e.target.value) })}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="passingScore" className="text-white">Passing Score (%)</Label>
                                        <Input
                                            id="passingScore"
                                            type="number"
                                            value={quizSettings.passingScore}
                                            onChange={(e) => setQuizSettings({ ...quizSettings, passingScore: Number(e.target.value) })}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="questionsPerQuiz" className="text-white">Questions per Quiz</Label>
                                        <Input
                                            id="questionsPerQuiz"
                                            type="number"
                                            value={quizSettings.questionsPerQuiz}
                                            onChange={(e) => setQuizSettings({ ...quizSettings, questionsPerQuiz: Number(e.target.value) })}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleSaveQuizSettings}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                >
                                    Save Quiz Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Number Game Settings */}
                    <TabsContent value="number">
                        <Card className="backdrop-blur-md bg-white/5 border-white/20">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-green-400" />
                                    Number Game Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="minNumber" className="text-white">Minimum Number</Label>
                                        <Input
                                            id="minNumber"
                                            type="number"
                                            value={numberGameSettings.minNumber}
                                            onChange={(e) => setNumberGameSettings({ ...numberGameSettings, minNumber: Number(e.target.value) })}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="maxNumber" className="text-white">Maximum Number</Label>
                                        <Input
                                            id="maxNumber"
                                            type="number"
                                            value={numberGameSettings.maxNumber}
                                            onChange={(e) => setNumberGameSettings({ ...numberGameSettings, maxNumber: Number(e.target.value) })}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="rewardAmount" className="text-white">Reward Amount (KES)</Label>
                                        <Input
                                            id="rewardAmount"
                                            type="number"
                                            value={numberGameSettings.rewardAmount}
                                            onChange={(e) => setNumberGameSettings({ ...numberGameSettings, rewardAmount: Number(e.target.value) })}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="attemptsPerDay" className="text-white">Attempts per Day</Label>
                                        <Input
                                            id="attemptsPerDay"
                                            type="number"
                                            value={numberGameSettings.attemptsPerDay}
                                            onChange={(e) => setNumberGameSettings({ ...numberGameSettings, attemptsPerDay: Number(e.target.value) })}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleSaveNumberGameSettings}
                                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                                >
                                    Save Number Game Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default GameManagement;
