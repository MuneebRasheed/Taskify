import * as React from "react"
import Svg, { Path } from "react-native-svg"

function CheckIcon({ fill = '#7C1C76', ...props }) {
  return (
    <Svg
      width={23}
      height={17}
      viewBox="0 0 23 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M22.37 2.242l-14 14a1.314 1.314 0 01-1.86 0L.385 10.117a1.315 1.315 0 011.86-1.86l5.196 5.197L20.512.385a1.315 1.315 0 111.86 1.86l-.003-.003z"
        fill={fill}
      />
    </Svg>
  )
}

export default CheckIcon
