const Button = ({ children, variation, ...props }) => (
	<button
		{...props}
		className={`title mr-3  rounded-2xl px-8 py-2 shadow-md transition duration-300 ease-in-out ${
			variation === "primary"
				? "bg-[#0D6EBB] hover:bg-[#0DBD9F] border-transparent hover:border-[#0DBD9F] border-2 text-white hover:text-white box-border"
				 : "transparent border-2 border-[#0D6EBB] text-[#0D6EBB] hover:bg-[#0D6EBB] hover:text-white box-border"
		}`}>
		{children}
	</button>
);

export default Button;