import * as React from "react"
import Svg, { Path } from "react-native-svg"

function CheckIcon(props) {
  return (
    <Svg
      width={12}
      height={9}
      viewBox="0 0 12 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.56.44a1.5 1.5 0 010 2.12l-6 6a1.5 1.5 0 01-2.12 0l-3-3a1.5 1.5 0 112.12-2.12L4.5 5.378 9.44.439a1.5 1.5 0 012.12 0z"
        fill="#fff"
      />
    </Svg>
  )
}

export default CheckIcon
