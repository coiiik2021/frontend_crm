import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  // BoxCubeIcon,
  // CalenderIcon,
  // ChatIcon,
  ChevronDownIcon,
  // DocsIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  // MailIcon,
  // PageIcon,
  PieChartIcon,
  PlugInIcon,
  // TableIcon,
  // TaskIcon,
  UserCircleIcon,
} from "../../icons";
import { useSidebar } from "../../context/SidebarContext";
import { jwtDecode } from "jwt-decode";

type ExtendedJwtPayload = {
  authorities: string[];
};
// import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};



const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: true },
      { name: "Bar Chart", path: "/bar-chart", pro: true },
      { name: "Pie Chart", path: "/pie-chart", pro: true },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
      { name: "Reset Password", path: "/reset-password", pro: true },
      {
        name: "Two Step Verification",
        path: "/two-step-verification",
        pro: true,
      },
    ],
  },
];



const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [authorities, setAuthorities] = useState<string[]>([])

  const [navItems, setNavItems] = useState<NavItem[]>([])

  useEffect(
    () => {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode<ExtendedJwtPayload>(token);
        setAuthorities(decoded.authorities || []);
        if (decoded.authorities.includes('ADMIN')) {
          setNavItems(
            [{
              icon: <GridIcon />,
              name: "Dashboard",
              subItems: [
                { name: "Ecommerce", path: "/quan-ly", pro: false },
                { name: "Analytics", path: "/quan-ly/analytics", pro: true },
                { name: "Marketing", path: "/quan-ly/marketing", pro: true },
                { name: "CRM", path: "/quan-ly/crm", pro: true },
                { name: "Stocks", path: "/quan-ly/stocks", new: true, pro: true },
                { name: "SaaS", path: "/quan-ly/saas", new: true, pro: true },
              ],
            },
            {
              icon: <UserCircleIcon />,
              name: "User",
              subItems: [
                { name: "Manager", path: "/quan-ly/manager-table" },
              ],
            },

            {
              name: "Đơn hàng",
              icon: <ListIcon />,
              path: "/quan-ly/shipment",
            },

            {
              name: "Hoá đơn",
              icon: <ListIcon />,
              path: "/quan-ly/my-debits",
            },
            {
              name: "Price Net",
              icon: <ListIcon />,
              subItems: [
                { name: "Ups", path: "/quan-ly/ups-table", pro: true },
                { name: "DHL", path: "/quan-ly/dhl-table", pro: true },
                { name: "FEDEX", path: "/quan-ly/fedex-table", pro: true },
                { name: "SF", path: "/quan-ly/sf-table", pro: true },
                { name: "zone country", path: "/quan-ly/zone-country", pro: true },

              ],
            },

            ]
          )
        } else if (decoded.authorities.includes('MANAGER')) {
          setNavItems([
            {
              icon: <UserCircleIcon />,
              name: "User",
              subItems: [
                {
                  name: "User", path: "/quan-ly/user-table",
                },
                {
                  name: "Cs", path: "/quan-ly/cs-table",
                },
                {
                  name: "Accountant", path: "/quan-ly/accountant-table",
                },
                {
                  name: "Transporter", path: "/quan-ly/transporter-table",
                },
              ],
            },
            {
              name: "Đơn hàng",
              icon: <ListIcon />,
              path: "/quan-ly/shipment",
            },

            {
              name: "Hoá đơn của tôi",
              icon: <ListIcon />,
              path: "/quan-ly/my-debits",
            },
          ])
        } else {
          setNavItems(
            [
              {
                name: "Đơn hàng",
                icon: <ListIcon />,
                path: "/quan-ly/shipment",
              },

              {
                name: "Hoá đơn của tôi",
                icon: <ListIcon />,
                path: "/quan-ly/my-debits",
              },
            ]
          )
        }

      }
    }, []);

  // const navItems: NavItem[] = [

  //   {
  //     icon: <UserCircleIcon />,
  //     name: "User",
  //     subItems: [
  //       {
  //         name: "User", path: "/quan-ly/user-table",

  //       },
  //       { name: "Manager", path: "/quan-ly/manager-table" },
  //     ],
  //   },
  //   {
  //     name: "Đơn hàng",
  //     icon: <ListIcon />,
  //     path: "/quan-ly/shipment",
  //   },

  //   {
  //     name: "Hoá đơn của tôi",
  //     icon: <ListIcon />,
  //     path: "/quan-ly/my-debits",
  //   },
  //   {
  //     name: "Price Net",
  //     icon: <ListIcon />,
  //     subItems: [
  //       { name: "Ups", path: "/quan-ly/ups-table", pro: true },
  //       { name: "DHL", path: "/quan-ly/dhl-table", pro: true },
  //       { name: "FEDEX", path: "/quan-ly/fedex-table", pro: true },
  //       { name: "SF", path: "/quan-ly/sf-table", pro: true },
  //       { name: "zone country", path: "/quan-ly/zone-country", pro: true },

  //     ],
  //   },
  // ];

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "support" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "support", "others"].forEach((menuType) => {
      const items =
        menuType === "main"
          ? navItems : othersItems;
      // : menuType === "support";
      // ? supportItems
      // : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "support" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    menuType: "main" | "support" | "others"
  ) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    items: NavItem[],
    menuType: "main" | "support" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            ADMIN
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Support"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {/*{renderMenuItems(supportItems, "support")}*/}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {/*{isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}*/}
      </div>
    </aside>
  );
};

export default AppSidebar;
