export interface NavigationState {
  activeCanvasId: string
}

export function setActiveCanvas(state: NavigationState, canvasId: string): NavigationState {
  return { ...state, activeCanvasId: canvasId }
}
