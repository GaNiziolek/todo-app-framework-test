import { Button as tamaguiButton, styled } from 'tamagui'

export const Button = styled(tamaguiButton, {
  name: "MyButton",
  variants: {
    isPressed: {
      true: {
        backgroundColor: "$backgroundPress"
      }
    }
  } as const
})
