const Sidebar = () => {
  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col 
        justify-between items-center max-sm:absolute top-0 bottom-0 z-20 
        ${sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"} 
        transition-all duration-300 ease-in-out`}
    ></div>
  );
};

export default Sidebar;
