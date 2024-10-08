"use client";
import React from "react";
import { EditorElement } from "@/types";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import DragableView from "./DragableView";

export const TimeFrameView = observer((props: { element: EditorElement, duration: number }) => {
  const store = React.useContext(StoreContext);
  const { element, duration } = props;
  // const disabled = element.type === "audio";
  const disabled = false;
  // console.log("element: ", element);
  // console.log("element.type: ", element.type);
  // console.log("disabled: ", disabled);
  const isSelected = store.selectedElement?.id === element.id;
  const bgColorOnSelected = isSelected ? "bg-slate-800" : "bg-slate-600";
  const disabledCursor = disabled ? "cursor-no-drop" : "cursor-ew-resize";
  const timeFrameElementHeight = 60;

  return (
    <div
      onClick={() => {
        store.setSelectedElement(element);
      }}
      key={element.id}
      className={`relative width-full h-[60px] my-2 rounded-xl hover:shadow-md ${
        isSelected ? "border-2 border-indigo-600 bg-slate-200" : ""
      }`}
    >
      <DragableView
        className="z-10"
        value={element.timeFrame.start}
        total={store.maxTime}
        disabled={disabled}
        onChange={(value) => {
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
        className={`${disabled ? "cursor-no-drop" : "cursor-col-resize"}`}
        value={element.timeFrame.start}
        disabled={disabled}
        style={{
          width: `${(duration / store.maxTime) * 100}%`,
        }}
        total={store.maxTime}
        onChange={(value) => {
          const { start, end } = element.timeFrame;
          console.log("start: ", start);
          console.log("end: ", end);
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
        <div
          className={`${bgColorOnSelected} h-full w-full text-white text-xs min-w-[0px] px-2 leading-[25px] rounded-lg select-none border-l-8 border-r-8 border-double border-l-yellow-500 border-r-yellow-500`}
        >
          {element.name}
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
