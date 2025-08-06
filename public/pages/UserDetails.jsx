const { useState, useEffect } = React
const { useParams, useNavigate, NavLink } = ReactRouterDOM

import { BugList } from "../cmps/BugList.jsx"
import { bugService } from "../services/bug.service.js"
import { userService } from "../services/user.service.js"


export function UserDetails() {

    const [user, setUser] = useState(null)
    const [bugs, setBugs] = useState(null)

    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        loadUser()
        loadBugs()
    }, [params.userId])


    function loadUser() {
        userService.getById(params.userId)
            .then(setUser)
            .catch(err => {
                console.log('err:', err)
                navigate('/')
            })
    }

    function loadBugs() {
        bugService.query({ userId: params.userId })
            .then(res => {
                setBugs(res.bugs)
            })
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
    }

    if (!user) return <div>Loading...</div>

    return <section className="user-details">
        <h1>Name: {user.fullname}</h1>
        <p>Username: {user.username}</p>
        <p>Score: {user.score}</p>
        {user.isAdmin && <p>Role: Admin</p>}
        {user.isAdmin && <NavLink to="/user" >See all users</NavLink>}

        {!bugs && <div>You dont have bugs</div>}
        {bugs && <BugList bugs={bugs} />}

        <button onClick={()=> navigate(-1)} >Back</button>
    </section>
}