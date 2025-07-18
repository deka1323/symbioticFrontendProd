import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pi as Pig, Users, Heart, Baby, Sprout, TrendingUp, FileText, Home, LogOut, User, Menu, X, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: '/', label: 'Dashboard', icon: Home },
    { id: '/sales', label: 'Sales', icon: ShoppingCart },
    { id: '/breeding', label: 'Breeding', icon: Heart },
    { id: '/gestation', label: 'Gestation', icon: Users },
    { id: '/farrowing', label: 'Farrowing', icon: Baby },
    { id: '/nursery', label: 'Nursery', icon: Sprout },
    { id: '/fattening', label: 'Fattening', icon: TrendingUp },
    { id: '/reports', label: 'Reports', icon: FileText },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Pig className="h-8 w-8 text-emerald-600" />
              <span className="ml-2 text-base sm:text-lg font-bold text-gray-900 hidden xs:block">FarmTracker Pro</span>
              <span className="ml-2 text-sm font-bold text-gray-900 xs:hidden">FTP</span>
            </div>
          </div>

          <div className="hidden xl:flex items-center space-x-1">
            {/* Navigation Items */}
            <div className="flex space-x-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`inline-flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${isActive
                        ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-200">
              <div className="hidden 2xl:flex items-center space-x-1">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-700 max-w-20 truncate">
                    {user?.signInDetails?.loginId || 'User'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-2 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
              >
                <LogOut className="h-3 w-3 mr-1" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Button */}
          <div className="xl:hidden flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 max-w-20 truncate">
                {user?.signInDetails?.loginId?.split('@')[0] || 'User'}
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${isActive
                        ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;