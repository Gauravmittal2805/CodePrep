import { useState, useEffect } from "react";
import {
    Trophy,
    Calendar,
    Users,
    MoreVertical,
    Trash2,
    RefreshCcw,
    Search,
    Clock,
    BadgeCheck,
    Eye,
    ChevronRight,
    Lock,
    UserPlus,
    Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const ManageContests = () => {
    const [contests, setContests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isInviting, setIsInviting] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchContests = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/contests/admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setContests(result.data);
            } else {
                toast.error(result.error || "Failed to fetch contests");
            }
        } catch (error) {
            console.error("Fetch contests error:", error);
            toast.error("An error occurred while fetching contests");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async (id: string) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/contests/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'UPCOMING' })
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Contest published successfully!");
                fetchContests();
            } else {
                toast.error(result.error || "Failed to publish contest");
            }
        } catch (error) {
            toast.error("Error publishing contest");
        }
    };

    const handleDelete = async (id: string) => {
        if (!user || !window.confirm("Are you sure you want to delete this contest?")) return;
        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/contests/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Contest deleted successfully");
                fetchContests();
            } else {
                toast.error(result.error || "Failed to delete contest");
            }
        } catch (error) {
            toast.error("Error deleting contest");
        }
    };

    const fetchUsers = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:5001/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setAllUsers(result.data);
            }
        } catch (error) {
            console.error("Fetch users error:", error);
        }
    };

    const handleInvite = async () => {
        if (!user || !selectedContest || selectedUserIds.length === 0) return;
        setIsInviting(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/contests/${selectedContest._id}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userIds: selectedUserIds })
            });
            const result = await response.json();
            if (result.success) {
                toast.success(`Successfully invited ${selectedUserIds.length} users!`);
                setIsInviteModalOpen(false);
                setSelectedUserIds([]);
                fetchContests();
            } else {
                toast.error(result.error || "Failed to invite users");
            }
        } catch (error) {
            toast.error("Error inviting users");
        } finally {
            setIsInviting(false);
        }
    };

    const openInviteModal = (contest: any) => {
        setSelectedContest(contest);
        setSelectedUserIds(contest.participants || []);
        setIsInviteModalOpen(true);
        fetchUsers();
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    useEffect(() => {
        fetchContests();
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ONGOING': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'UPCOMING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'ENDED': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
            case 'DRAFT': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
        }
    };

    const filteredContests = contests.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === "all") return true;
        if (activeTab === "draft") return c.status === "DRAFT";
        if (activeTab === "public") return c.visibility === "PUBLIC" && c.status !== "DRAFT";
        if (activeTab === "private") return c.visibility === "INVITE_ONLY" && c.status !== "DRAFT";

        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        Manage Contests
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">View and manage all programming contests on the platform</p>
                </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-black/20 p-1 rounded-lg border border-white/5">
                    <TabsList className="bg-transparent border-0 h-8 gap-1">
                        <TabsTrigger value="all" className="text-[10px] h-7 px-3 uppercase font-bold tracking-wider data-[state=active]:bg-white/10">All</TabsTrigger>
                        <TabsTrigger value="draft" className="text-[10px] h-7 px-3 uppercase font-bold tracking-wider data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">Drafts</TabsTrigger>
                        <TabsTrigger value="public" className="text-[10px] h-7 px-3 uppercase font-bold tracking-wider data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500">Public</TabsTrigger>
                        <TabsTrigger value="private" className="text-[10px] h-7 px-3 uppercase font-bold tracking-wider data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500 whitespace-nowrap">Invite Only</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-10 w-full md:w-48 bg-black/40 border-border/40 h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchContests}
                        className="bg-black/40 border-border/40 h-10 w-10"
                        disabled={isLoading}
                    >
                        <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="bg-[#111111] border-border/40 animate-pulse">
                            <CardContent className="h-48" />
                        </Card>
                    ))}
                </div>
            ) : filteredContests.length === 0 ? (
                <Card className="bg-[#111111] border-dashed border-2 border-border/20 py-20 text-center">
                    <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">No contests found</h3>
                    <p className="text-muted-foreground text-sm mt-1">Start by creating your first contest using the designer.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContests.map((contest) => (
                        <Card
                            key={contest._id}
                            className="bg-[#111111] border-border/40 hover:border-primary/40 transition-all duration-300 group rounded-3xl overflow-hidden cursor-pointer flex flex-col h-full"
                            onClick={() => navigate(`/contest/${contest._id}/arena`)}
                        >
                            <div className="absolute top-0 right-0 p-4 z-10">
                                <Badge className={cn("text-[10px] font-bold uppercase", getStatusColor(contest.status))}>
                                    {contest.status}
                                </Badge>
                            </div>

                            <CardHeader className="pb-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary/70 uppercase tracking-widest">
                                        <span>{contest.type}</span>
                                        <span>•</span>
                                        <span>{contest.difficulty}</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-white group-hover:text-primary transition-colors truncate">
                                        {contest.title}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                        {contest.description}
                                    </p>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Duration</span>
                                        <div className="flex items-center gap-2 text-sm text-white font-medium">
                                            <Clock className="w-3.5 h-3.5 text-primary" />
                                            {contest.duration} Mins
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Problems</span>
                                        <div className="flex items-center gap-2 text-sm text-white font-medium">
                                            <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                                            {contest.problems?.length || 0} Qs
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Visibility</span>
                                        <div className="flex items-center gap-2 text-sm text-white font-medium">
                                            {contest.visibility === 'INVITE_ONLY' ? (
                                                <>
                                                    <Lock className="w-3.5 h-3.5 text-purple-500" />
                                                    <span className="text-purple-400">Private</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-3.5 h-3.5 text-green-500" />
                                                    <span className="text-green-400">Public</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Scheduled Time</span>
                                    <div className="flex items-center gap-2 text-xs text-white/80">
                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                        {new Date(contest.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-white/[0.05]">
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                        <Users className="w-3.5 h-3.5" />
                                        {contest.participants?.length || 0} Joined
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {contest.visibility === 'INVITE_ONLY' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openInviteModal(contest)}
                                                className="h-8 text-[10px] font-bold uppercase tracking-widest border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50"
                                            >
                                                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                                Invite
                                            </Button>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-border/40">
                                                <DropdownMenuItem
                                                    onClick={() => navigate(`/contest/${contest._id}`)}
                                                    className="gap-2 focus:bg-primary/10 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4 text-primary" />
                                                    <span>View Page</span>
                                                </DropdownMenuItem>
                                                {contest.status === 'DRAFT' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handlePublish(contest._id)}
                                                        className="gap-2 focus:bg-green-500/10 text-green-500 transition-colors"
                                                    >
                                                        <Trophy className="w-4 h-4" />
                                                        <span>Publish Now</span>
                                                    </DropdownMenuItem>
                                                )}
                                                {contest.visibility === 'INVITE_ONLY' && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => openInviteModal(contest)}
                                                            className="gap-2 focus:bg-purple-500/10 text-purple-400 transition-colors"
                                                        >
                                                            <UserPlus className="w-4 h-4" />
                                                            <span>Invite Users</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5" />
                                                    </>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(contest._id)}
                                                    className="gap-2 focus:bg-red-500/10 text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
                                        >
                                            View Page
                                            <ChevronRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Invite Modal */}
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                <DialogContent className="bg-[#121212] border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-purple-500" />
                            Invite Users to Contest
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Select users from the platform to grant access to <span className="text-white font-medium">{selectedContest?.title}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name or email..."
                                className="pl-10 bg-black/40 border-white/10 text-sm"
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-2">
                                {allUsers
                                    .filter(u =>
                                        u.fullName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                        u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
                                    )
                                    .map((u) => (
                                        <div
                                            key={u.uid}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group",
                                                selectedUserIds.includes(u.uid)
                                                    ? "bg-purple-500/10 border-purple-500/30"
                                                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                            )}
                                            onClick={() => toggleUserSelection(u.uid)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 uppercase">
                                                    {u.fullName?.charAt(0) || u.email?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-white line-clamp-1">{u.fullName || 'No Name'}</span>
                                                    <span className="text-[10px] text-zinc-500 line-clamp-1">{u.email}</span>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                                                selectedUserIds.includes(u.uid)
                                                    ? "bg-purple-500 border-purple-500"
                                                    : "border-white/20 group-hover:border-white/40"
                                            )}>
                                                {selectedUserIds.includes(u.uid) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                    ))}
                                {allUsers.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-zinc-500 text-sm">No users found</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setIsInviteModalOpen(false)}
                            className="text-zinc-400 hover:text-white hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleInvite}
                            disabled={isInviting || selectedUserIds.length === 0}
                            className="bg-purple-600 hover:bg-purple-700 text-white gap-2 px-6"
                        >
                            {isInviting ? (
                                <>
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                    Inviting...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Invite {selectedUserIds.length} Users
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageContests;
