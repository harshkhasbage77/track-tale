"use client";

import { fabric } from "fabric";
import React, { useEffect, useState } from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { Resources } from "./Resources";
import { ElementsPanel } from "./panels/ElementsPanel";
import { Menu } from "./Menu";
import { TimeLine } from "./TimeLine";
import { Store } from "@/store/Store";
import "@/utils/fabric-utils";
import Navbar from "./Navbar";


export const EditorWithStore = () => {
  const [store] = useState(new Store());
  return (
    <StoreContext.Provider value={store}>
      <Editor></Editor>
    </StoreContext.Provider>
  ); 
} 

export const Editor = observer(() => {
  const store = React.useContext(StoreContext);

  useEffect(() => {
    const canvas = new fabric.Canvas("canvas", {
      height: 450,
      width: 800,
      backgroundColor: "#ededed",
    });
    // fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.transparentCorners = true;
    fabric.Object.prototype.cornerColor = "#0050a0";
    fabric.Object.prototype.cornerStyle = "circle";
    // fabric.Object.prototype.cornerStrokeColor = "#FFC800"; // not if use bcoz transparentCorners is true
    fabric.Object.prototype.cornerSize = 10;
    fabric.Object.prototype.borderColor = "#000000";
    fabric.Object.prototype.borderDashArray = [10, 5];
    fabric.Object.prototype.borderScaleFactor = 1.5;
    // fabric.Object.prototype;
    // fabric.Object.prototype.cornerDashArray = [10, 0]; // no need
    fabric.Object.prototype.borderOpacityWhenMoving = 0.4;
    
    // canvas mouse down without target should deselect active object
    canvas.on("mouse:down", function (e) {
      if (!e.target) {
        store.setSelectedElement(null);
      }
    });

    store.setCanvas(canvas);
    fabric.util.requestAnimFrame(function render() {
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });

    // const Songdew_logo = new FileReader();
    // const Songdew_logo_address = "./Songdew_Online_logo_RGB_noBG.png";

    // store.addImageResource(URL.createObjectURL(Songdew_logo));

  }, []);

  // THERE WAS THIS ERROR POPPING BCOZ OF : 
  // Since you're working with Next.js, remember that it uses server-side rendering (SSR) by default, and some DOM elements like canvas may not be available during the initial server-side rendering phase. Use Next.js’s dynamic imports or a check to make sure you are in a browser environment.

  //  THE ERROR WAS:
  // 1 of 1 unhandled error
  // Next.js (13.4.9) is outdated (learn more)

  // Unhandled Runtime Error
  // TypeError: Cannot read properties of undefined (reading 'getRetinaScaling')

  // Source
  // src/components/Editor.tsx (56:13) @ renderAll

  //   54 | store.setCanvas(canvas);
  //   55 | fabric.util.requestAnimFrame(function render() {
  // > 56 |   canvas.renderAll();
  //      |         ^
  //   57 |   fabric.util.requestAnimFrame(render);
  //   58 | });
  //   59 | 

  // SO FOR RESOLVING THIS ISSUE : (BUT I THINK IT IS NOT WORKING, IT IS INCREASING PROBLEM)
  // You can use the following check to ensure your canvas is only rendered on the client-side: 
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const canvas = new fabric.Canvas('canvas'); 
  //     store.setCanvas(canvas);
  
  //     fabric.util.requestAnimFrame(function render() {
  //       if (canvas) {
  //         canvas.renderAll();
  //       }
  //       fabric.util.requestAnimFrame(render);
  //     });
  //   }
  // }, []);
  

  const handleCanvasContainerClick = (event: React.MouseEvent) => {
    console.log("canvas container clicked");
    if(event.target instanceof HTMLCanvasElement){
      return;
    }
    store.setSelectedElement(null);
  }

  // return (
  //   <>
  //   <div>
  //     {/* <h1 className="text-center text-2xl font-bold">Editor</h1> */}
  //     <Navbar />
  //   </div>
  //   <div className="grid grid-rows-[500px_1fr_20px] grid-cols-[92px_300px_1fr_250px] h-[100svh]">
  //     <div className="row-span-2 flex flex-col bg-slate-900">
  //       <Menu />
  //     </div>
  //     <div className="row-span-2 flex flex-col scroll-1-container">
  //       <Resources />
  //     </div>
  //     <div id="grid-canvas-container" className="col-start-3 bg-slate-100 flex justify-center items-center" onClick={handleCanvasContainerClick}>
  //       <canvas id="canvas" className="h-[450px] w-[800px] row" />
  //     </div>
  //     <div className="col-start-4 row-start-1">
  //       <ElementsPanel />
  //     </div>
  //     <div className="col-start-3 row-start-2 col-span-2 relative px-[10px] py-[4px]">
  //       <TimeLine />
  //     </div>
  //     <div className="col-span-4 text-right px-2 text-[0.5em] bg-black text-white">
  //       Crafted By Songdew Media Pvt. Ltd.
  //     </div>
  //   </div>
  //   </>
  // );


  return (
    <>
    <div className="grid grid-rows-[48px_1fr_440px] grid-cols-[92px_300px_1fr_250px] h-full">

      <div className="col-span-4 ">
        {/* <h1 className="text-center text-2xl font-bold">Editor</h1> */}
        <Navbar />
      </div>
      <div className="row-start-2 row-span-2 flex flex-col bg-slate-900">
        <Menu />
      </div>
      {/* <div className="row-start-2 col-start-2 row-span-2 flex flex-col scroll-1-container "> */}
      {/* bg-[#D9D9D9] */}
      <div className="row-start-2 col-start-2 row-span-2 flex flex-col 
      bg-white-800 
      ">
        <Resources />
      </div>
      <div id="grid-canvas-container" className="col-start-3 row-start-2 bg-slate-100 flex justify-center items-center" onClick={handleCanvasContainerClick}>
        <canvas id="canvas" className="h-[450px] w-[800px] row" />
      </div>
      <div className="col-start-4 row-start-2 overflow-auto custom-scrollbar">
        <ElementsPanel />
      </div> 
      <div className="col-start-3 row-start-3 col-span-2 relative bg-blue-200">
        <TimeLine /> 
      </div>
    </div>

      {/* <div className="col-span-4 text-right px-2 text-[0.5em] bg-black text-white">
        Crafted By Songdew Media Pvt. Ltd.
      </div> */}
    </>
  );

});
