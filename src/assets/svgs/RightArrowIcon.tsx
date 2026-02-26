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
        d="M6.641 16.275a.625.625 0 01-.06-.813l.06-.07L12.032 10 6.642 4.61a.625.625 0 01-.061-.814l.06-.07a.625.625 0 01.814-.06l.07.06 5.833 5.833c.222.222.242.57.06.814l-.06.07-5.833 5.833a.625.625 0 01-.884 0z"
        fill="#212121"
      />
    </Svg>
  )
}

export default SvgComponent
