"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import {
  MdDownload,
  MdVideoLibrary,
  MdImage,
  MdTransform,
  MdTitle,
  MdAudiotrack,
  MdOutlineFormatColorFill,
  MdContentCut,
  MdMovieFilter,
  MdDelete,
} from "react-icons/md";
import { Store } from "@/store/Store";
import { untouchableEditorElements } from "@/utils/constants";

export const Menu = observer(() => {
  const store = React.useContext(StoreContext);
  const disableCutandDelete = (store.selectedElement?.name) ? untouchableEditorElements.includes(store.selectedElement?.name) : false;
  const cursorCutandDelete = disableCutandDelete ? "cursor-not-allowed" : "cursor-pointer";

  return (
    <ul className="p-2 text-slate-200 h-full font-semibold">
      {MENU_OPTIONS.map((option) => {
        const isSelected = store.selectedMenuOption === option.name;
        return (
          <li
            key={option.name}
            // className={`h-[72px] w-[72px] flex flex-col items-center justify-center ${isSelected ? "bg-slate-200" : ""}`}
            className={`flex flex-col items-center p-4 rounded hover:bg-slate-600 cursor-pointer ${isSelected ? "bg-slate-600" : ""} `}
          >
            <button
              onClick={() => option.action(store)}
              className={`flex flex-col items-center`}
            >
              <option.icon
                size="25"
                // color={
                //   isSelected ? "#000" : "#444"
                // }
                className="w-4 h-4 m-2"
              />
              <div
                // className={`text-[0.6rem] hover:text-black ${isSelected ? "text-black" : "text-slate-600"}`}
                className={`text-sm hover:text-white ${isSelected ? "text-white" : "text-slate-300"}`}
              >
                {option.name}
              </div>
            </button>
          </li>
        );
      })}

      <hr/>

      <li
        className={`flex flex-col items-center p-4 rounded hover:bg-slate-600 ${cursorCutandDelete}`}
        
        >
          <button
            onClick={() => {
              console.log("Cut")
              console.log("store.selectedElement: ", store.selectedElement)
              console.log("store.selectedElement?.id: ", store.selectedElement?.id)
              console.log("store.selectedElement?.name: ", store.selectedElement?.name)
              console.log("current time: ", store.currentTimeInMs)
              if(store.selectedElement){
                store.cutEditorElement(store.selectedElement, store.currentTimeInMs)
              }
            }}
            className={`flex flex-col items-center ${cursorCutandDelete}`}
            disabled={disableCutandDelete}
          >

            <MdContentCut size="25" className="w-4 h-4 m-2" />
            <div
              className={`text-sm hover:text-white text-slate-300`}
              >
                Cut
              </div>
          
          </button>
        </li>

        <li 
          className={`flex flex-col items-center p-4 rounded hover:bg-slate-600 ${cursorCutandDelete}`}
          >
          <button
            onClick={() => {
              console.log("Delete")
              if(store.selectedElement){
                store.removeEditorElement(store.selectedElement?.id)
              }
            }}
            className={`flex flex-col items-center ${cursorCutandDelete}`}
            disabled={disableCutandDelete}
          >
            <MdDelete size="25" className="w-4 h-4 m-2" />
            <div
              className={`text-sm hover:text-white text-slate-300`}
              >
                Delete
              </div>
          </button>
        </li>

    </ul>
  );
});

const MENU_OPTIONS = [
  {
    name: "Video",
    icon: MdVideoLibrary,
    action: (store: Store) => {
      store.setSelectedMenuOption("Video");
    },
  },
  {
    name: "Audio",
    icon: MdAudiotrack,
    action: (store: Store) => {
      store.setSelectedMenuOption("Audio");
    },
  },
  {
    name: "Image",
    icon: MdImage,
    action: (store: Store) => {
      store.setSelectedMenuOption("Image");
    },
  },
  {
    name: "Text",
    icon: MdTitle,
    action: (store: Store) => {
      store.setSelectedMenuOption("Text");
    },
  },
  {
    name: "Animation",
    icon: MdTransform,
    action: (store: Store) => {
      store.setSelectedMenuOption("Animation");
    },
  },
  {
    name: "Effect",
    icon: MdMovieFilter,
    action: (store: Store) => {
      store.setSelectedMenuOption("Effect");
    },
  },
  // {
  //   name: "Fill",
  //   icon: MdOutlineFormatColorFill,
  //   action: (store: Store) => {
  //     store.setSelectedMenuOption("Fill");
  //   },
  // },
  {
    name: "Export",
    icon: MdDownload,
    action: (store: Store) => {
      store.setSelectedMenuOption("Export");
    },
  },
];
