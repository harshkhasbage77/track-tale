"use client";
import React from "react";
import { StoreContext } from "@/store";
import { formatTimeToMinSec } from "@/utils";
import { observer } from "mobx-react";
import { MdAdd, MdDelete } from "react-icons/md";

type VideoResourceProps = {
  video: string;
  index: number;
};

export const VideoResource = observer(
  ({ video, index }: VideoResourceProps) => {
    const store = React.useContext(StoreContext);
    const ref = React.useRef<HTMLVideoElement>(null);
    const [formatedVideoLength, setFormatedVideoLength] =
      React.useState("00:00");

    // // Automatically add INTRO and OUTRO videos to canvas if index is 0 or 4
    // React.useEffect(() => {
    //   if (index === 0 || index === 4) {
    //     store.addVideo(index);
    //   }
    // }, [index, store]);

    React.useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (index === 0 || index === 4) {
          store.addVideo(index); // Add INTRO or OUTRO video to canvas
        }
      }, 3000); // Delay of 3 seconds
    
      // Cleanup function to clear the timeout if the component unmounts
      return () => clearTimeout(timeoutId);
    }, [index, store]); 

    return (
      <div className="rounded-lg overflow-hidden items-center 
      bg-slate-800 
      m-[15px] flex flex-col relative">
        <div className="bg-[rgba(0,0,0,.25)] text-white py-1 absolute text-base top-2 right-2">
          {formatedVideoLength}
        </div>
        <button
          // className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded z-10 text-white font-bold py-1 absolute text-lg bottom-2 right-2"
          className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded-full z-10 text-white font-bold p-1 absolute text-lg bottom-2 right-2"
          onClick={() => store.addVideo(index)}
        >
          <MdAdd size="25" />
        </button>
        {index < 5 ? null : (
          <button
            // className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded z-10 text-white font-bold py-1 absolute text-lg bottom-2 right-2"
            className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded-full z-10 text-white font-bold p-1 absolute text-lg bottom-2 right-12"
            onClick={() => {
              console.log("delete video");
              const deleteConfirmation = confirm("Are you sure you want to delete the video? This may affect your project.");
              if(deleteConfirmation){
                store.deleteVideoResource(video);
              }
            }}
          >
          <MdDelete size="25" />
        </button>
        )}
        {/*  PRELOADED ALPHAS CANNOT BE REMOVED BY THE USER
        <button
          // className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded z-10 text-white font-bold py-1 absolute text-lg bottom-2 right-2"
          className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded-full z-10 text-white font-bold p-1 absolute text-lg bottom-2 right-12"
          onClick={() => {
            console.log("delete video");
            const deleteConfirmation = confirm("Are you sure you want to delete the video? This may affect your project.");
            if(deleteConfirmation){
              store.deleteVideoResource(video);
            }
          }}
        >
          <MdDelete size="25" />
        </button> */}
        <video
          onLoadedData={() => {
            const videoLength = ref.current?.duration ?? 0;
            setFormatedVideoLength(formatTimeToMinSec(videoLength));
          }}
          ref={ref}
          className="max-h-[100px] max-w-[150px]"
          src={video}
          height={200}
          width={200}
          id={`video-${index}`}
          autoPlay
          muted
          loop
        ></video>
      </div>
    );
  }
);
