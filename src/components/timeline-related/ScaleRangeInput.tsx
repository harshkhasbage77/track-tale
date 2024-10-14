"use client";
import { useEffect, useRef, useState } from "react";

export const ScaleRangeInput: React.FC<ScaleRangeInputProps> = (props) => {
    const { max, value, onChange } = props;
    const ref = useRef<HTMLCanvasElement>(null);
    const refIsMouseDown = useRef(false);
    const [canvasSize, setCanvasSize] = useState({ width: 50, height: props.height });

    useEffect(() => {
        console.log("Canvas size updated:", canvasSize);
      }, [canvasSize]);

    useEffect(() => {
        console.log("this is max " + max);
        // update canvas size based on container size
        const handleResize = () => {
            if (ref.current) {
                // console.log("this is clientWidth " + ref.current.parentElement?.clientWidth);
                
                // DYNAMIC MAX TIME 
                // setCanvasSize({
                //     width: (ref.current.parentElement?.clientWidth ?? 50) - 8,
                //     height: ref.current.parentElement?.clientHeight ?? props.height
                // });

                // STANDARD DEFINED - 1 SECOND IS 10 PIXELS
                console.log("this is max " + max);
                setCanvasSize({
                    width: (max / 1000 * 10 ?? 50) - 8,
                    height: ref.current.parentElement?.clientHeight ?? props.height
                });
                console.log("this is max " + max);

                // console.log("this is canvasSize.width " + canvasSize.width);
                // setCanvasSize({width: `${canvasSize.width} - 50`, height: canvasSize.height});
                // console.log("this is canvasSize.width " + canvasSize.width);
            }
        };
        window.addEventListener("resize", handleResize);
        console.log("handle resize is called");
        handleResize();
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    
    useEffect(() => {
        if (ref.current) {
            const canvas = ref.current;
            canvas.width = canvasSize.width;
            console.log("this is canvas.width " + canvas.width);
            canvas.height = canvasSize.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.fillStyle = props.backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                props.markings.forEach((marking) => {
                    ctx.strokeStyle = marking.color;
                    ctx.lineWidth = marking.width;
                    ctx.beginPath();
                    // for (let i = 0; i < max; i += 1) {
                    for (let i = 0; i < max; i += marking.interval) {
                        ctx.moveTo(i / max * canvas.width, 0);
                        ctx.lineTo(i / max * canvas.width, marking.size);
                        // ctx.moveTo(i * marking.interval, 0);
                        // ctx.lineTo(i * marking.interval, marking.size);
                    }
                    ctx.stroke();
                });
            }
        }
    }, [props.markings, props.backgroundColor, max, canvasSize]);
    
    const updateFromMouseEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const value = x / canvasSize.width * max;
            const normalizedValue = Math.min(max, Math.max(0, value));
            onChange(normalizedValue);
        }
    };
    
    return <div
        className="relative w-full mx-1 overflow-x-auto"
        onMouseDown={(e) => {
            refIsMouseDown.current = true;
            updateFromMouseEvent(e);
        }}
        onMouseUp={(e) => {
            refIsMouseDown.current = false;
        }}
        onMouseMove={(e) => {
            if (refIsMouseDown.current) {
                updateFromMouseEvent(e);
            }
        }}
        onMouseLeave={(e) => {
            refIsMouseDown.current = false;
        }}
        style={{scrollbarWidth: "none"}}
    >
        <canvas
            height={props.height}
            ref={ref}
        >
        </canvas>
        <div
            className="rounded-full bg-black w-[4px] absolute top-0 left-0"
            style={{
                height: `${props.height}px`,
                transform: `translateX(${value / max * canvasSize.width}px) translateX(-2px)`
            }}
        >

        </div>

    </div>;
}; 

export type ScaleRangeInputProps = {
    max: number;
    value: number;
    markings: Marking[];
    onChange: (value: number) => void;
    height: number;
    backgroundColor: string;
};

export type Marking = {
    interval: number;
    color: string;
    size: number;
    width: number;
};

