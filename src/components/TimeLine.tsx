// "use client";
// import React from "react";
// import { SeekPlayer } from "./timeline-related/SeekPlayer";
// import { StoreContext } from "@/store";
// import { observer } from "mobx-react";
// import { TimeFrameView } from "./timeline-related/TimeFrameView";

// export const TimeLine = observer(() => {
//   const store = React.useContext(StoreContext);
//   const percentOfCurrentTime = (store.currentTimeInMs / store.maxTime) * 100;
//   return (
//     <div className="flex flex-col bg-[#E6EAFD]">
//       <SeekPlayer />
//       <div 
//         className="relative overflow-x-scroll overflow-y-auto timeline-elements h-[360px]"
        
//       > {/* custom-scrollbar */}
//         {store.editorElements.map((element) => {
//           const duration = element.timeFrame.end - element.timeFrame.start;
//           return <>
//                   <TimeFrameView key={element.id} element={element} duration={duration}/>
//                   {/* <hr/> */}
//                  </>
//         })}
//         <div
//           // className="w-[2px] bg-red-400 absolute top-0 bottom-0 z-20"
//           className="w-[2px] bg-red-400 absolute top-0 z-20"
//           style={{
//             // left: `${percentOfCurrentTime}%`,
//             left: `${percentOfCurrentTime / 100 * (store.maxTime/1000*10)}px`, // ${store.maxTime/1000*10} is the width of the element (time to pixels conversion)
//             height: `${store.editorElements.length * 68}px`,
//           }}
//         ></div>
//       </div>
//     </div>
//   );
// });

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
    <div className="flex flex-col bg-[#E6EAFD]">
      <SeekPlayer />
      <div className="relative overflow-x-scroll overflow-y-auto timeline-elements h-[360px]">
        {/* Background with horizontal lines */}
        <div
          className="absolute top-4 left-0 w-full h-full z-0"
          style={{
            width: `${store.maxTime / 1000 * 10}px`,
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 59px,
              #b1b5bb 60px
            )`,
            pointerEvents: "none", // Ensures these lines don't interfere with interaction
          }}
        ></div>

        {/* Editor elements */}
        {store.editorElements.map((element) => {
          const duration = element.timeFrame.end - element.timeFrame.start;

          return (
            <React.Fragment key={element.id}>
              <TimeFrameView key={element.id} element={element} duration={duration} />
            </React.Fragment>
          );
        })}
        {/* Current Time Indicator */}
        <div
          className="w-[2px] bg-red-400 absolute top-0 z-20"
          style={{
            left: `${percentOfCurrentTime / 100 * (store.maxTime / 1000 * 10)}px`,
            height: `${store.editorElements.length * 68}px`,
          }}
        ></div>
      </div>
    </div>
  );
});
