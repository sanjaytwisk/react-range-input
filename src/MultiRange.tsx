import * as React from 'react'
import { Range } from './Range'
import { RangeFill } from './RangeFill'
import { getPosition } from './utils'

import './multi-range.css'
import { MockEvent } from './'
import { RangeTrack } from './RangeTrack'

export interface MultiRangeProps {
  name: string
  min: number
  max: number
  step: number
  value: { [key: string]: number }
  onChange?: (evt: MockEvent<number>) => void
}

export const MultiRange: React.FunctionComponent<MultiRangeProps> = ({
  name,
  value,
  min,
  max,
  step,
  onChange,
}) => {
  const nameMin = `${name}[min]`
  const nameMax = `${name}[max]`
  const minValue = value[nameMin] || min
  const maxValue = value[nameMax] || max

  const validateMin = (value: number) => value < maxValue
  const validateMax = (value: number) => value > minValue

  const fillStart = getPosition(minValue, max, min)
  const fillEnd = getPosition(maxValue, max, min)

  return (
    <fieldset className="multi-range">
      <RangeTrack />
      <RangeFill start={fillStart} end={fillEnd} />
      <Range
        value={minValue}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        onValidate={validateMin}
        name={nameMin}
        withTrack={false}
      >
        Maximum value
      </Range>
      <Range
        value={maxValue}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        onValidate={validateMax}
        name={nameMax}
        withTrack={false}
      >
        Maximum value
      </Range>
    </fieldset>
  )
}
