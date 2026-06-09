export default function Loading() {
  return (
    <div className="fixed top-0 left-0 flex justify-center items-center h-screen w-screen bg-white z-[999]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#0D6EBB] border-t-transparent animate-spin" />
        <p className="text-[#0D6EBB] font-semibold tracking-widest text-sm uppercase">Blue Academy</p>
      </div>
    </div>
  );
}
