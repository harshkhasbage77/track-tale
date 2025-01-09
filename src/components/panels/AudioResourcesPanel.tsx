"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { AudioResource } from "../entity/AudioResource";
import { UploadButton } from "../shared/UploadButton";
import { uploadMedia } from "@/utils/uploadMedia";

export const AudioResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // TEMPORARY SOLUTION
    const formData = new FormData();
    formData.append("file", file);
    
    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      return response.json();
    })
    .then((data) => console.log("Upload successful:", data))
    .catch((error) => console.error("Error:", error));
    
    store.addAudioResource(URL.createObjectURL(file));

    // RIGHT WAY
    // try {
    //   const mediaURL = await uploadMedia(file);
    //   console.log("Upload successful:", mediaURL);
  
    //     const audioElement = document.createElement("audio");
    //     audioElement.src = mediaURL;
  
    //     audioElement.onloadedmetadata = () => {
    //       const audioDuration = audioElement.duration;
    //       if (audioDuration <= 600) { // 10 MIN LIMIT
    //         console.log("Adding audio to store");
    //         store.addAudioResource(mediaURL);
    //       } else {
    //         alert("Only audios with a length of 10 minutes or less are accepted.");
    //       }
    //     };
      
    // } catch (error) {
    //   console.error("Failed to handle file:", error);
    // }
    
    
  };
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Audios
      </div>
      {store.audios.map((audio, index) => {
        return <AudioResource key={audio} audio={audio} index={index} />;
      })}
      <UploadButton
        accept="audio/mp3,audio/*"
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
        onChange={handleFileChange}
      />
    </>
  );
});
