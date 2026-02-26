import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props) {
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
        d="M8 2.333A5.673 5.673 0 002.333 8 5.673 5.673 0 008 13.667 5.673 5.673 0 0013.667 8 5.673 5.673 0 008 2.333zm0 12.334A6.674 6.674 0 011.333 8 6.674 6.674 0 018 1.333 6.674 6.674 0 0114.667 8 6.674 6.674 0 018 14.667z"
        fill="#616161"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.287 10.462a.504.504 0 01-.256-.07l-2.513-1.5a.503.503 0 01-.244-.43V5.23a.5.5 0 011 0v2.948l2.27 1.354a.501.501 0 01-.257.93z"
        fill="#616161"
      />
    </Svg>
  )
}

export default SvgComponent
