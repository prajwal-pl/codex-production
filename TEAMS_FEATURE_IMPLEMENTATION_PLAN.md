# Teams & Collaboration Feature - Detailed Implementation Plan

## 📋 Overview
Implement a comprehensive team collaboration system where users can:
- Search for existing platform users
- Send project collaboration invitations
- Accept/reject invitations
- Collaborate on projects with real-time communication
- Manage team members and permissions

## 🎯 Feature Requirements (Phase 1)

### Core Functionality
1. **User Search** - Search for users by name/email
2. **Project Invitations** - Send invites to collaborate on specific projects
3. **Invitation Management** - Accept/reject pending invitations
4. **Team Communication** - Real-time chat via WebSocket for project teams
5. **Project Access Control** - Role-based permissions (Owner/Member)
6. **Tab Structure** - Teams (active), World (TODO), Learn (TODO)

---

## 🗄️ Database Schema Changes

### Phase 1: New Models Required

```prisma
// 1. Project Invitation Model
model ProjectInvitation {
  id         String              @id @default(uuid())
  projectId  String
  senderId   String              // User who sent the invite
  receiverId String              // User receiving the invite
  status     InvitationStatus    @default(PENDING)
  role       ProjectRole         @default(MEMBER)
  message    String?             // Optional invitation message
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt
  expiresAt  DateTime?           // Optional expiration
  
  project  Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  sender   User    @relation("SentInvitations", fields: [senderId], references: [id])
  receiver User    @relation("ReceivedInvitations", fields: [receiverId], references: [id])
  
  @@unique([projectId, receiverId]) // Prevent duplicate invites
  @@index([receiverId, status])     // Fast lookup of pending invites
  @@index([projectId])
  @@index([senderId])
}

// 2. New Enum for Invitation Status
enum InvitationStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
  EXPIRED
}

// 3. Notification Model (for real-time updates)
model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  data      Json?            // Additional context (projectId, invitationId, etc.)
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
  @@index([createdAt])
}

enum NotificationType {
  PROJECT_INVITATION
  INVITATION_ACCEPTED
  INVITATION_REJECTED
  MEMBER_JOINED
  MEMBER_LEFT
  PROJECT_UPDATED
  MESSAGE_RECEIVED
}
```

### Schema Modifications

```prisma
// Update User model to include relations
model User {
  // ... existing fields ...
  
  sentInvitations     ProjectInvitation[] @relation("SentInvitations")
  receivedInvitations ProjectInvitation[] @relation("ReceivedInvitations")
  notifications       Notification[]
}

// Update ProjectMember model (already exists, but ensure it has proper indexes)
model ProjectMember {
  id        String      @id @default(uuid())
  userId    String
  projectId String
  role      ProjectRole @default(MEMBER)
  joinedAt  DateTime    @default(now()) // Add this field
  User      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  Project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@unique([userId, projectId]) // Prevent duplicate memberships
  @@index([userId])
  @@index([projectId])
}

// Update Project model to include invitations
model Project {
  // ... existing fields ...
  invitations ProjectInvitation[]
}
```

---

## 🔧 Backend Implementation

### 1. Primary Backend - Team Controllers

**File**: `apps/primary-backend/src/controllers/team.controller.ts`

```typescript
/**
 * Team & Collaboration Controllers
 */

// 1. Search Users
export const searchUsersHandler = async (req: Request, res: Response)
// - Query: ?q=search_term&limit=20
// - Search by: name (partial match), email (partial match)
// - Exclude: current user, already invited users, existing members
// - Return: User[] with { id, name, email, avatarUrl? }

// 2. Send Project Invitation
export const sendInvitationHandler = async (req: Request, res: Response)
// - Body: { projectId, receiverId, role?, message? }
// - Validate: project ownership, user exists, not already invited/member
// - Create: ProjectInvitation record
// - Create: Notification for receiver
// - Emit: WebSocket event to receiver (if online)
// - Return: Invitation details

// 3. Get Pending Invitations (for current user)
export const getPendingInvitationsHandler = async (req: Request, res: Response)
// - Query: received invitations with status=PENDING
// - Include: project details, sender info
// - Return: Invitation[] with populated data

// 4. Get Sent Invitations (for current user)
export const getSentInvitationsHandler = async (req: Request, res: Response)
// - Query: sent invitations
// - Include: project details, receiver info, status
// - Return: Invitation[] with populated data

// 5. Accept Invitation
export const acceptInvitationHandler = async (req: Request, res: Response)
// - Params: :invitationId
// - Validate: invitation exists, belongs to current user, status=PENDING
// - Create: ProjectMember record
// - Update: Invitation status to ACCEPTED
// - Create: Notification for sender
// - Emit: WebSocket event to project members
// - Return: { success: true, project, member }

// 6. Reject Invitation
export const rejectInvitationHandler = async (req: Request, res: Response)
// - Params: :invitationId
// - Validate: invitation exists, belongs to current user
// - Update: Invitation status to REJECTED
// - Create: Notification for sender
// - Return: { success: true }

// 7. Cancel Invitation (for sender)
export const cancelInvitationHandler = async (req: Request, res: Response)
// - Params: :invitationId
// - Validate: invitation exists, sent by current user, status=PENDING
// - Update: Invitation status to CANCELLED
// - Create: Notification for receiver
// - Return: { success: true }

// 8. Get Project Members
export const getProjectMembersHandler = async (req: Request, res: Response)
// - Params: :projectId
// - Validate: user is member or owner
// - Query: ProjectMember[] with user details
// - Return: Member[] with { id, userId, user, role, joinedAt }

// 9. Remove Project Member (owner only)
export const removeMemberHandler = async (req: Request, res: Response)
// - Params: :projectId/:memberId
// - Validate: current user is owner, not removing self
// - Delete: ProjectMember record
// - Create: Notification for removed user
// - Emit: WebSocket event
// - Return: { success: true }

// 10. Update Member Role (owner only)
export const updateMemberRoleHandler = async (req: Request, res: Response)
// - Params: :projectId/:memberId
// - Body: { role: ProjectRole }
// - Validate: current user is owner
// - Update: ProjectMember role
// - Return: Updated member

// 11. Leave Project (member only)
export const leaveProjectHandler = async (req: Request, res: Response)
// - Params: :projectId
// - Validate: user is member, not owner (owners must transfer ownership first)
// - Delete: ProjectMember record
// - Create: Notification for owner
// - Emit: WebSocket event
// - Return: { success: true }

// 12. Get User Notifications
export const getNotificationsHandler = async (req: Request, res: Response)
// - Query: ?limit=50&offset=0&unreadOnly=false
// - Return: Notification[] for current user

// 13. Mark Notification as Read
export const markNotificationReadHandler = async (req: Request, res: Response)
// - Params: :notificationId
// - Update: isRead = true
// - Return: { success: true }

// 14. Mark All Notifications as Read
export const markAllNotificationsReadHandler = async (req: Request, res: Response)
// - Update: all unread notifications for user
// - Return: { success: true, count }
```

**File**: `apps/primary-backend/src/routes/team.route.ts`

```typescript
import { Router } from "express";
import { authMiddleware } from "@repo/common/middleware";
import * as teamController from "../controllers/team.controller.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// User Search
router.get("/search", teamController.searchUsersHandler);

// Invitations
router.post("/invitations", teamController.sendInvitationHandler);
router.get("/invitations/received", teamController.getPendingInvitationsHandler);
router.get("/invitations/sent", teamController.getSentInvitationsHandler);
router.post("/invitations/:invitationId/accept", teamController.acceptInvitationHandler);
router.post("/invitations/:invitationId/reject", teamController.rejectInvitationHandler);
router.delete("/invitations/:invitationId", teamController.cancelInvitationHandler);

// Project Members
router.get("/projects/:projectId/members", teamController.getProjectMembersHandler);
router.delete("/projects/:projectId/members/:memberId", teamController.removeMemberHandler);
router.patch("/projects/:projectId/members/:memberId/role", teamController.updateMemberRoleHandler);
router.post("/projects/:projectId/leave", teamController.leaveProjectHandler);

// Notifications
router.get("/notifications", teamController.getNotificationsHandler);
router.patch("/notifications/:notificationId/read", teamController.markNotificationReadHandler);
router.patch("/notifications/read-all", teamController.markAllNotificationsReadHandler);

export default router;
```

Register in `apps/primary-backend/src/index.ts`:
```typescript
import teamRoutes from "./routes/team.route.js";
app.use("/api/teams", teamRoutes);
```

---

### 2. WebSocket Backend - Real-Time Events

**File**: `apps/websocket-backend/src/index.ts` (Enhancements)

Add new WebSocket event types:

```typescript
// New message types
interface IncomingMessage {
  // ... existing types ...
  type: 
    | "join-room"
    | "send-message"
    | "leave-room"
    | "join-project-room"      // NEW
    | "leave-project-room"      // NEW
    | "project-invitation"      // NEW
    | "invitation-response"     // NEW
    | "member-joined"           // NEW
    | "member-left"             // NEW
    | "typing-indicator"        // NEW (optional)
  projectId?: string;
  invitationId?: string;
  action?: "accept" | "reject";
}

// Broadcast events to project members
const broadcastToProject = (projectId: string, message: any, excludeUserId?: string) => {
  // Query ProjectMember table to get all member userIds
  // Send message to all connected members except excludeUserId
};
```

Add handlers for new events:
```typescript
case "join-project-room": {
  // Validate user is member of project
  // Add to project room tracking
  // Broadcast user-joined event
}

case "project-invitation": {
  // Send real-time notification to receiver
  // Update UI badge count
}

case "invitation-response": {
  // Notify sender of accept/reject
  // If accepted, notify all project members
}
```

---

## 🎨 Frontend Implementation

### 1. API Client Functions

**File**: `apps/main-frontend/lib/api-client.ts`

```typescript
// ==================== TEAMS API ====================

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  senderId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  role: "OWNER" | "MEMBER";
  message?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
    description?: string;
  };
  sender?: User;
  receiver?: User;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
  user: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// User Search
export async function searchUsers(query: string, limit = 20): Promise<{ success: boolean; users: User[] }>

// Send Invitation
export async function sendProjectInvitation(payload: {
  projectId: string;
  receiverId: string;
  role?: "MEMBER";
  message?: string;
}): Promise<{ success: boolean; invitation: ProjectInvitation }>

// Get Invitations
export async function getReceivedInvitations(): Promise<{ success: boolean; invitations: ProjectInvitation[] }>
export async function getSentInvitations(): Promise<{ success: boolean; invitations: ProjectInvitation[] }>

// Respond to Invitation
export async function acceptInvitation(invitationId: string): Promise<{ success: boolean; project: any; member: ProjectMember }>
export async function rejectInvitation(invitationId: string): Promise<{ success: boolean }>
export async function cancelInvitation(invitationId: string): Promise<{ success: boolean }>

// Project Members
export async function getProjectMembers(projectId: string): Promise<{ success: boolean; members: ProjectMember[] }>
export async function removeMember(projectId: string, memberId: string): Promise<{ success: boolean }>
export async function updateMemberRole(projectId: string, memberId: string, role: "OWNER" | "MEMBER"): Promise<{ success: boolean; member: ProjectMember }>
export async function leaveProject(projectId: string): Promise<{ success: boolean }>

// Notifications
export async function getNotifications(params?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<{ success: boolean; notifications: Notification[]; unreadCount: number }>
export async function markNotificationRead(notificationId: string): Promise<{ success: boolean }>
export async function markAllNotificationsRead(): Promise<{ success: boolean; count: number }>
```

---

### 2. Teams Page Components

**File Structure**:
```
apps/main-frontend/app/(main)/teams/
├── page.tsx                          # Main teams page with tabs
├── components/
│   ├── user-search-dialog.tsx        # Search & invite users
│   ├── invitation-list.tsx           # Pending invitations
│   ├── team-projects-list.tsx        # Projects with team members
│   ├── project-members-card.tsx      # Member management
│   ├── member-avatar-group.tsx       # Avatar stack
│   ├── invitation-card.tsx           # Individual invitation
│   ├── team-chat.tsx                 # Real-time chat (WebSocket)
│   └── coming-soon-tab.tsx           # World & Learn tabs placeholder
```

**File**: `apps/main-frontend/app/(main)/teams/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconUserPlus, IconBell, IconGlobe, IconBook } from "@tabler/icons-react";
import { UserSearchDialog } from "./components/user-search-dialog";
import { InvitationList } from "./components/invitation-list";
import { TeamProjectsList } from "./components/team-projects-list";
import { ComingSoonTab } from "./components/coming-soon-tab";
import { getReceivedInvitations, getNotifications } from "@/lib/api-client";

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState("teams");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch pending invitations count
    getReceivedInvitations().then((res) => {
      setPendingCount(res.invitations.filter(i => i.status === "PENDING").length);
    });

    // Fetch unread notifications
    getNotifications({ unreadOnly: true }).then((res) => {
      setUnreadCount(res.unreadCount);
    });
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams & Collaboration</h1>
          <p className="text-muted-foreground mt-1">
            Work together on projects and communicate in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="relative">
            <IconBell />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Button onClick={() => setShowInviteDialog(true)}>
            <IconUserPlus /> Invite to Project
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="teams" className="relative">
            Teams
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="world" disabled>
            <IconGlobe className="mr-2 h-4 w-4" />
            World
            <Badge variant="outline" className="ml-2">Soon</Badge>
          </TabsTrigger>
          <TabsTrigger value="learn" disabled>
            <IconBook className="mr-2 h-4 w-4" />
            Learn
            <Badge variant="outline" className="ml-2">Soon</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-6">
          {/* Pending Invitations Section */}
          {pendingCount > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Pending Invitations ({pendingCount})
              </h2>
              <InvitationList />
            </div>
          )}

          {/* Team Projects */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Team Projects</h2>
            <TeamProjectsList />
          </div>
        </TabsContent>

        {/* World Tab (Coming Soon) */}
        <TabsContent value="world">
          <ComingSoonTab
            title="World"
            description="Connect with developers worldwide, discover public projects, and collaborate on open-source initiatives."
            features={[
              "Explore public projects",
              "Join open communities",
              "Contribute to trending repos",
              "Global leaderboards"
            ]}
          />
        </TabsContent>

        {/* Learn Tab (Coming Soon) */}
        <TabsContent value="learn">
          <ComingSoonTab
            title="Learn"
            description="Interactive tutorials, coding challenges, and educational content to enhance your skills."
            features={[
              "Step-by-step tutorials",
              "Interactive coding challenges",
              "Skill-based learning paths",
              "Certifications & badges"
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* User Search Dialog */}
      <UserSearchDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </div>
  );
}
```

---

### 3. Key UI Components

**File**: `apps/main-frontend/app/(main)/teams/components/user-search-dialog.tsx`

```tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { searchUsers, sendProjectInvitation, getAllProjects } from "@/lib/api-client";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import { toast } from "sonner";

export function UserSearchDialog({ open, onOpenChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [message, setMessage] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's projects on open
  useEffect(() => {
    if (open) {
      getAllProjects().then(res => setProjects(res.projects));
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers(searchQuery).then(res => setSearchResults(res.users));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSendInvite = async () => {
    if (!selectedUser || !selectedProject) {
      toast.error("Please select a user and project");
      return;
    }

    setLoading(true);
    try {
      await sendProjectInvitation({
        projectId: selectedProject,
        receiverId: selectedUser.id,
        message: message || undefined,
      });
      toast.success(`Invitation sent to ${selectedUser.name}`);
      onOpenChange(false);
      // Reset state
      setSearchQuery("");
      setSelectedUser(null);
      setMessage("");
    } catch (error) {
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite User to Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-muted ${
                    selectedUser?.id === user.id ? "bg-muted" : ""
                  }`}
                >
                  <Avatar>
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected User */}
          {selectedUser && (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted">
              <Avatar>
                <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                Remove
              </Button>
            </div>
          )}

          {/* Project Selection */}
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Optional Message */}
          <Textarea
            placeholder="Add a message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvite} disabled={loading || !selectedUser || !selectedProject}>
              <IconUserPlus /> Send Invitation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**File**: `apps/main-frontend/app/(main)/teams/components/invitation-card.tsx`

```tsx
"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconX, IconClock } from "@tabler/icons-react";
import { acceptInvitation, rejectInvitation } from "@/lib/api-client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function InvitationCard({ invitation, onUpdate }) {
  const handleAccept = async () => {
    try {
      await acceptInvitation(invitation.id);
      toast.success("Invitation accepted!");
      onUpdate();
    } catch (error) {
      toast.error("Failed to accept invitation");
    }
  };

  const handleReject = async () => {
    try {
      await rejectInvitation(invitation.id);
      toast.success("Invitation rejected");
      onUpdate();
    } catch (error) {
      toast.error("Failed to reject invitation");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{invitation.sender.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{invitation.sender.name}</div>
              <div className="text-sm text-muted-foreground">
                invited you to collaborate
              </div>
            </div>
          </div>
          <Badge variant="outline">
            <IconClock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Project: </span>
            {invitation.project.title}
          </div>
          <div>
            <span className="font-medium">Role: </span>
            <Badge>{invitation.role}</Badge>
          </div>
          {invitation.message && (
            <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
              "{invitation.message}"
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button onClick={handleAccept} className="flex-1">
          <IconCheck /> Accept
        </Button>
        <Button onClick={handleReject} variant="outline" className="flex-1">
          <IconX /> Decline
        </Button>
      </CardFooter>
    </Card>
  );
}
```

**File**: `apps/main-frontend/app/(main)/teams/components/team-chat.tsx`

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IconSend } from "@tabler/icons-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TeamChat({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef(null);
  
  const { sendMessage, connected } = useWebSocket(projectId);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTo Bottom = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    sendMessage({
      type: "send-message",
      projectId,
      content: inputMessage,
    });

    setInputMessage("");
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Team Chat</h3>
          <div className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{msg.sender.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{msg.sender.name}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <div className="text-sm mt-1">{msg.content}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter>
        <div className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} size="icon">
            <IconSend />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

**File**: `apps/main-frontend/app/(main)/teams/components/coming-soon-tab.tsx`

```tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconSparkles, IconCheck } from "@tabler/icons-react";

export function ComingSoonTab({ title, description, features }) {
  return (
    <Card className="p-12 text-center">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10">
          <IconSparkles className="h-12 w-12 text-primary" />
        </div>
        
        <div>
          <Badge variant="outline" className="mb-4">Coming Soon</Badge>
          <h2 className="text-3xl font-bold mb-3">{title}</h2>
          <p className="text-muted-foreground text-lg">{description}</p>
        </div>

        <div className="grid gap-3 text-left max-w-md mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
              <IconCheck className="h-5 w-5 text-green-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          This feature is currently in development. Stay tuned for updates!
        </p>
      </div>
    </Card>
  );
}
```

---

### 4. Custom Hooks

**File**: `apps/main-frontend/hooks/useWebSocket.ts`

```typescript
import { useEffect, useState, useCallback } from "react";
import { getToken } from "@/lib/api-client";

export function useWebSocket(projectId: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = getToken();
    if (!token || !projectId) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL);

    ws.onopen = () => {
      setConnected(true);
      // Join project room
      ws.send(JSON.stringify({
        type: "join-project-room",
        token,
        projectId,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new-message") {
        setMessages(prev => [...prev, data]);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [projectId]);

  const sendMessage = useCallback((message: any) => {
    if (socket && connected) {
      socket.send(JSON.stringify({
        ...message,
        token: getToken(),
      }));
    }
  }, [socket, connected]);

  return { sendMessage, connected, messages };
}
```

---

## 📝 TypeScript Types

**File**: `apps/main-frontend/types/teams.ts`

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export enum ProjectRole {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  senderId: string;
  receiverId: string;
  status: InvitationStatus;
  role: ProjectRole;
  message?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  project?: {
    id: string;
    title: string;
    description?: string;
  };
  sender?: User;
  receiver?: User;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  joinedAt: string;
  user: User;
}

export enum NotificationType {
  PROJECT_INVITATION = "PROJECT_INVITATION",
  INVITATION_ACCEPTED = "INVITATION_ACCEPTED",
  INVITATION_REJECTED = "INVITATION_REJECTED",
  MEMBER_JOINED = "MEMBER_JOINED",
  MEMBER_LEFT = "MEMBER_LEFT",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  MESSAGE_RECEIVED = "MESSAGE_RECEIVED",
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}
```

---

## 🔄 Integration Points

### 1. Update Workspace/Projects to Show Team Members

In `/workspace` and `/editor` pages, show team members for collaborative projects.

### 2. Permissions Enforcement

Ensure only `OWNER` can:
- Delete project
- Remove members
- Send invitations
- Update member roles

Both `OWNER` and `MEMBER` can:
- View project
- Edit code (in conversation)
- View chat messages

### 3. Notification Bell (Global)

Add notification bell to main navigation with unread badge.

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] User search returns correct results
- [ ] Invitation creation validates permissions
- [ ] Duplicate invitations prevented
- [ ] Accept invitation creates ProjectMember
- [ ] Reject invitation updates status
- [ ] Only owner can remove members
- [ ] Member can leave project
- [ ] Notifications created for all events

### Frontend Tests
- [ ] User search debouncing works
- [ ] Invitation cards render correctly
- [ ] Accept/reject buttons work
- [ ] WebSocket connection established
- [ ] Real-time messages received
- [ ] Tab navigation works
- [ ] Coming soon tabs show correctly

### Integration Tests
- [ ] Full invitation flow (send → receive → accept)
- [ ] WebSocket events propagate correctly
- [ ] Permissions enforced on all routes
- [ ] Concurrent invitations handled

---

## 📦 Implementation Phases

### Phase 1: Database & Backend (Week 1)
1. Create database migration
2. Implement team controllers
3. Add team routes
4. Test API endpoints

### Phase 2: Frontend UI (Week 2)
1. Create Teams page layout
2. Build UserSearchDialog
3. Build InvitationList components
4. Implement API client functions

### Phase 3: WebSocket Integration (Week 3)
1. Enhance WebSocket backend
2. Implement TeamChat component
3. Add real-time notifications
4. Test WebSocket events

### Phase 4: Polish & Testing (Week 4)
1. Add animations/transitions
2. Implement coming-soon tabs
3. Integration testing
4. Bug fixes & optimization

---

## 🚀 Future Enhancements (Phase 2+)

### World Tab
- Public project showcase
- Trending projects
- Global user directory
- Open-source collaboration
- Forking projects

### Learn Tab
- Interactive tutorials
- Coding challenges
- Skill assessments
- Certification system
- Leaderboards

### Additional Features
- Project templates
- Role-based access control (beyond Owner/Member)
- Project analytics
- Team activity feed
- File-level permissions
- Code review system

---

## 📚 Dependencies to Install

### Backend
```bash
# No new dependencies needed
# Uses existing: Prisma, Express, WebSocket
```

### Frontend
```bash
npm install date-fns  # For date formatting
# All other UI components already exist (shadcn/ui)
```

---

## ✅ Definition of Done

- [ ] Users can search and invite others to projects
- [ ] Invitations can be accepted/rejected
- [ ] Real-time chat works for team projects
- [ ] Notifications system operational
- [ ] All API endpoints secured with auth
- [ ] TypeScript types complete
- [ ] No console errors
- [ ] Responsive design
- [ ] Coming-soon tabs implemented
- [ ] Documentation complete

---

## 🎯 Success Metrics

- Invitation acceptance rate > 70%
- WebSocket connection success rate > 95%
- API response time < 200ms (p95)
- Zero permission bypass vulnerabilities
- User satisfaction with collaboration features

---

**END OF IMPLEMENTATION PLAN**
