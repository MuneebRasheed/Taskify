import * as React from "react"
import Svg, { Path } from "react-native-svg"

function BottomArrowIcon(props) {
  return (
    <Svg
      width={16}
      height={9}
      viewBox="0 0 16 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M.22.22a.75.75 0 01.976-.073L1.28.22l6.47 6.469 6.47-6.47a.75.75 0 01.976-.072l.084.073a.75.75 0 01.073.976l-.073.084-7 7a.75.75 0 01-.976.073L7.22 8.28l-7-7a.75.75 0 010-1.06z"
        fill="#212121"
      />
    </Svg>
  )
}

export default BottomArrowIcon
