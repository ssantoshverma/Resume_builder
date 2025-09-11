import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon,
  CreditCardIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import AppLayout from '../layouts/AppLayout';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true
  });

  const [darkMode, setDarkMode] = useState(false);

  const settingSections = [
    {
      title: 'Account',
      icon: UserIcon,
      items: [
        { label: 'Profile Information', description: 'Update your personal details' },
        { label: 'Email & Password', description: 'Manage your login credentials' },
        { label: 'Privacy Settings', description: 'Control your data visibility' }
      ]
    },
    {
      title: 'Notifications',
      icon: BellIcon,
      items: [
        { label: 'Email Notifications', description: 'Resume tips and updates', toggle: true, value: notifications.email },
        { label: 'Push Notifications', description: 'Browser notifications', toggle: true, value: notifications.push },
        { label: 'Marketing Emails', description: 'Product updates and offers', toggle: true, value: notifications.marketing }
      ]
    },
    {
      title: 'Security',
      icon: ShieldCheckIcon,
      items: [
        { label: 'Two-Factor Authentication', description: 'Add an extra layer of security' },
        { label: 'Login History', description: 'View your recent login activity' },
        { label: 'Connected Apps', description: 'Manage third-party integrations' }
      ]
    },
    {
      title: 'Billing & Plans',
      icon: CreditCardIcon,
      items: [
        { label: 'Current Plan', description: 'Free Plan - Upgrade for more features' },
        { label: 'Payment Methods', description: 'Manage your payment information' },
        { label: 'Billing History', description: 'View your past invoices' }
      ]
    },
    {
      title: 'Preferences',
      icon: GlobeAltIcon,
      items: [
        { label: 'Language', description: 'Choose your preferred language' },
        { label: 'Time Zone', description: 'Set your local time zone' },
        { label: 'Dark Mode', description: 'Toggle dark theme', toggle: true, value: darkMode }
      ]
    }
  ];

  const handleToggle = (section: string, item: string) => {
    if (section === 'Notifications') {
      setNotifications(prev => ({
        ...prev,
        [item.toLowerCase().replace(' notifications', '').replace(' emails', '')]: !prev[item.toLowerCase().replace(' notifications', '').replace(' emails', '') as keyof typeof prev]
      }));
    } else if (item === 'Dark Mode') {
      setDarkMode(!darkMode);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </motion.div>

        <div className="space-y-6">
          {settingSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 + 0.2 }}
              className="glass-panel"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-foreground">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    
                    {item.toggle ? (
                      <button
                        onClick={() => handleToggle(section.title, item.label)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.value ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : (
                      <button className="btn-glass text-sm">
                        Configure
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-panel border-destructive"
        >
          <h2 className="text-xl font-semibold text-destructive mb-6">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive bg-destructive-light">
              <div>
                <h3 className="font-medium text-foreground">Export Data</h3>
                <p className="text-sm text-muted-foreground">Download all your data in JSON format</p>
              </div>
              <button className="btn-glass text-sm border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                Export
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive bg-destructive-light">
              <div>
                <h3 className="font-medium text-foreground">Delete Account</h3>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <button className="btn-glass text-sm border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}