import { Coords } from 'google-map-react'

export type TypeFrom = {
	location: Coords
	description: string
}

export type TypeInitialState = {
	from: TypeFrom
	to: TypeFrom
	travelTime: number
	selectedOption: string
	rideStatus: 'idle' | 'searching' | 'driver_assigned' | 'arriving' | 'arrived' | 'completed'
	driverLocation: { lat: number; lng: number } | null
	price: number
	currentRideId: string | null
	error: string | null
}
