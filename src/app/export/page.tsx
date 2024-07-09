'use client';

// import dynamic from 'next/dynamic'

// const DynmicEditor = dynamic(() => import('../../components/Editor').then(a => a.EditorWithStore), {
//   ssr: false,
// })


function ExportPage() {
  return (
    // <DynmicEditor />
    <>
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className='text-5xl'>Export Page</h1>
        </div>
    </>
  );
}

ExportPage.diplsayName = "EditorPage";

export default ExportPage;
