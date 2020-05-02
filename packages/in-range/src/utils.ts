import { Value, Store } from './Store'
import { Fill } from './Fill'

export interface Bounds {
  min: number
  max: number
  step: number
}

interface Options extends Bounds {
  name: string
  onValidate?: Validator
}

export interface Rect {
  left: number
  width: number
}

export type Validator = (value?: number) => boolean

export const getRootElement = <T extends HTMLElement>(
  selector: string | HTMLElement
) => {
  if (typeof selector !== 'string') return selector
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Could not find root element for selector ${selector}`)
  }
  return element
}

export const getElement = <T extends HTMLElement>(
  root: HTMLElement,
  selector: string
) => {
  const element = root.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Could not find element ${selector}`)
  }
  return element
}

export const getElements = (selector: string | HTMLElement) => {
  const root = getRootElement(selector)
  const thumb = getElement<HTMLLabelElement>(root, '[data-range-thumb]')
  const input = getElement<HTMLInputElement>(root, '[data-range-input]')
  const fill = document.querySelector<HTMLElement>('[data-range-fill]')
  return { root, thumb, input, fill }
}

export const createFill = <T extends HTMLElement>(
  element: T | null,
  store: Store,
  bounds: Bounds
) => {
  if (!element) return () => null
  const fillInstance = new Fill(element, bounds)
  return store.subscribe(fillInstance.update)
}

export const validateValue = (
  nextValue: number,
  { min, max, onValidate = () => true }: Options
) => {
  const isValid = nextValue <= max && nextValue >= min
  return onValidate(nextValue) && isValid
}

export const isValidValue = (
  nextValue: number,
  currentValue: number,
  options: Options
) =>
  typeof nextValue === 'number' &&
  nextValue !== currentValue &&
  Math.round(nextValue % options.step) === 0 &&
  validateValue(nextValue, options)

export const getNextValue = (clientX: number, rect: Rect, bounds: Bounds) => {
  const { left, width } = rect
  const dragPosition = clientX - left
  const nextValue = positionToValue(dragPosition, width, bounds)
  return nextValue
}

export const positionToValue = (
  position: number,
  width: number,
  { min, max, step }: Bounds
): number => {
  if (position <= 0) return min
  const steps = (max - min) / step
  const stepSizePixel = width / steps
  const roundTo = step < 1 ? 10 : 1
  return Math.round((position / stepSizePixel) * step * roundTo) / roundTo + min
}

export const valueToPosition = (value: number, { max, min }: Bounds) => {
  return ((value - min) / (max - min)) * 100
}

export const isEqualValue = (value: Value, compare: Value) => {
  const valueKeys = Object.keys(value)
  const compareKeys = Object.keys(compare)
  const hasEqualKeys = valueKeys.every((key) => compareKeys.includes(key))
  const hasSameKeyLength = valueKeys.length === compareKeys.length
  const hasSameValues = Object.entries(value).every(
    ([name, val]) => val === compare[name]
  )
  return hasSameKeyLength && hasEqualKeys && hasSameValues
}

export const withJS = () => {
  if (!document.documentElement.hasAttribute('data-has-js')) {
    document.documentElement.setAttribute('data-has-js', '')
  }
}

export const detectInputDevice = () => {
  if (typeof window === 'undefined') return
  const handlers = {
    firstTab: (evt: KeyboardEvent) => {
      if (evt.keyCode === 9) {
        document.documentElement.setAttribute('data-input-keyboard', '')
        document.documentElement.removeAttribute('data-input-mouse')

        window.removeEventListener('keydown', handlers.firstTab)
        window.addEventListener('mousedown', handlers.mouseDown)
      }
    },
    mouseDown: () => {
      document.documentElement.setAttribute('data-input-mouse', '')
      document.documentElement.removeAttribute('data-input-keyboard')

      window.removeEventListener('mousedown', handlers.mouseDown)
      window.addEventListener('keydown', handlers.firstTab)
    },
  }

  window.addEventListener('keydown', handlers.firstTab)
}
