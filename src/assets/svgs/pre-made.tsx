import * as React from "react"
import Svg, { Mask, Path, G } from "react-native-svg"

function PreMadeIcon(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Mask
        id="a"
        style={{
          maskType: "luminance"
        }}
        maskUnits="userSpaceOnUse"
        x={3}
        y={2}
        width={18}
        height={20}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 2.012h17.053v19.853H3V2.012z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#a)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.573 3.512a3.087 3.087 0 00-3.072 2.997v10.695a3.087 3.087 0 003.01 3.162h8.063c1.67-.07 2.991-1.456 2.98-3.156V8.34l-4.636-4.828H7.573zm.012 18.354h-.109a4.585 4.585 0 01-4.475-4.678V6.49c.058-2.481 2.107-4.48 4.57-4.48H14.238c.204 0 .4.084.541.23l5.065 5.278a.75.75 0 01.21.519v9.166a4.617 4.617 0 01-4.45 4.66l-8.019.002z"
          fill="#212121"
        />
      </G>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.789 16.108h-5.4a.75.75 0 010-1.5h5.4a.75.75 0 010 1.5zM11.744 12.356H8.388a.75.75 0 010-1.5h3.356a.75.75 0 010 1.5zM19.299 8.984h-2.755a3.332 3.332 0 01-3.319-3.325V2.75a.75.75 0 011.5 0v2.91c0 1.003.818 1.821 1.82 1.824h2.753a.75.75 0 010 1.5z"
        fill="#212121"
      />
    </Svg>
  )
}

export default PreMadeIcon
