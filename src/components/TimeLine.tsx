"use client";
import React from "react";
import { SeekPlayer } from "./timeline-related/SeekPlayer";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { TimeFrameView } from "./timeline-related/TimeFrameView";

export const TimeLine = observer(() => {
  const store = React.useContext(StoreContext);
  const percentOfCurrentTime = (store.currentTimeInMs / store.maxTime) * 100;
  return (
    <div className="flex flex-col">
      <SeekPlayer />
      <div className="relative overflow-y-auto timeline-elements custom-scrollbar h-[360px]">
        {store.editorElements.map((element) => {
          return <TimeFrameView key={element.id} element={element} />;
        })}
        <div
          // className="w-[2px] bg-red-400 absolute top-0 bottom-0 z-20"
          className="w-[2px] bg-red-400 absolute top-0 z-20"
          style={{
            left: `${percentOfCurrentTime}%`,
            height: `${store.editorElements.length * 68}px`,
          }}
        ></div>
      </div>
    </div>
  );
});
