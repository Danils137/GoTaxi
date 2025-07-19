import { store } from '../store/store'
import { Coords } from 'google-map-react'

type Coordinate = {
  lat: number
  lng: number
}

type RouteSegment = {
  start: Coordinate
  end: Coordinate
  duration: number
}

const DRIVER_UPDATE_INTERVAL = 2000 // 2 seconds

export const calculateRoute = (from: Coords, to: Coords): RouteSegment[] => {
  const totalDistance = Math.sqrt(
    Math.pow(to.lat - from.lat, 2) + Math.pow(to.lng - from.lng, 2))
  const segmentCount = Math.ceil(totalDistance * 1000 / 500) // 500m segments
  const segmentDuration = 60000 // 1 minute per segment

  return Array.from({ length: segmentCount }).map((_, i) => ({
    start: {
      lat: from.lat + (to.lat - from.lat) * (i / segmentCount),
      lng: from.lng + (to.lng - from.lng) * (i / segmentCount)
    },
    end: {
      lat: from.lat + (to.lat - from.lat) * ((i + 1) / segmentCount),
      lng: from.lng + (to.lng - from.lng) * ((i + 1) / segmentCount)
    },
    duration: segmentDuration
  }))
}

export const simulateDriverMovement = async (route: RouteSegment[]) => {
  try {
    store.dispatch({ type: 'taxi/setRideStatus', payload: 'driver_assigned' })
    
    for (const segment of route) {
      const { start, end, duration } = segment
      const steps = duration / DRIVER_UPDATE_INTERVAL
      const latStep = (end.lat - start.lat) / steps
      const lngStep = (end.lng - start.lng) / steps

      for (let i = 0; i < steps; i++) {
        await new Promise(resolve => setTimeout(resolve, DRIVER_UPDATE_INTERVAL))
        const currentPosition = {
          lat: start.lat + latStep * i,
          lng: start.lng + lngStep * i
        }
        store.dispatch({ 
          type: 'taxi/setDriverLocation', 
          payload: currentPosition 
        })
      }
    }

    store.dispatch({ type: 'taxi/setRideStatus', payload: 'arrived' })
  } catch (error) {
    console.error('Driver simulation error:', error)
    store.dispatch({ type: 'taxi/setRideStatus', payload: 'searching' })
  }
}
