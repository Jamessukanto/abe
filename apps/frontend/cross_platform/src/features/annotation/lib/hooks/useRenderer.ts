import { useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/clientHooks'
import { selectShapesArray, selectGroupsArray, selectCanvas, selectPreview } from '../../../../store/selectors'
import { setCanvas } from '../../../../store/annotationSlice'
import { AnnotationRenderer } from '../../canvas'

export function useRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  svgRef: React.RefObject<SVGSVGElement>
) {
  const dispatch = useAppDispatch()
  const rendererRef = useRef<AnnotationRenderer>()
  
  // Redux state
  const shapes = useAppSelector(selectShapesArray)
  const groups = useAppSelector(selectGroupsArray)
  const canvas = useAppSelector(selectCanvas)
  const preview = useAppSelector(selectPreview)

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current && svgRef.current && !rendererRef.current) {
      // Initialize renderer
      rendererRef.current = new AnnotationRenderer(canvasRef.current, svgRef.current)
      
      // Load sample image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const initialPan = { x: 0, y: 0 }
        const initialZoom = 1
        dispatch(setCanvas({
          updates: {
            imageUrl: '/images/chimps.png',
            imageSize: { width: img.naturalWidth, height: img.naturalHeight },
            zoom: initialZoom,
            pan: initialPan
          }
        }))
        rendererRef.current?.loadImage('/images/chimps.png')
      }
      img.onerror = () => {
        // Fallback if image fails to load
        const initialPan = { x: 0, y: 0 }
        const initialZoom = 1
        dispatch(setCanvas({
          updates: {
            imageSize: { width: 800, height: 600 },
            zoom: initialZoom,
            pan: initialPan
          }
        }))
      }
      img.src = '/images/chimps.png'
    }
  }, [dispatch])

  // Render shapes when they change
  useEffect(() => {
    if (rendererRef.current) {
      const previewShape = preview.isActive ? preview.shape : undefined
      rendererRef.current.render(shapes, groups, canvas, previewShape)
    }
  }, [shapes, groups, canvas, preview])

  return rendererRef.current
} 