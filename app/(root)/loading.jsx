export default function Loading() {
	return (
		<div className="fixed top-0 left-0 flex flex-col justify-center items-center h-screen w-screen bg-white z-[999]">
			<div className="relative w-20 h-20">
				<div className="absolute inset-0 rounded-full border-4 border-[rgba(13,110,187,0.15)]" />
				<div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0D6EBB] animate-spin" />
				<div className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#0DBD9F] animate-spin [animation-direction:reverse] [animation-duration:1.2s]" />
			</div>
			<p className="mt-6 text-[#0D6EBB] font-bold text-xl tracking-[6px] uppercase animate-pulse">
				BLUE
			</p>
			<p className="text-gray-400 text-xs tracking-[3px] uppercase mt-1">
				Chargement...
			</p>
		</div>
	);
}
