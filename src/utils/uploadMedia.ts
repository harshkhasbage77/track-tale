export const uploadMedia = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
  
      const data = await response.json();
      return data.filePath; // Assuming server returns `{ filePath: "/uploads/<filename>" }`
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error; // Propagate the error to the caller
    }
  };
  