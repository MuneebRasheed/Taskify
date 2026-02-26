import * as React from "react"
import Svg, { Path, Mask, G } from "react-native-svg"

function CalendarIcon(props) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.8 11.797a.502.502 0 01-.502-.5c0-.276.22-.5.497-.5h.006a.5.5 0 010 1zM7.842 11.797a.502.502 0 01-.502-.5c0-.276.22-.5.496-.5h.006a.5.5 0 010 1zM4.878 11.797a.503.503 0 01-.503-.5c0-.276.22-.5.497-.5h.006a.5.5 0 010 1zM10.8 9.206a.502.502 0 01-.502-.5c0-.276.22-.5.497-.5h.006a.5.5 0 010 1zM7.842 9.206a.502.502 0 01-.502-.5c0-.276.22-.5.496-.5h.006a.5.5 0 010 1zM4.878 9.206a.503.503 0 01-.503-.5c0-.276.22-.5.497-.5h.006a.5.5 0 010 1zM13.778 6.603H1.895a.5.5 0 010-1h11.883a.5.5 0 010 1zM10.529 3.86a.5.5 0 01-.5-.5V1.167a.5.5 0 011 0V3.36a.5.5 0 01-.5.5zM5.144 3.86a.5.5 0 01-.5-.5V1.167a.5.5 0 011 0V3.36a.5.5 0 01-.5.5z"
        fill="#616161"
      />
      <Mask
        id="a"
        style={{
          maskType: "luminance"
        }}
        maskUnits="userSpaceOnUse"
        x={1}
        y={1}
        width={14}
        height={14}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.333 1.72h13V15h-13V1.72z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#a)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.014 2.72c-1.729 0-2.68.921-2.68 2.595v6.033c0 1.71.951 2.652 2.68 2.652h5.639c1.728 0 2.68-.924 2.68-2.601V5.315c.003-.823-.218-1.463-.658-1.903-.452-.453-1.148-.693-2.016-.693H5.014zM10.653 15h-5.64c-2.27 0-3.68-1.4-3.68-3.652V5.315c0-2.218 1.41-3.596 3.68-3.596h5.646c1.139 0 2.08.342 2.724.986.625.628.954 1.53.95 2.612v6.082c0 2.22-1.41 3.6-3.68 3.6z"
          fill="#616161"
        />
      </G>
    </Svg>
  )
}

export default CalendarIcon
