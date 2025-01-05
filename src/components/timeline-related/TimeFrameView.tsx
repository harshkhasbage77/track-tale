"use client";
import React from "react";
import { EditorElement } from "@/types";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import DragableView from "./DragableView";

export const TimeFrameView = observer((props: { element: EditorElement, duration: number }) => {
  const store = React.useContext(StoreContext);
  const { element, duration } = props;

  var disabled = false;
  const disabled_something_related_to_audio = false;
  // console.log("element: ", element);
  // console.log("element.type: ", element.type);
  // console.log("disabled: ", disabled);
  const isSelected = store.selectedElement?.id === element.id;
  const bgColorOnSelected = isSelected ? "bg-slate-800" : "bg-slate-600";
  const timeFrameElementHeight = 60;
  
  // console.log("elemment.name: ", element.name);
  
  const isIntro = element.name === "Media(video) 1 video http://www.w3.org/1999/xhtml";
  const isOutro = element.name === "Media(video) 5 video http://www.w3.org/1999/xhtml";

  // console.log("isIntro: ", isIntro);
  // console.log("isOutro: ", isOutro);
  
  const disabled_movement_of_intro_outro = isIntro || isOutro;
  // console.error("disabled_movement_of_intro_outro: ", disabled_movement_of_intro_outro);
  
  if(disabled_movement_of_intro_outro) {
    disabled = true;
    // console.error("disabled_movement_of_intro_outro: ", disabled_movement_of_intro_outro);
  }



  const disabledCursor = disabled ? "cursor-no-drop" : "cursor-ew-resize";

  // For outro, keep its position synced to the end of the timeline
  React.useEffect(() => {
    if (isOutro) {
      const outroDuration = element.timeFrame.end - element.timeFrame.start;
      store.updateEditorElementTimeFrame(element, {
        start: store.maxTime - outroDuration,
        end: store.maxTime,
      });
    }
  }, [store.maxTime]);

  return (
    <div
      onClick={() => {
        store.setSelectedElement(element);
      }}
      key={element.id}
      //  bg-cyan-600 
      className={`relative width-full h-[60px] my-2  
        bg-[#2222227D]
         ${
        isSelected ? "border-2 border-indigo-600 bg-slate-400" : ""
      }`}
      style={{width: `${store.maxTime/1000*10}px`}}
    >
      <DragableView
        className="z-10"
        value={element.timeFrame.start}
        total={store.maxTime}
        disabled={disabled}
        onChange={(value) => {
          // if(isOutro) {
          //   console.log("Here value is: ", value);
          //   console.log("updating max time to: ", value + (element.timeFrame.end - element.timeFrame.start));
          //   store.setMaxTime(value + (element.timeFrame.end - element.timeFrame.start));
          //   // store.updateEditorElementTimeFrame(element, {
          //   //   start: store.maxTime - (element.timeFrame.end - element.timeFrame.start),
          //   // });
          // }
            console.log("I have changed using draggable view, value: ", value);
            store.updateEditorElementTimeFrame(element, {
              start: value,
            });
          
        }}
      >
        <div
          // className={`bg-white border-2 border-blue-400 w-[10px] h-[10px] mt-[${timeFrameElementHeight}px] translate-y-[-50%] transform translate-x-[-50%] ${disabledCursor}`}
          className={`border-r-0 border-blue-400 w-[10px] h-[60px] mt-[30px] translate-y-[-50%] transform translate-x-[-50%] ${disabledCursor} z-10 text-white`}
        >
          {/* <FaGripLinesVertical /> */}
        </div>
      </DragableView>

      <DragableView
        // className={`${disabled ? "cursor-no-drop" : "cursor-col-resize"}`}
        value={element.timeFrame.start}
        disabled={disabled}
        style={{
          width: `${(duration / store.maxTime) * 100}%`,
        }}
        total={store.maxTime}
        onChange={(value) => {
          const { start, end } = element.timeFrame;
          // console.log("start: ", start);
          // console.log("end: ", end);
          store.updateEditorElementTimeFrame(element, {
            start: value,
            end: value + (end - start),
          });
        }}
        // onExceedMaxTime={(value) => {
        //   // alert("Exceed max time " + value);
        //   store.maxTime = value; 
        //   store.updateEditorElementTimeFrame(element, {
        //     end: value,
        //   });
        // }}
      >
        {/* <div
          className={`${bgColorOnSelected} h-full w-full text-white text-xs min-w-[0px]  leading-[25px] rounded-lg select-none border-l-8 border-r-8 border-double border-l-yellow-500 border-r-yellow-500 ${disabledCursor}
           hover:border-solid hover:border-2 hover:border-yellow-500`}
        >
          <p className="truncate">
            <span className="z-10 p-2 bg-slate-300/30 font-bold">
              {element.name}
            </span>
          </p>
        </div> */}
        <div
          className={`h-full w-full text-white text-xs min-w-[0px] leading-[25px] rounded-lg select-none 
            border-double border-l-8 border-r-8 border-l-yellow-500 border-r-yellow-500 ${bgColorOnSelected} ${disabledCursor}
            hover:border-solid hover:border-2 hover:border-yellow-500`}
        >
          <p className="truncate">
            <span className="z-10 p-2 bg-slate-300/30 font-bold">
              {element.name}
            </span>
          </p>
        </div>
      </DragableView>
      
      <DragableView
        className="z-10"
        disabled={disabled}
        value={element.timeFrame.end}
        total={store.maxTime}
        onChange={(value) => {
          store.updateEditorElementTimeFrame(element, {
            end: value,
          });
        }}
      >
        <div
          // className={`bg-white border-2 border-blue-400 w-[10px] h-[10px] mt-[calc(25px/2)] translate-y-[-50%] transform translate-x-[-50%] ${disabledCursor}`}
          className={`border-0 border-blue-400 w-[10px] h-[60px] mt-[calc(60px/2)] translate-y-[-50%] transform translate-x-[-50%] ${disabledCursor}`}
        ></div>
      </DragableView>
    </div>
  );
});
