import React, { MouseEventHandler, useEffect, useRef } from "react";
import { consumers } from "stream";

function DragableView(props: {
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  value: number;
  total: number;
  onChange: (value: number) => void;
  // onExceedMaxTime?: (value: number) => void;
}) 
{
  const ref = useRef<{
    div: HTMLDivElement | null;
    isDragging: boolean;
    initialMouseX: number;
  }>({
    div: null,
    isDragging: false,
    initialMouseX: 0,
  });

  const { current: data } = ref;
  function calculateNewValue(mouseX: number): number {
    if (!data.div) return 0;
    const deltaX = mouseX - data.initialMouseX;
    const deltaValue =
      (deltaX / data.div.parentElement!.clientWidth) * props.total;
    let newValue = props.value + deltaValue;
    if (newValue < 0) newValue = 0;
    return newValue;
  }

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!data.div) return;
    if (props.disabled) {
      console.log("dragging is disabled");
      return;
    }
    data.isDragging = true;
    data.initialMouseX = event.clientX;
  };

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!data.div) return;
    if (!data.isDragging) return;
    data.div.style.left = `${
      (calculateNewValue(event.clientX) / props.total) * 100
    }%`;
    event.stopPropagation();
    event.preventDefault();
  };

  const handleMouseUp: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!data.div) return;
    if (!data.isDragging) return;
    data.isDragging = false;
    props.onChange(calculateNewValue(event.clientX));

    // const newValue = calculateNewValue(event.clientX);
    // if (newValue > props.total) {
    //   props.onExceedMaxTime?.(newValue);
    // } else {
    //   props.onChange(newValue);
    // }

    // console.log("handleMouseUp k baad ka maxTime: ", props.total);

    event.stopPropagation();
    event.preventDefault();
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp as any);
    window.addEventListener("mousemove", handleMouseMove as any);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp as any);
      window.removeEventListener("mousemove", handleMouseMove as any);
    };
  }, [handleMouseUp, handleMouseMove]);

  return (
    <div
      ref={(r) => {
        data.div = r;
      }}
      className={`absolute height-100 ${props.className}`}
      style={{
        left: (props.value / props.total) * 100 + "%",
        top: 0,
        bottom: 0,
        ...props.style,
      }}
      onMouseDown={handleMouseDown}
    >
      {props.children}
    </div>
  );
}

export default DragableView;
