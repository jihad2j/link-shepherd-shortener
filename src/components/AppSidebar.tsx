
import { Users, Shield, AlertTriangle, Cookie, Home, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';

const adminMenuItems = [
  {
    title: "إدارة المستخدمين",
    url: "/admin?tab=users",
    icon: Users,
    value: "users"
  },
  {
    title: "إدارة التقارير", 
    url: "/admin?tab=reports",
    icon: AlertTriangle,
    value: "reports"
  },
  {
    title: "جلسات المستخدمين",
    url: "/admin?tab=sessions", 
    icon: Cookie,
    value: "sessions"
  },
];

const generalMenuItems = [
  {
    title: "الصفحة الرئيسية",
    url: "/",
    icon: Home,
  },
  {
    title: "لوحة التحكم",
    url: "/dashboard",
    icon: Settings,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  
  const currentTab = new URLSearchParams(location.search).get('tab') || 'users';

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="font-semibold text-lg">لوحة الإدارة</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>التنقل العام</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>إدارة النظام</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      isActive={currentTab === item.value}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="p-2 text-sm text-gray-600">
          مرحباً، {user?.email}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
