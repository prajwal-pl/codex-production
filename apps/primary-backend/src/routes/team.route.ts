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
