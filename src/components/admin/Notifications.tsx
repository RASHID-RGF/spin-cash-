import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Bell, Users, CheckCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Notifications = () => {
    const { toast } = useToast();
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        targetAudience: "all", // all, active, inactive
    });

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            // Get target users based on audience selection
            let query = supabase.from("profiles").select("id, email, full_name");

            if (formData.targetAudience === "active") {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                query = query.gte("last_login", sevenDaysAgo.toISOString());
            } else if (formData.targetAudience === "inactive") {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                query = query.lt("last_login", sevenDaysAgo.toISOString());
            }

            const { data: users, error } = await query;

            if (error) throw error;

            // In a real app, you would send notifications via:
            // 1. Push notifications (Firebase Cloud Messaging)
            // 2. Email (SendGrid, AWS SES)
            // 3. SMS (Twilio, Africa's Talking)
            // 4. In-app notifications (stored in database)

            // For now, we'll create in-app notifications
            const notifications = users?.map(user => ({
                user_id: user.id,
                title: formData.title,
                message: formData.message,
                is_read: false,
                created_at: new Date().toISOString(),
            }));

            if (notifications && notifications.length > 0) {
                const { error: notifError } = await supabase
                    .from("notifications")
                    .insert(notifications);

                if (notifError) throw notifError;

                toast({
                    title: "Success!",
                    description: `Notification sent to ${notifications.length} users`,
                });

                setFormData({ title: "", message: "", targetAudience: "all" });
            } else {
                toast({
                    title: "No users found",
                    description: "No users match the selected criteria",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error sending notification:", error);
            toast({
                title: "Error",
                description: "Failed to send notification",
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send Notification Form */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Send className="h-5 w-5 text-blue-400" />
                        Send Mass Notification
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSendNotification} className="space-y-4">
                        <div>
                            <Label htmlFor="title" className="text-white">Notification Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                placeholder="e.g., New Feature Available!"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="message" className="text-white">Message</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                placeholder="Write your notification message here..."
                                rows={6}
                                required
                            />
                        </div>

                        <div>
                            <Label className="text-white mb-3 block">Target Audience</Label>
                            <RadioGroup
                                value={formData.targetAudience}
                                onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
                                className="space-y-3"
                            >
                                <div className="flex items-center space-x-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <RadioGroupItem value="all" id="all" className="border-white/40" />
                                    <Label htmlFor="all" className="text-white cursor-pointer flex-1 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-400" />
                                        All Users
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <RadioGroupItem value="active" id="active" className="border-white/40" />
                                    <Label htmlFor="active" className="text-white cursor-pointer flex-1 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                        Active Users (Last 7 days)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <RadioGroupItem value="inactive" id="inactive" className="border-white/40" />
                                    <Label htmlFor="inactive" className="text-white cursor-pointer flex-1 flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-yellow-400" />
                                        Inactive Users (7+ days)
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                            {sending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Notification
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Notification Tips */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Bell className="h-5 w-5 text-yellow-400" />
                        Notification Best Practices
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                        <h4 className="text-white font-semibold mb-2">✨ Keep it Short & Clear</h4>
                        <p className="text-gray-300 text-sm">
                            Users are more likely to read and act on concise, clear messages. Aim for 50-100 characters for titles.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-white/10">
                        <h4 className="text-white font-semibold mb-2">🎯 Target Wisely</h4>
                        <p className="text-gray-300 text-sm">
                            Send relevant notifications to the right audience. Active users for new features, inactive users for re-engagement.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-white/10">
                        <h4 className="text-white font-semibold mb-2">⏰ Timing Matters</h4>
                        <p className="text-gray-300 text-sm">
                            Send notifications during peak hours (9 AM - 9 PM) for better engagement rates.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-white/10">
                        <h4 className="text-white font-semibold mb-2">📊 Track Performance</h4>
                        <p className="text-gray-300 text-sm">
                            Monitor open rates and user actions to optimize future notifications.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10">
                        <h4 className="text-white font-semibold mb-2">🚫 Don't Spam</h4>
                        <p className="text-gray-300 text-sm">
                            Limit notifications to 2-3 per week to avoid user fatigue and app uninstalls.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Notifications;
