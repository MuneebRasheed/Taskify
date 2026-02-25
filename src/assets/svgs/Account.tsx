import * as React from "react"
import Svg, { Path } from "react-native-svg"

function AccountIcon(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.889 12.618h.032A5.314 5.314 0 0017.23 7.31 5.315 5.315 0 0011.92 2a5.316 5.316 0 00-5.31 5.307 5.3 5.3 0 005.279 5.311zM8.038 7.31a3.887 3.887 0 013.883-3.882A3.886 3.886 0 0115.8 7.31a3.886 3.886 0 01-3.88 3.881h-.03A3.873 3.873 0 018.039 7.31zM4 18.173c0 3.697 5.962 3.697 7.92 3.697 3.4 0 7.92-.381 7.92-3.677 0-3.697-5.96-3.697-7.92-3.697-3.4 0-7.92.38-7.92 3.677zm1.5 0c0-1.445 2.16-2.177 6.42-2.177s6.42.739 6.42 2.197c0 1.445-2.16 2.177-6.42 2.177s-6.42-.74-6.42-2.197z"
        fill="#9E9E9E"
      />
    </Svg>
  )
}

export default AccountIcon
