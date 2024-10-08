import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(
    req: Request
) {
    try {
        const profile = await currentProfile();
        const { name, channelType } = await req.json();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new Response("Unauthorized ", { status: 401 });
        }
        if (!serverId) {
            return new Response("Server ID is missing", { status: 400 });
        }

        if (name === "general") {
            return new Response("Name cannot be 'general'", { status: 400 });
        }

        const server = await db.server.update({
            where:{
                id: serverId,
                member: {
                    some:{
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                    }
                },
        
            data:{
                channel:{
                    create:{
                        profileId: profile.id,
                        name,
                        type: channelType
                    }
                }
            }
        });

        return NextResponse.json(server);

    } catch (error) {
        console.log("CHANNELS_POST", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

