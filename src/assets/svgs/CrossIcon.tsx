import * as React from "react"
import Svg, { Path } from "react-native-svg"

function CrossIcon(props) {
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
        d="M16.067 15.183a.624.624 0 11-.884.884L10 10.883l-5.182 5.184a.625.625 0 11-.885-.884L9.117 10 3.933 4.817a.625.625 0 01.885-.884L10 9.116l5.183-5.183a.625.625 0 11.884.884L10.884 10l5.183 5.183z"
        fill="#212121"
      />
    </Svg>
  )
}

export default CrossIcon
