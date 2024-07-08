export default function Home() {
  return (
    <div className="p-4 text-center items-center h-screen flex">
      <div className="w-full">
        <h1 className="text-3xl font-bold">Home Page</h1>
        <p className='text-2xl '>
          Link to <a href="/editor" className='text-sky-400'>Editor</a>
        </p>
      </div>
    </div>
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    //   <a
    //     href="/editor"
    //     className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
    //     rel="noopener noreferrer"
    //   >
    //     <h2 className={`mb-3 text-2xl font-semibold`}>
    //       Go To Editor{" "}
    //       <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
    //         -&gt;
    //       </span>
    //     </h2>
    //     <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
    //       Created By Amit Digga
    //     </p>
    //   </a>
    // </main>
  );
}
