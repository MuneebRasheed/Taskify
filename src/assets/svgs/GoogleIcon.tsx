import * as React from "react"
import Svg, { Path } from "react-native-svg"

const GOOGLE_BLUE = "#4285F4"
const GOOGLE_GREEN = "#34A853"
const GOOGLE_YELLOW = "#FBBC05"
const GOOGLE_RED = "#EB4335"

export type GoogleIconProps = {
  width?: number
  height?: number
  color?: string
}

function GoogleIcon(props: GoogleIconProps) {
  const { width = 24, height = 24, color } = props
  const useSingleColor = color != null
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M23 12.473c0-.922-.075-1.596-.237-2.294H12.225v4.165h6.185c-.124 1.035-.798 2.594-2.294 3.642l-.021.14 3.332 2.58.23.024C21.778 18.772 23 15.89 23 12.473z"
        fill={useSingleColor ? color : GOOGLE_BLUE}
      />
      <Path
        d="M12.225 23.449c3.03 0 5.574-.998 7.433-2.719l-3.542-2.744c-.948.661-2.22 1.123-3.891 1.123-2.969 0-5.488-1.958-6.386-4.665l-.132.011-3.464 2.682-.046.126c1.846 3.666 5.637 6.186 10.028 6.186z"
        fill={useSingleColor ? color : GOOGLE_GREEN}
      />
      <Path
        d="M5.839 14.444a6.91 6.91 0 01-.374-2.22c0-.773.137-1.521.361-2.22l-.006-.149-3.508-2.724-.115.054A11.235 11.235 0 001 12.225c0 1.807.437 3.516 1.197 5.038l3.642-2.819z"
        fill={useSingleColor ? color : GOOGLE_YELLOW}
      />
      <Path
        d="M12.225 5.34c2.107 0 3.529.91 4.34 1.671l3.167-3.093C17.787 2.11 15.255 1 12.225 1 7.835 1 4.043 3.52 2.197 7.186l3.63 2.819c.91-2.707 3.43-4.665 6.398-4.665z"
        fill={useSingleColor ? color : GOOGLE_RED}
      />
    </Svg>
  )
}

export default GoogleIcon
