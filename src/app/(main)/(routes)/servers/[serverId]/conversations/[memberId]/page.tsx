import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { getOrCreateConservation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface MemberIdPageProps {
    params: {
        serverId: string;
        memberId: string;
    },
    searchParams: {
        video?: boolean;
    }
}

const MemberIdPage = async ({
    params,
    searchParams
}: MemberIdPageProps) => {
    const profile = currentProfile();

    if (!profile) {
        return redirect('/')
    }

    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            //@ts-ignore
            profileId: profile.id
        },
        include: {
            profile: true
        }
    })

    if (!currentMember) {
        return redirect('/')
    }

    const conversation = await getOrCreateConservation(currentMember.id, params.memberId);

    if (!conversation) {
        return redirect(`/servers/${params.serverId}`)
    }

    const { memberOne, memberTwo } = conversation;
    //@ts-ignore
    const otherMember = memberOne.profileId === profile.id ? memberTwo : memberTwo;

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                imageUrl={otherMember.profile.imageUrl}
                name={otherMember.profile.name}
                serverId={params.serverId}
                type="conversation"
            />
            {searchParams.video && (
                <MediaRoom 
                    chatId={conversation.id}
                    video={true}
                    audio={true}
                />
            )}
            {!searchParams.video && (
                <>
                    <ChatMessages
                        member={currentMember}
                        name={otherMember.profile.name}
                        chatId={conversation.id}
                        type="conversation"
                        apiUrl="/api/direct-messages"
                        paramKey="conversationId"
                        paramValue={conversation.id}
                        socketUrl="/api/socket/direct-messages"
                        socketQuery={{
                            conversationId: conversation.id
                        }}
                    />

                    <ChatInput
                        name={otherMember.profile.name}
                        type="conversation"
                        apiUrl="/api/socket/direct-messages"
                        query={{
                            conversationId: conversation.id
                        }}
                    />
                </>
            )}
        </div>
    )
}

export default MemberIdPage;