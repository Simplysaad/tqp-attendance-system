import { redirect } from 'next/navigation'

const page = () => {
    redirect("/schedule/create")
    return (
        <div>page</div>
    )
}

export default page