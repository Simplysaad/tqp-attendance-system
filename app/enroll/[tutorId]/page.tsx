import { getSession } from '@/actions/user.action';
import EnrollButton from '@/components/EnrollButton';
import { redirect } from 'next/navigation';

interface EnrollProps {
    params: Promise<{ tutorId: string }>;
}

export default async function EnrollDirect({ params }: EnrollProps) {
    const currentUser = await getSession();
    const { tutorId } = await params;

    if (!currentUser) {
        redirect(`/login?next=/enroll/${tutorId}`);
    }

    if (currentUser.role !== 'student') {
        redirect('/dashboard');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1>Confirm Enrollment</h1>
            <p>Are you sure you want to enroll with this tutor?</p>
            <EnrollButton tutorId={tutorId} />
        </div>
    );
}