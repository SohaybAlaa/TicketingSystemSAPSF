import React from 'react'

// Array of widths for skeleton bars, used to create a varied and dynamic skeleton layout
const SKELETON_WIDTHS = [72, 58, 85, 63, 77]

// Default array of 25 skeleton rows, used as a fallback when no custom rows are provided
export const SKELETON_ROWS = Array.from({ length: 25 }, (_, i) => ({ _skeleton: true, _id: i }))

// Helper function to generate an array of skeleton rows with a specified count
export const makeSkeletonRows = (count) => Array.from({ length: count }, (_, i) => ({ _skeleton: true, _id: i }))

/**
 * SkeletonBar component: A dynamic skeleton loading bar that creates a varied and dynamic loading effect.
 * 
 * Purpose: To display a loading animation while data is being fetched or loaded.
 * 
 * Props:
 * - rowIndex (number): The index of the row in the skeleton layout. Used to cycle through the array of skeleton widths.
 * 
 * How it works:
 * - The component uses the rowIndex prop to select a width from the SKELETON_WIDTHS array.
 * - The width is then used to style a div element, creating a loading bar effect.
 * - The animate-pulse class is used to add a pulsing animation to the loading bar.
 */
export function SkeletonBar({ rowIndex = 0 }) {
  const w = SKELETON_WIDTHS[rowIndex % SKELETON_WIDTHS.length]
  return (
    <div className="flex items-center justify-center h-full w-full absolute inset-0">
      <div className="h-3 rounded-full bg-gray-200 animate-pulse" style={{ width: `${w}%` }} />
    </div>
  )
}

/**
 * withSkeleton Higher-Order Component (HOC): A utility function that wraps a component with a skeleton loading effect.
 * 
 * Purpose: To provide a simple way to add a skeleton loading effect to any component, improving the user experience while data is being fetched or loaded.
 * 
 * Parameters:
 * - Renderer (React.Component): The component to be wrapped with the skeleton loading effect.
 * - centered (boolean): Optional parameter to center the skeleton loading effect horizontally. Defaults to false.
 * 
 * How it works:
 * - The HOC checks if the props.data object has a _skeleton property. If true, it renders the SkeletonBar component.
 * - If props.data._skeleton is false, it renders the original Renderer component with the provided props.
 * 
 * Usage:
 * - Wrap your component with the withSkeleton HOC, passing the component as the first argument and optionally the centered parameter as the second argument.
 * - Example: const MyComponentWithSkeleton = withSkeleton(MyComponent, true);
 */
export function withSkeleton(Renderer, centered = false) {
  return function SkeletonWrapper(props) {
    if (props.data?._skeleton) return <SkeletonBar rowIndex={props.node?.rowIndex ?? 0} centered={centered} />
    return <Renderer {...props} />
  }
}
