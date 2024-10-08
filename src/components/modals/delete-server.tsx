"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { useModal } from "@/hooks/use-modal-store";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const DeleteServerModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "deleteServer";
    const {server} = data;
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const onClick = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`/api/servers/${server?.id}`);

            // Navigate back to home page after leaving the server
            onClose();
            router.refresh();
            router.push("/");
        } catch (error) {
            console.log(error);
        }
        finally{
            setIsLoading(false);
        }
    }
    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Delete Server
                    </DialogTitle>
                <DialogDescription className="text-center">
                    Are you sure you want to delete
                    <span className="font-semibold text-indigo-500 ml-1">{server?.name}</span>? 
                    You will lose access to all of its channels and messages.
                    
                </DialogDescription>
                </DialogHeader>
                <DialogFooter
                className="bg-gray-100 px-6 py-4"
                >
                    <div className="flex items-center justify-between w-full">
                        <Button
                        disabled={isLoading}
                        variant={"ghost"}
                        onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button
                        disabled={isLoading}
                        variant={"primary"}
                        onClick={onClick} 
                        >
                            Confirm
                        </Button>
                    </div>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}