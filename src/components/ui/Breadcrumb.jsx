import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeMap = {
    '/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
    '/attack-configuration': { label: 'Attack Configuration', icon: 'Settings' },
    '/attack-monitoring': { label: 'Attack Monitoring', icon: 'Activity' },
    '/attack-results': { label: 'Attack Results', icon: 'BarChart3' }
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location?.pathname?.split('/')?.filter(segment => segment);
    const breadcrumbs = [];

    // Always start with Dashboard as home
    if (location?.pathname !== '/dashboard') {
      breadcrumbs?.push({
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        clickable: true
      });
    }

    // Add current page
    const currentRoute = routeMap?.[location?.pathname];
    if (currentRoute) {
      breadcrumbs?.push({
        label: currentRoute?.label,
        path: location?.pathname,
        icon: currentRoute?.icon,
        clickable: false
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on login page or if only one item (current page)
  if (location?.pathname === '/login' || breadcrumbs?.length <= 1) {
    return null;
  }

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs?.map((crumb, index) => (
          <li key={crumb?.path} className="flex items-center space-x-2">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={14} 
                className="text-muted-foreground" 
              />
            )}
            
            {crumb?.clickable ? (
              <button
                onClick={() => handleBreadcrumbClick(crumb?.path)}
                className="flex items-center space-x-1.5 text-muted-foreground hover:text-foreground transition-smooth"
              >
                <Icon name={crumb?.icon} size={14} />
                <span>{crumb?.label}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 text-foreground">
                <Icon name={crumb?.icon} size={14} />
                <span className="font-medium">{crumb?.label}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;