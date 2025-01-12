import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Parse the incoming file data
    const formData = await request.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Read the file content as a buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Set the file save location and name
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
    const filePath = path.join(uploadsDir, file.name);

    // Ensure the uploads/audio directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    // Save the audio file
    await fs.writeFile(filePath, fileBuffer);

    // Respond with the saved file path
    return NextResponse.json({ filePath: `/uploads/${file.name}` });
  } catch (error) {
    console.error('Error saving audio:', error);
    return NextResponse.json({ error: 'Failed to save audio' }, { status: 500 });
  }
}


// ANY ONE OF THE BELOW TWO CODES CAN ALSO BE USED


// import { NextResponse } from 'next/server';
// import { promises as fs } from 'fs';
// import path from 'path';

// export async function POST(request: Request) {
//   try {
//     // Parse the incoming form data
//     const formData = await request.formData();
//     const file = formData.get('audio') as File;

//     if (!file) {
//       return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
//     }

//     // Read the file content as a buffer
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Define the directory and file path
//     const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
//     const filePath = path.join(uploadsDir, file.name);

//     // Ensure the uploads/audio directory exists
//     await fs.mkdir(uploadsDir, { recursive: true });

//     // Write the audio file to the directory
//     await fs.writeFile(filePath, buffer);

//     // Return the file path in the response
//     return NextResponse.json({ filePath: `/uploads/audio/${file.name}` });
//   } catch (error) {
//     console.error('Error saving audio:', error);
//     return NextResponse.json({ error: 'Failed to save audio' }, { status: 500 });
//   }
// }

// import { NextResponse } from 'next/server';
// import { promises as fs } from 'fs';
// import path from 'path';

// export async function POST(request: Request) {
//   try {
//     // Parse the incoming form data
//     const formData = await request.formData();
//     const file = formData.get('audio') as File;

//     if (!file) {
//       return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
//     }

//     // Convert the file to a Buffer
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Define the directory and file path
//     const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
//     const filePath = path.join(uploadsDir, file.name);

//     // Ensure the uploads/audio directory exists
//     await fs.mkdir(uploadsDir, { recursive: true });

//     // Write the audio file to the directory
//     await fs.writeFile(filePath, buffer as Uint8Array); // Cast buffer to Uint8Array

//     // Return the file path in the response
//     return NextResponse.json({ filePath: `/uploads/audio/${file.name}` });
//   } catch (error) {
//     console.error('Error saving audio:', error);
//     return NextResponse.json({ error: 'Failed to save audio' }, { status: 500 });
//   }
// }
