"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { ImageResource } from "../entity/ImageResource";
import { UploadButton } from "../shared/UploadButton";
import { uploadMedia } from "@/utils/uploadMedia";

export const ImageResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    
    store.addImageResource(URL.createObjectURL(file));
    
    // try {
    //   const mediaURL = await uploadMedia(file);
    //   console.log("Upload successful:", mediaURL);
  
    //     const imageElement = document.createElement("IMG");
    //     imageElement.src = mediaURL;
  
    //     videoElement.onloadedmetadata = () => {
    //       const videoDuration = videoElement.duration;
    //       if (videoDuration <= 600) { // 10 MIN LIMIT
    //         console.log("Adding video to store");
    //         store.addVideoResource(mediaURL);
    //       } else {
    //         alert("Only videos with a length of 10 minutes or less are accepted.");
    //       }
    //     };
      
    // } catch (error) {
    //   console.error("Failed to handle file:", error);
    // }

  };
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Images
      </div>
      <UploadButton
        accept="image/*"
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
        onChange={handleFileChange}
      />
      <div >
        {store.images.map((image, index) => {
          return <ImageResource key={image} image={image} index={index} />;
        })}
      </div>

    </>
  );
});
