import prisma from "@repo/db/client";

export const getOrCreateRoom = async (roomId: string, userId: string) => {
  let room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    room = await prisma.chatRoom.create({
      data: {
        id: roomId,
        name: `Room ${roomId}`,
        isGroup: true,
        members: {
          create: {
            user: {
              connect: { id: userId },
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  } else {
    const isMember = await prisma.chatParticipant.findFirst({
      where: {
        chatRoom: {
          id: roomId,
        },
        user: {
          id: userId,
        },
      },
    });
    if (!isMember) {
      await prisma.chatParticipant.create({
        data: {
          chatRoom: {
            connect: { id: roomId },
          },
          user: {
            connect: { id: userId },
          },
        },
      });
    }
  }

  return room;
};
