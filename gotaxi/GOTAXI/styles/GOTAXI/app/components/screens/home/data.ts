import economyIcon from '../../../assets/images/options/economy-icon.png'
import comfortIcon from '../../../assets/images/options/comfort-icon.png'


interface IList {
	_id: string
	title: string
	img: string
	multiplier: number
}

export const optionsList: IList[] = [
	{
		_id: 'Ya-economy-439',
		title: 'Regular',
		img: economyIcon.src,
		multiplier: 0.75,
	},
	{
		_id: 'Ya-comfort-541',
		title: 'Comfort',
		img: comfortIcon.src,
		multiplier: 1,
	},
	
	
]
