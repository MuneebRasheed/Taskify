import * as React from "react"
import Svg, { Path } from "react-native-svg"

function CrossIcon(props) {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M22.495 21.256a.876.876 0 01-1.239 1.238l-7.255-7.257-7.256 7.257a.876.876 0 01-1.239-1.238L12.764 14 5.506 6.744a.875.875 0 011.239-1.238L14 12.763l7.255-7.257a.876.876 0 011.239 1.238L15.237 14l7.258 7.256z"
        fill="#212121"
      />
    </Svg>
  )
}

export default CrossIcon
