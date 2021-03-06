import React, { useLayoutEffect, useEffect, useRef, useCallback } from 'react'
import {
  valueToPosition,
  validateValue,
  Rect,
  getNextValue,
  isValidValue,
  MockEvent,
} from '@twisk/in-range'

import { RangeFill } from './RangeFill'
import { RangeTrack } from './RangeTrack'
import { useJS } from './useJS'

export interface RangeValueProps {
  name: string
  min: number
  max: number
  step: number
  value?: number
  defaultValue?: number
  onChange?: (evt: MockEvent<number>) => void
  onValidate?: (value: number) => boolean
  withFill?: boolean
  withTrack?: boolean
}

export const RangeValue: React.FunctionComponent<RangeValueProps> = ({
  name,
  min,
  max,
  step,
  value = min,
  defaultValue,
  onChange = () => null,
  onValidate,
  withFill = true,
  withTrack = true,
  children,
}) => {
  useJS()
  const rangeElement = useRef<HTMLDivElement>(null)
  const isMouseDown = useRef(false)
  const elementRect = useRef<Rect>({ left: 0, width: 0 })
  const getOptions = () => ({
    name,
    min,
    max,
    step,
    element: rangeElement.current,
    onValidate,
  })

  const onMouseDown = () => {
    isMouseDown.current = true
  }

  const onMouseUp = () => {
    isMouseDown.current = false
  }

  const updateValue = (clientX: number) => {
    const nextValue = getNextValue(clientX, elementRect.current, getOptions())
    if (isValidValue(nextValue, value, getOptions())) {
      onChange({ target: { name, value: nextValue } })
    }
  }

  const onMouseMove = useCallback(
    (evt: MouseEvent) => {
      if (isMouseDown.current) {
        updateValue(evt.clientX)
      }
    },
    [value]
  )

  const onClick = useCallback(
    (evt: React.MouseEvent<HTMLDivElement>) => {
      if (!isMouseDown.current) {
        updateValue(evt.clientX)
      }
    },
    [value]
  )

  const onTouchMove = (evt: React.TouchEvent<HTMLLabelElement>) => {
    if (isMouseDown.current) {
      const { clientX } = evt.targetTouches[0]
      updateValue(clientX)
    }
  }

  const onInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = parseFloat(evt.currentTarget.value)
    if (!validateValue(nextValue, getOptions()) || !onChange) return
    onChange({ target: { name, value: nextValue } })
  }

  useLayoutEffect(() => {
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [value])

  useEffect(() => {
    if (rangeElement.current) {
      const { left, width } = rangeElement.current.getBoundingClientRect()
      elementRect.current = { left, width }
    }
  }, [])

  return (
    <div
      className={`in-range-value${
        withTrack ? ' in-range-value--clickable' : ''
      }`}
      ref={rangeElement}
      onClick={withTrack ? onClick : undefined}
    >
      {withTrack && <RangeTrack />}
      {withFill && (
        <RangeFill
          start={valueToPosition(min, getOptions())}
          end={valueToPosition(value || defaultValue || min, getOptions())}
        />
      )}
      <input
        type="range"
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        className="in-range-value__input"
        onChange={onInputChange}
        id={name}
        name={name}
      />
      <label
        className="in-range-value__label"
        htmlFor={name}
        style={{
          ['--range-thumb-left' as any]: `${valueToPosition(
            value || min,
            getOptions()
          )}%`,
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        onTouchEnd={onMouseUp}
        onTouchMove={onTouchMove}
        draggable={false}
      >
        {children}
      </label>
    </div>
  )
}
