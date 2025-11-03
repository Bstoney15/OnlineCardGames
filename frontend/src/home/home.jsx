import { Link } from 'react-router-dom';
import ActiveUsers from '/src/components/activeUsers/activeUsers';

// will need to auth user for this page. Need to redirect to '/' if user isnt logged in.
function Home () {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <ActiveUsers />
            <Link to='/' className='btn-cyan-glow'>Go back home</Link>
            <Link to='/stats' className='btn-cyan-glow'>View your stats</Link>
        </div>
    )
}

export default Home;   