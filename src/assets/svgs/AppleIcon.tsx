import * as React from "react"
import Svg, { Path } from "react-native-svg"

export type AppleIconProps = {
  width?: number
  height?: number
  color?: string
}

const applePathD =
  "M14.523.012c-.051-.057-1.889.023-3.488 1.758-1.599 1.734-1.353 3.723-1.317 3.774.036.051 2.28.13 3.713-1.887C14.863 1.64 14.574.071 14.523.012zm4.97 17.6c-.071-.144-3.487-1.851-3.169-5.133.318-3.284 2.513-4.184 2.547-4.281.035-.098-.895-1.185-1.88-1.736a5.538 5.538 0 00-2.345-.651c-.162-.004-.725-.142-1.881.174-.762.209-2.48.884-2.952.91-.474.028-1.884-.782-3.4-.997-.971-.187-2 .197-2.737.492-.735.294-2.133 1.131-3.11 3.356-.979 2.223-.467 5.745-.101 6.84.366 1.093.937 2.886 1.91 4.194.863 1.476 2.01 2.5 2.488 2.848.478.348 1.828.579 2.764.1.753-.462 2.112-.727 2.65-.708.535.02 1.59.232 2.672.809.857.296 1.667.172 2.478-.157.812-.332 1.986-1.589 3.357-4.137.52-1.186.758-1.826.71-1.924z"

function AppleIcon(props: AppleIconProps) {
  const { width = 20, height = 24, color = "#000" } = props
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 24"
      fill="none"
    >
      <Path d={applePathD} fill={color} />
      <Path d={applePathD} fill={color} />
    </Svg>
  )
}

export default AppleIcon
