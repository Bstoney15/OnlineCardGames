import { Link } from 'react-router-dom'
import Card from "/src/components/card/card.jsx";

function Register() {

  return (
      <div className='min-h-screen flex flex-col items-center justify-center'>
        <Card suit="0" rank="0" />
        <h1 className='my-2'>Register Page</h1>
        <Link to='/' className='btn-cyan-glow my-5'>Back to Home</Link>
      </div>
  )
}

export default Register