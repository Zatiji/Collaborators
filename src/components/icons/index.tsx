import Svg, { Circle, Line, Path } from "react-native-svg";

type IconProps = { size?: number; color: string };

export function BackArrowIcon({ size = 24, color }: IconProps) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Path
				d="M15 5L8 12L15 19"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

export function ShareIcon({ size = 24, color }: IconProps) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Circle cx={6} cy={12} r={2.5} stroke={color} strokeWidth={2} />
			<Circle cx={18} cy={6} r={2.5} stroke={color} strokeWidth={2} />
			<Circle cx={18} cy={18} r={2.5} stroke={color} strokeWidth={2} />
			<Line x1={8.2} y1={10.8} x2={15.8} y2={7.2} stroke={color} strokeWidth={2} />
			<Line x1={8.2} y1={13.2} x2={15.8} y2={16.8} stroke={color} strokeWidth={2} />
		</Svg>
	);
}

export function CheckboxIcon({
	size = 24,
	color,
	checked = false,
}: IconProps & { checked?: boolean }) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
			{checked ? (
				<Path
					d="M7.5 12.5L10.5 15.5L16.5 9"
					stroke={color}
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			) : null}
		</Svg>
	);
}

export function TrashIcon({ size = 24, color }: IconProps) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Path
				d="M4 7H20"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
			/>
			<Path
				d="M9 7V4.5C9 4.22 9.22 4 9.5 4H14.5C14.78 4 15 4.22 15 4.5V7"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M6.5 7L7.2 19.2C7.23 19.66 7.61 20 8.07 20H15.93C16.39 20 16.77 19.66 16.8 19.2L17.5 7"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

export function ProfileSilhouetteIcon({ size = 24, color }: IconProps) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} />
			<Path
				d="M4 20C4 15.58 7.58 13 12 13C16.42 13 20 15.58 20 20"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
			/>
		</Svg>
	);
}

export function HomeIcon({ size = 24, color }: IconProps) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Path
				d="M4 11L12 4L20 11"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M6 9.5V19C6 19.55 6.45 20 7 20H17C17.55 20 18 19.55 18 19V9.5"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

export function SharedIcon({ size = 24, color }: IconProps) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Circle cx={9} cy={9} r={3} stroke={color} strokeWidth={2} />
			<Circle cx={16} cy={13} r={3} stroke={color} strokeWidth={2} />
			<Path
				d="M4 19C4 16.24 6.24 14.5 9 14.5C10.1 14.5 11.11 14.79 11.93 15.29"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
			/>
			<Path
				d="M11 19C11 16.79 13.24 15.5 16 15.5C18.76 15.5 21 16.79 21 19"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
			/>
		</Svg>
	);
}

export function PlusIcon({ size = 24, color }: IconProps) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Line x1={12} y1={5} x2={12} y2={19} stroke={color} strokeWidth={2} strokeLinecap="round" />
			<Line x1={5} y1={12} x2={19} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
		</Svg>
	);
}
