import Link from 'next/link';

export default function Home() {

  return (
    <main className="min-h-screen grid place-items-center">

      <h1 className="">
        This page will be the home page, can add links for loggin in and registering. Ill add the buttons for funzies
      </h1>
      <div className="flex gap-4">
        <Link
          className="btn-gold"
          href="/login">
          Login
        </Link>
        <Link
          className="btn-gold"
          href="/register">
          Register
        </Link>
      </div>
    </main>
  );
}
