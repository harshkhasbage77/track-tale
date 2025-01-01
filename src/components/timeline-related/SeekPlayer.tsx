"use client";

import { StoreContext } from "@/store";
import { formatTimeToMinSecMili } from "@/utils";
import { observer } from "mobx-react-lite";
import { useContext } from "react";
// import { MdPlayArrow, MdPause } from "react-icons/md";
import { ScaleRangeInput } from "./ScaleRangeInput";
import { FaForward } from "react-icons/fa";
import { FaPause, FaPlay } from "react-icons/fa6";

const MARKINGS = [
  {
    interval: 5000,
    color: 'black',
    size: 16,
    width: 2
  },
  {
    interval: 1000,
    color: 'black',
    size: 8,
    width: 1
  }
];

export type SeekPlayerProps = {};


export const SeekPlayer = observer((_props: SeekPlayerProps) => {
  const store = useContext(StoreContext);
  const Icon = store.playing ? FaPause : FaPlay;
  const formattedTime = formatTimeToMinSecMili(store.currentTimeInMs);
  const formattedMaxTime = formatTimeToMinSecMili(store.maxTime);
  return (
    <div className="seek-player flex flex-col">
      <div className="flex flex-row justify-center items-center px-2">
        
        <button
          className="w-[80px] rounded px-2 py-2 flex justify-center items-center"
          onClick={() => {
            const isPlaying = store.playing;
            const currenttime = store.currentTimeInMs;
            // console.log("rewind button clicked, current time is ", currenttime);
            // store.setPlaying(!store.playing);
            if (currenttime - 500 < 0) {
              store.handleSeek(0);
            } else {
              store.handleSeek(currenttime - 500);
            }
            store.setPlaying(isPlaying);
          }}
        >
          <FaForward size="28" className="rotate-180"></FaForward>
          {/* <Icon size="40"></Icon> */}
        </button>

        <button
          className="w-[80px] rounded px-2 py-2 flex justify-center items-center"
          onClick={() => {
            store.setPlaying(!store.playing);
          }}
        >
          <Icon size="28"></Icon>
        </button>
        
        <button
          className="w-[80px] rounded px-2 py-2 flex justify-center items-center"
          onClick={() => {
            const isPlaying = store.playing;
            const currenttime = store.currentTimeInMs;
            // console.log("forward button clicked");
            // store.setPlaying(!store.playing);
            if (currenttime + 500 > store.maxTime) {
              store.handleSeek(store.maxTime);
            } else {
              store.handleSeek(currenttime + 500);
            }
            store.setPlaying(isPlaying);
          }}
        >
          <FaForward size="28"></FaForward>
          {/* <Icon size="40"></Icon> */}
        </button>
        

        <span className="font-mono">{formattedTime}</span>
        <div className="w-[1px] h-[25px] bg-slate-300 mx-[10px]"></div>
        <span className="font-mono">{formattedMaxTime}</span>
      </div>

      <ScaleRangeInput
        max={store.maxTime}
        value={store.currentTimeInMs}
        onChange={(value) => {
          store.handleSeek(value);
          // console.log("seeking to ", value);
        }}
        height={30}
        markings={MARKINGS}
        backgroundColor="white"
      />
      
    </div>
  );
});
