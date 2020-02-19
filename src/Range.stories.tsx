import * as React from 'react'
import { withA11y } from '@storybook/addon-a11y'
import { Range } from './Range'
import { MultiRange } from './MultiRange'

export default {
  title: 'Range',
  component: Range,
  decorators: [withA11y],
}

export const single = () => {
  const [value, setValue] = React.useState(5)
  const onChange = (evt: any) => {
    setValue(evt.target.value)
  }
  return (
    <Range
      name="single"
      step={1}
      min={5}
      max={15}
      value={value}
      onChange={onChange}
    >
      Select price
    </Range>
  )
}

export const multi = () => {
  const [value, setValue] = React.useState({})
  const onChange = (evt: any) => {
    setValue({ ...value, [evt.target.name]: evt.target.value })
  }
  return (
    <MultiRange
      name="multi"
      step={1}
      min={5}
      max={15}
      value={value}
      onChange={onChange}
    />
  )
}
