import type { Request, Response } from "express";
import prisma from "@repo/db/client";
import { InvitationStatus, NotificationType, ProjectRole } from "@repo/db/generated/prisma";

interface AuthRequest extends Request {
    userId: string;
}

export const searchUsersHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, limit = "20" } = req.query;
        const userId = (req as AuthRequest).userId;

        if (!q || typeof q !== "string") {
            res.status(400).json({ success: false, error: "Search query required" });
            return;
        }

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { name: { contains: q, mode: "insensitive" } },
                            { email: { contains: q, mode: "insensitive" } },
                        ],
                    },
                    { id: { not: userId } },
                ],
            },
            select: { id: true, name: true, email: true },
            take: parseInt(limit as string, 10),
        });

        res.json({ success: true, users });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ success: false, error: "Failed to search users" });
    }
};

export const sendInvitationHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId, receiverId, role = "MEMBER", message } = req.body;
        const senderId = (req as AuthRequest).userId;

        if (!projectId || !receiverId) {
            res.status(400).json({ success: false, error: "Project ID and receiver ID required" });
            return;
        }

        const [project, receiver, existingMember, existingInvitation] = await Promise.all([
            prisma.project.findFirst({ where: { id: projectId, userId: senderId }, include: { user: true } }),
            prisma.user.findUnique({ where: { id: receiverId } }),
            prisma.projectMember.findFirst({ where: { projectId, userId: receiverId } }),
            prisma.projectInvitation.findFirst({ where: { projectId, receiverId, status: InvitationStatus.PENDING } }),
        ]);

        if (!project) {
            res.status(403).json({ success: false, error: "Not authorized" });
            return;
        }
        if (!receiver) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        if (existingMember) {
            res.status(400).json({ success: false, error: "User is already a member" });
            return;
        }
        if (existingInvitation) {
            res.status(400).json({ success: false, error: "Invitation already sent" });
            return;
        }

        const invitation = await prisma.projectInvitation.create({
            data: { projectId, senderId, receiverId, role: role as ProjectRole, message },
            include: {
                project: { select: { id: true, title: true, description: true } },
                sender: { select: { id: true, name: true, email: true } },
                receiver: { select: { id: true, name: true, email: true } },
            },
        });

        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: NotificationType.PROJECT_INVITATION,
                title: "New Project Invitation",
                message: `${project.user.name} invited you to collaborate on "${project.title}"`,
                data: { invitationId: invitation.id, projectId },
            },
        });

        res.json({ success: true, invitation });
    } catch (error) {
        console.error("Send invitation error:", error);
        res.status(500).json({ success: false, error: "Failed to send invitation" });
    }
};

export const getPendingInvitationsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).userId;

        const invitations = await prisma.projectInvitation.findMany({
            where: { receiverId: userId, status: InvitationStatus.PENDING },
            include: {
                project: { select: { id: true, title: true, description: true } },
                sender: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ success: true, invitations });
    } catch (error) {
        console.error("Get invitations error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch invitations" });
    }
};

export const getSentInvitationsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).userId;

        const invitations = await prisma.projectInvitation.findMany({
            where: { senderId: userId },
            include: {
                project: { select: { id: true, title: true, description: true } },
                receiver: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ success: true, invitations });
    } catch (error) {
        console.error("Get sent invitations error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch sent invitations" });
    }
};

export const acceptInvitationHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const invitationId = req.params.invitationId as string;
        const userId = (req as AuthRequest).userId;

        const invitation = await prisma.projectInvitation.findFirst({
            where: { id: invitationId, receiverId: userId, status: InvitationStatus.PENDING },
            include: { project: true, sender: true },
        });

        if (!invitation) {
            res.status(404).json({ success: false, error: "Invitation not found or already processed" });
            return;
        }

        const member = await prisma.projectMember.create({
            data: { userId, projectId: invitation.projectId, role: invitation.role },
            include: { User: { select: { id: true, name: true, email: true } } },
        });

        await Promise.all([
            prisma.projectInvitation.update({
                where: { id: invitationId },
                data: { status: InvitationStatus.ACCEPTED },
            }),
            prisma.notification.create({
                data: {
                    userId: invitation.senderId,
                    type: NotificationType.INVITATION_ACCEPTED,
                    title: "Invitation Accepted",
                    message: `${member.User.name} accepted your invitation to "${invitation.project.title}"`,
                    data: { projectId: invitation.projectId, memberId: member.id },
                },
            }),
        ]);

        res.json({ success: true, project: invitation.project, member });
    } catch (error) {
        console.error("Accept invitation error:", error);
        res.status(500).json({ success: false, error: "Failed to accept invitation" });
    }
};

export const rejectInvitationHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const invitationId = req.params.invitationId as string;
        const userId = (req as AuthRequest).userId;

        const invitation = await prisma.projectInvitation.findFirst({
            where: { id: invitationId, receiverId: userId, status: InvitationStatus.PENDING },
            include: { project: true, receiver: true },
        });

        if (!invitation) {
            res.status(404).json({ success: false, error: "Invitation not found or already processed" });
            return;
        }

        await Promise.all([
            prisma.projectInvitation.update({
                where: { id: invitationId },
                data: { status: InvitationStatus.REJECTED },
            }),
            prisma.notification.create({
                data: {
                    userId: invitation.senderId,
                    type: NotificationType.INVITATION_REJECTED,
                    title: "Invitation Declined",
                    message: `${invitation.receiver.name} declined your invitation to "${invitation.project.title}"`,
                    data: { projectId: invitation.projectId },
                },
            }),
        ]);

        res.json({ success: true });
    } catch (error) {
        console.error("Reject invitation error:", error);
        res.status(500).json({ success: false, error: "Failed to reject invitation" });
    }
};

export const cancelInvitationHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const invitationId = req.params.invitationId as string;
        const userId = (req as AuthRequest).userId;

        const invitation = await prisma.projectInvitation.findFirst({
            where: { id: invitationId, senderId: userId, status: InvitationStatus.PENDING },
        });

        if (!invitation) {
            res.status(404).json({ success: false, error: "Invitation not found or cannot be cancelled" });
            return;
        }

        await Promise.all([
            prisma.projectInvitation.update({
                where: { id: invitationId },
                data: { status: InvitationStatus.CANCELLED },
            }),
            prisma.notification.create({
                data: {
                    userId: invitation.receiverId,
                    type: NotificationType.PROJECT_UPDATED,
                    title: "Invitation Cancelled",
                    message: "A project invitation was cancelled",
                    data: { invitationId },
                },
            }),
        ]);

        res.json({ success: true });
    } catch (error) {
        console.error("Cancel invitation error:", error);
        res.status(500).json({ success: false, error: "Failed to cancel invitation" });
    }
};

export const getProjectMembersHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const projectId = req.params.projectId as string;
        const userId = (req as AuthRequest).userId;

        const [isMember, isOwner] = await Promise.all([
            prisma.projectMember.findFirst({ where: { projectId, userId } }),
            prisma.project.findFirst({ where: { id: projectId, userId } }),
        ]);

        if (!isMember && !isOwner) {
            res.status(403).json({ success: false, error: "Not authorized to view project members" });
            return;
        }

        const members = await prisma.projectMember.findMany({
            where: { projectId },
            include: { User: { select: { id: true, name: true, email: true } } },
            orderBy: { joinedAt: "desc" },
        });

        res.json({ success: true, members });
    } catch (error) {
        console.error("Get members error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch project members" });
    }
};

export const removeMemberHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId, memberId } = req.params as { projectId: string; memberId: string };
        const userId = (req as AuthRequest).userId;

        const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
        if (!project) {
            res.status(403).json({ success: false, error: "Only project owner can remove members" });
            return;
        }

        const member = await prisma.projectMember.findUnique({
            where: { id: memberId },
            include: { User: true },
        });

        if (!member || member.projectId !== projectId || member.userId === userId) {
            res.status(400).json({ success: false, error: "Cannot remove this member" });
            return;
        }

        await Promise.all([
            prisma.projectMember.delete({ where: { id: memberId } }),
            prisma.notification.create({
                data: {
                    userId: member.userId,
                    type: NotificationType.MEMBER_LEFT,
                    title: "Removed from Project",
                    message: `You were removed from "${project.title}"`,
                    data: { projectId },
                },
            }),
        ]);

        res.json({ success: true });
    } catch (error) {
        console.error("Remove member error:", error);
        res.status(500).json({ success: false, error: "Failed to remove member" });
    }
};

export const updateMemberRoleHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId, memberId } = req.params as { projectId: string; memberId: string };
        const { role } = req.body;
        const userId = (req as AuthRequest).userId;

        if (!role || !["OWNER", "MEMBER"].includes(role)) {
            res.status(400).json({ success: false, error: "Valid role required" });
            return;
        }

        const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
        if (!project) {
            res.status(403).json({ success: false, error: "Only project owner can update member roles" });
            return;
        }

        const member = await prisma.projectMember.update({
            where: { id: memberId },
            data: { role: role as ProjectRole },
            include: { User: { select: { id: true, name: true, email: true } } },
        });

        res.json({ success: true, member });
    } catch (error) {
        console.error("Update role error:", error);
        res.status(500).json({ success: false, error: "Failed to update member role" });
    }
};

export const leaveProjectHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const projectId = req.params.projectId as string;
        const userId = (req as AuthRequest).userId;

        const isOwner = await prisma.project.findFirst({ where: { id: projectId, userId } });
        if (isOwner) {
            res.status(400).json({ success: false, error: "Owner cannot leave project. Transfer ownership first." });
            return;
        }

        const member = await prisma.projectMember.findFirst({ where: { projectId, userId } });
        if (!member) {
            res.status(404).json({ success: false, error: "You are not a member of this project" });
            return;
        }

        const project = await prisma.project.findUnique({ where: { id: projectId } });

        await Promise.all([
            prisma.projectMember.delete({ where: { id: member.id } }),
            project ? prisma.notification.create({
                data: {
                    userId: project.userId,
                    type: NotificationType.MEMBER_LEFT,
                    title: "Member Left Project",
                    message: `A member left "${project.title}"`,
                    data: { projectId },
                },
            }) : Promise.resolve(),
        ]);

        res.json({ success: true });
    } catch (error) {
        console.error("Leave project error:", error);
        res.status(500).json({ success: false, error: "Failed to leave project" });
    }
};

export const getNotificationsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit = "50", offset = "0", unreadOnly = "false" } = req.query;
        const userId = (req as AuthRequest).userId;

        const where: any = { userId };
        if (unreadOnly === "true") {
            where.isRead = false;
        }

        const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: parseInt(limit as string, 10),
                skip: parseInt(offset as string, 10),
            }),
            prisma.notification.count({ where: { userId, isRead: false } }),
        ]);

        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch notifications" });
    }
};

export const markNotificationReadHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const notificationId = req.params.notificationId as string;
        const userId = (req as AuthRequest).userId;

        await prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({ success: false, error: "Failed to mark notification as read" });
    }
};

export const markAllNotificationsReadHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).userId;

        const result = await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        res.json({ success: true, count: result.count });
    } catch (error) {
        console.error("Mark all read error:", error);
        res.status(500).json({ success: false, error: "Failed to mark all notifications as read" });
    }
};

/**
 * Get collaborative projects where user is a member (not owner)
 */
export const getCollaborativeProjectsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).userId;

        // Get projects where user is a member
        const memberships = await prisma.projectMember.findMany({
            where: { userId },
            include: {
                Project: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
            },
            orderBy: { joinedAt: "desc" },
        });

        // Get all members for each project
        const projectsWithMembers = await Promise.all(
            memberships.map(async (membership) => {
                const members = await prisma.projectMember.findMany({
                    where: { projectId: membership.Project.id },
                    include: { User: { select: { id: true, name: true, email: true } } },
                    orderBy: { joinedAt: "asc" },
                });

                return {
                    id: membership.Project.id,
                    title: membership.Project.title,
                    description: membership.Project.description,
                    createdAt: membership.Project.createdAt,
                    updatedAt: membership.Project.updatedAt,
                    owner: membership.Project.user,
                    userRole: membership.role,
                    members: members.map((m) => ({
                        id: m.id,
                        userId: m.userId,
                        projectId: m.projectId,
                        role: m.role,
                        joinedAt: m.joinedAt,
                        user: m.User,
                    })),
                    memberCount: members.length,
                };
            })
        );

        res.json({ success: true, projects: projectsWithMembers });
    } catch (error) {
        console.error("Get collaborative projects error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch collaborative projects" });
    }
};
