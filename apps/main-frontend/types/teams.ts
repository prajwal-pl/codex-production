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
