import { getTutorStudents } from "@/actions/enrollment.action";

export default async function TutorStudentsList({ userId }: { userId: string }) {
    const { students } = await getTutorStudents(userId);

    return (
        <div className="border rounded-lg p-5 bg-white shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
                <div>
                    <h3 className="font-semibold text-gray-800">Enrolled Students</h3>
                    <p className="text-xs text-gray-500">Students committed to your class schedules</p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                    {students.length} Student(s)
                </span>
            </div>

            {students.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                            <tr>
                                <th className="py-2.5 px-3">Student Name</th>
                                <th className="py-2.5 px-3">Contact</th>
                                <th className="py-2.5 px-3">Assigned Slot</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {students.map((st: any) => (
                                <tr key={st._id} className="hover:bg-gray-50">
                                    <td className="py-3 px-3 font-medium text-gray-900">{st.fullName}</td>
                                    <td className="py-3 px-3 text-xs">{st.email}</td>
                                    <td className="py-3 px-3 text-xs capitalize text-emerald-700 font-medium">
                                        {st.enrolledSlot}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-500 py-4 text-center border border-dashed rounded-lg">
                    No students have enrolled in your schedules yet.
                </p>
            )}
        </div>
    );
}