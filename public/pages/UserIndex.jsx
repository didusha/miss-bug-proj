const { useState, useEffect } = React
const { useNavigate } = ReactRouterDOM

import { userService } from "../services/user.service.js"

export function UserIndex() {

    const [users, setUsers] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        loadUsers()
    }, [])

    function loadUsers() {

        userService.query()
            .then(res => setUsers(res))
            .catch(err => console.log(err))
    }

    if (!users) return <p>Loading...</p>

    return (
        <article className="user-index">
            <button onClick={() => navigate(-1)} >Back</button>
            <pre>
                {JSON.stringify(users, null, 2)}
            </pre>
        </article>
    )
}