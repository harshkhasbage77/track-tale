"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { VideoResource } from "../entity/VideoResource";
import { UploadButton } from "../shared/UploadButton";

export const VideoResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const videoURL = URL.createObjectURL(file);
    const videoElement = document.createElement('video');
    videoElement.src = videoURL;
    console.log('videoURL:', videoURL);

    videoElement.onloadedmetadata = () => {
      const videoDuration = videoElement.duration;
      console.log('videoDuration:', videoDuration);
      if (videoDuration <= 600) { // 600 seconds = 10 minutes
        store.addVideoResource(videoURL);
      } else {
        alert('Only videos with a length of 10 minutes or less are accepted.');
        URL.revokeObjectURL(videoURL);
      }
    };
    
    // store.addVideoResource(videoURL);
  };
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
          Video Files
        </div>
        {store.videos.map((video, index) => {
          return <VideoResource key={video} video={video} index={index} />;
        })}
        <UploadButton
          accept="video/x-m4v,video/*,video/webm,video/quicktime,video/3gpp,video/x-msvideo,video/x-ms-wmv,video/mp4,image/gif"
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
          onChange={handleFileChange} 
        />
      </div>
    </>
  );
});
