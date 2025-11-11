import { useEffect, useState } from "react"
import { getActivePlayers, getUserInformation } from "../../lib/apiClient";


function NavBar() {
    const [activePlayers, setActivePlayers] = useState(0);
    const [userInfo, setUserInfo] = useState({});

    useEffect( () => {
        // fetch any user data needed

        async function fetchActivePlayers() {
            const activePlayers = await getActivePlayers()
            setActivePlayers(activePlayers.data)

            const userInfo =  await getUserInformation() // need to make the api in go backend. 
            setUserInfo(userInfo.data)
        }

        fetchActivePlayers()

    }, []);


    // make this look pretty
    return (
        <div className="navbar"> 
            <h1>Active Players</h1>
            <p>{activePlayers}</p>
        </div>
    )
}

export default NavBar;