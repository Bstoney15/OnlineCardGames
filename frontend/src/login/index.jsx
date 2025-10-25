import { Link } from 'react-router-dom'

function Login() {

  return (
      <div className='min-h-screen flex flex-col items-center justify-center'>
        <h1 className='my-2'>Login Page</h1>
        <Link to='/' className='btn-cyan-glow my-5'>Back to Home</Link>
      </div>
  )
}

export default Login