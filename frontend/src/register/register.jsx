import { Link } from 'react-router-dom'

function Register() {

  return (
      <div className='min-h-screen flex flex-col items-center justify-center'>
        <h1 className='my-2'>Register Page</h1>
        <Link to='/' className='btn-gold my-5'>Back to Home</Link>
      </div>
  )
}

export default Register