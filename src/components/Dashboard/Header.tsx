import { Search, Bell } from 'lucide-react';

export const Header = ({ companyName }) => {
  return (
    <header className={headerStyles.header}>
      <div className={headerStyles.searchBar}>
        <Search className={headerStyles.searchIcon} size={20} />
        <input type="text" placeholder="Search tasks..." />
      </div>
      <div className={headerStyles.profileArea}>
        <button className={headerStyles.iconButton}>
          <Bell size={20} />
        </button>
        <div className={headerStyles.profile}>
          <img src="https://i.pravatar.cc/150?img=10" alt="User" />
          <div className={headerStyles.profileInfo}>
            <span className={headerStyles.profileName}>Anaïs Dubois</span>
            <span className={headerStyles.profileCompany}>{companyName} HR</span>
          </div>
           <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
};

const headerStyles = {
    header: "bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10",
    searchBar: "flex items-center bg-gray-100 rounded-lg px-3 py-2 w-1/3",
    searchIcon: "text-gray-400 mr-2",
    profileArea: "flex items-center gap-4",
    iconButton: "text-gray-500 hover:text-gray-700",
    profile: "flex items-center gap-3 cursor-pointer",
    profileInfo: "text-right",
    profileName: "font-semibold text-sm text-gray-800 block",
    profileCompany: "text-xs text-gray-500 block",
};