import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M13.358 3.725c.222.221.242.569.061.813l-.06.07L7.966 10l5.391 5.391c.222.222.242.57.061.814l-.06.07a.625.625 0 01-.814.06l-.07-.06-5.834-5.833a.625.625 0 01-.06-.814l.06-.07 5.834-5.833a.625.625 0 01.883 0z"
        fill="#212121"
      />
    </Svg>
  )
}

export default SvgComponent
