import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
     <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome to Next.js!   
        </h1>
        <p className="mb-8 text-zinc-700 dark:text-zinc-300">
          This is a simple starter template with Tailwind CSS and Dark Mode support.
        </p>
        <Image
          src="/nextjs-logo.png"
          alt="Next.js Logo"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>  
    </div>
  );
}
