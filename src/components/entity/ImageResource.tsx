"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { MdAdd, MdDelete } from "react-icons/md";

type ImageResourceProps = {
  image: string;
  index: number;
};

export const ImageResource = observer(
  ({ image, index }: ImageResourceProps) => {
    const store = React.useContext(StoreContext);
    const ref = React.useRef<HTMLImageElement>(null);
    const [resolution, setResolution] = React.useState({ w: 0, h: 0 });

    return (
      <div className="rounded-lg overflow-hidden items-center bg-slate-800 m-[15px] flex flex-col relative ">
        <div className="bg-[rgba(0,0,0,.25)] text-white py-1 absolute text-base top-2 right-2">
          {resolution.w} x {resolution.h}
        </div>
        <button
            className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded-full z-10 text-white font-bold p-1 absolute text-lg bottom-2 right-12"
            onClick={() => {
              console.log("delete audio");
              const deleteConfirmation = confirm("Are you sure you want to delete the image? This may affect your project.");
              if(deleteConfirmation){
                store.deleteImageResource(image);
              }
            }}
          >
          <MdDelete size="25" />
        </button> 
        <button
          className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded z-10 text-white font-bold py-1 absolute text-lg bottom-2 right-2"
          onClick={() => store.addImage(index)}
        >
          <MdAdd size="25" />
        </button>
        <img
          onLoad={() => {
            setResolution({
              w: ref.current?.naturalWidth ?? 0,
              h: ref.current?.naturalHeight ?? 0,
            });
          }}
          ref={ref}
          // className=""
          className="w-full max-h-[200px] transition-all object-cover hover:object-scale-down duration-300"
          src={image}
          // height={200}
          // width={200}
          id={`image-${index}`}
          alt="image"
        ></img>
      </div>
    );
  }
);
