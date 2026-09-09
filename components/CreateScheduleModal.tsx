"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import CreateScheduleForm from "./CreateScheduleForm";

interface CreateScheduleModalProps {
    buttonLabel?: string;
    className?: string;
}

export default function CreateScheduleModal({
    buttonLabel = "Create Schedule",
    className = "px-4 py-2 bg-white text-emerald-700 border border-emerald-300 rounded-md text-sm font-medium hover:bg-emerald-100 transition cursor-pointer",
}: CreateScheduleModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleSuccess = () => {
        handleClose();
        router.refresh();
    };

    return (
        <>
            <button type="button" onClick={handleOpen} className={className}>
                {buttonLabel}
            </button>

            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="Create New Class Schedule"
                subtitle="Set up your availability slot and meeting link for Quran memorisation sessions."
                showCancelButton={false} // Hide modal default CTA/Cancel buttons if the form handles submission
            >
                <CreateScheduleForm onSuccess={handleSuccess} onCancel={handleClose} />
            </Modal>
        </>
    );
}