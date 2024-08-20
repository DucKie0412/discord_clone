import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface InviteCodePageProps {
    params: {
        inviteCode: string;
    }
}

const InviteCodePage = async ({
    params
}: InviteCodePageProps) => {
    const profile = await currentProfile();
    if(!profile) {
        return redirect("/sign-in");
    }
    if(!params.inviteCode) {
        console.log("Invite Code not found!");
        
        return redirect("/");
    }

    const existingServer = await db.server.findFirst({
        where:{
            inviteCode: params.inviteCode,
            member: {
                some: {
                    profileId: profile.id
                }
            }
        }
    });

    if(existingServer) {
        console.log("Server already exists!");
        return redirect(`/servers/${existingServer.id}`);
        
    }

    const server = await db.server.update({
        where: {
            inviteCode: params.inviteCode
        },
        data: {
            member: {
                create: {
                    profileId: profile.id
                }
            }
        }
    })

    if(server){
        console.log("Server joined!");
        return redirect(`/servers/${server.id}`);
    }

    return(
        <div>
            INvite Code Page
        </div>
    )
}
export default InviteCodePage;