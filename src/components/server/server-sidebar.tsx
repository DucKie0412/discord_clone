import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";

interface ServerSidebarProps {
    serverId: string
}

export const ServerSidebar = async ({
    serverId
}: ServerSidebarProps) => {
    const profile = await currentProfile();
    if (!profile) {
        return redirect('/');
    }

    const server = await db.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            channel: {
                orderBy: {
                    createdAt: 'asc',
                }
            },
            member: {
                include: {
                    profile: true
                },
                orderBy: {
                    role: "asc"
                }
            }
        }
    })

    const textChannels = server?.channel.filter((channel) => channel.type === ChannelType.TEXT)
    const voiceChannels = server?.channel.filter((channel) => channel.type === ChannelType.VOICE)
    const videoChannels = server?.channel.filter((channel) => channel.type === ChannelType.VIDEO)

    const members = server?.member.filter((member) => member.profileId !== profile.id)

    if(!server) {
        return redirect('/');
    }

    const role = server.member.find((member) => member.profileId === profile.id)?.role;

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2D2B31] bg-[#F2F3F5]">
            <ServerHeader server={server} role={role}/>
        </div>
    )
}
