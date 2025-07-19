export const Sidebar = ({ companySlug }) => {
  const navItems = [
    { icon: <BarChart3 size={20} />, label: 'Dashboard', active: true },
    { icon: <Briefcase size={20} />, label: 'Jobs' },
    { icon: <Calendar size={20} />, label: 'Calendar' },
    { icon: <Users size={20} />, label: 'Team' },
  ];
  const generalItems = [
    { icon: <Settings size={20} />, label: 'Settings' },
    { icon: <HelpCircle size={20} />, label: 'Help' },
    { icon: <LogOut size={20} />, label: 'Logout' },
  ];

  return (
    <aside className={sidebarStyles.sidebar}>
      <div>
        <div className={sidebarStyles.logo}>
          <Briefcase className="text-green-500" />
          <span>{companySlug}</span>
        </div>
        <nav>
          <h3 className={sidebarStyles.menuTitle}>MENU</h3>
          <ul>
            {navItems.map(item => (
              <li key={item.label}>
                <a href="#" className={`${sidebarStyles.navLink} ${item.active ? sidebarStyles.active : ''}`}>
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <nav>
        <h3 className={sidebarStyles.menuTitle}>GENERAL</h3>
        <ul>
          {generalItems.map(item => (
            <li key={item.label}>
              <a href="#" className={sidebarStyles.navLink}>
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

const sidebarStyles = {
    sidebar: "w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-4",
    logo: "flex items-center gap-2 text-2xl font-bold text-gray-800 mb-8 capitalize",
    menuTitle: "text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3",
    navLink: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors",
    active: "bg-green-50 text-green-600 font-bold",
};