import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "../../../types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";

export default async function handler
(req: NextApiRequest, 
    res: NextApiResponseServerIo) {
        if(req.method !== "POST"){
            return res.status(405).json({message: "Method not allowed"});
        }

        try {
            const profile = await currentProfilePages(req);
            const {content, fileUrl} = req.body;
            const {serverId, channelId} = req.query;

            if(!profile){
                return res.status(401).json({message: "Unauthorized"});
            }

            if(!serverId){
                return res.status(400).json({message: "Server ID is required"});
            }

            if(!channelId){
                return res.status(400).json({message: "Channel ID is required"});
            }

            if(!content){
                return res.status(400).json({message: "Content is required"});
            }

            const server = db.server.findFirst({
                where: {
                    id: serverId as string,
                    member: {
                        some: {
                            profileId: profile.id
                        }
                    }
                },
                include:{
                    member: true
                }
            })

            if(!server){
                return res.status(404).json({message: "Server not found"});
            }

            const channel = await db.channel.findFirst({
                where:{
                    id: channelId as string,
                    serverId: serverId as string
                }
            })

            if(!channel){
                return res.status(404).json({message: "Channel not found"});
            }

            const members = await db.member.findMany({
                where: {
                    serverId: serverId as string,
                    profileId: profile.id
                }
            });

            const member = members[0];

            if(!member){
                return res.status(404).json({message: "Member not found"});
            }

            const message = await db.message.create({
                data:{
                    content,
                    fileUrl,
                    channelId: channelId as string,
                    memberId: member.id
                },
                include:{
                    member: {
                        include:{
                            profile: true
                        }
                    }
                }
            })

            const channelKey = `chat:${channelId}:messages`;
            res?.socket?.server?.io?.emit(channelKey, message);

            return res.status(200).json(message);

        } catch (error) {
            console.log("[MESSAGE_POST]", error);
            return res.status(500).json({message: "Internal server error"});
            
        }
}