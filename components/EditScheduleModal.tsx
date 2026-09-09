"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import EditScheduleForm, { ScheduleData } from "./editScheduleForm";

interface EditScheduleModalProps {
    schedule: ScheduleData;
    buttonLabel?: string;
    className?: string;
}

export default function EditScheduleModal({
    schedule,
    buttonLabel = "Edit",
    className = "px-3 py-1 bg-white text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold hover:bg-emerald-50 transition cursor-pointer",
}: EditScheduleModalProps) {
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
                title="Edit Class Schedule"
                subtitle="Update your class slot timing, day, or Google Meet link."
                showCancelButton={false}
            >
                <EditScheduleForm
                    schedule={schedule}
                    onSuccess={handleSuccess}
                    onCancel={handleClose}
                />
            </Modal>
        </>
    );
}