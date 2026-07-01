import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  History,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/features/auth/AuthSlice";

const SettingsPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    {
      id: "account",
      label: "Account",
      icon: <User size={18} />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={18} />,
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: <Shield size={18} />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Palette size={18} />,
    },
    {
      id: "activity",
      label: "Activity",
      icon: <History size={18} />,
    },
    {
      id: "about",
      label: "About",
      icon: <Info size={18} />,
    },
  ];

  const SettingRow = ({
    title,
    description,
    onClick,
    badge,
    danger = false,
  }: {
    title: string;
    description: string;
    onClick?: () => void;
    badge?: string;
    danger?: boolean;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-xl border p-4 hover:bg-gray-50 transition"
    >
      <div className="text-left">
        <div
          className={`font-medium ${
            danger ? "text-red-600" : "text-gray-900"
          }`}
        >
          {title}
        </div>

        <div className="text-sm text-gray-500">{description}</div>
      </div>

      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {badge}
          </span>
        )}

        <ChevronRight size={18} />
      </div>
    </button>
  );

    const dispatch = useDispatch();
    const handleLogout = () => {
      dispatch(logout() as any);
      navigate("/login");
    };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="grid md:grid-cols-[240px_1fr] gap-6">

          {/* Sidebar */}

          <div className="bg-white rounded-2xl shadow-sm border p-2 h-fit">

            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition

                ${
                  activeTab === tab.id
                    ? "bg-indigo-100 text-indigo-700"
                    : "hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}

          <div className="bg-white rounded-2xl shadow-sm border p-6">

            {activeTab === "account" && (
              <div className="space-y-4">

                <h2 className="text-xl font-semibold mb-4">
                  Account
                </h2>

                <SettingRow
                  title="Edit Profile"
                  description="Update your profile information."
                  onClick={() => navigate("/profile/update")}
                />

                <SettingRow
                  title="View Profile"
                  description="See your public profile."
                  onClick={() => navigate("/profile")}
                />

                <SettingRow
                  title="Change Password"
                  description="Update your password."
                  badge="Coming Soon"
                />
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">

                <h2 className="text-xl font-semibold mb-4">
                  Notifications
                </h2>

                <SettingRow
                  title="Push Notifications"
                  description="Receive notifications."
                  badge="Coming Soon"
                />

                <SettingRow
                  title="Messages"
                  description="Notify when you receive a message."
                  badge="Coming Soon"
                />

                <SettingRow
                  title="Likes & Comments"
                  description="Notify when someone interacts with your post."
                  badge="Coming Soon"
                />

              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-4">

                <h2 className="text-xl font-semibold mb-4">
                  Privacy
                </h2>

                <SettingRow
                  title="Private Account"
                  description="Only approved followers can view your profile."
                  badge="Coming Soon"
                />

                <SettingRow
                  title="Blocked Users"
                  description="Manage blocked accounts."
                  badge="Coming Soon"
                />

                <SettingRow
                  title="Online Status"
                  description="Control who can see when you're online."
                  badge="Coming Soon"
                />

              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-4">

                <h2 className="text-xl font-semibold mb-4">
                  Appearance
                </h2>

                <SettingRow
                  title="Theme"
                  description="Light, Dark or System theme."
                  badge="Coming Soon"
                />

                <SettingRow
                  title="Language"
                  description="Choose your preferred language."
                  badge="Coming Soon"
                />

              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-4">

                <h2 className="text-xl font-semibold mb-4">
                  Activity
                </h2>

                <SettingRow
                  title="Your Activity"
                  description="View posts, comments and likes."
                  onClick={() => navigate("/your-activity")}
                />

              </div>
            )}

            {activeTab === "about" && (
              <div className="space-y-4">

                <h2 className="text-xl font-semibold mb-4">
                  About
                </h2>

                <div className="rounded-xl border p-4">

                  <div className="font-semibold">
                    TOMO
                  </div>

                  <div className="text-gray-500 mt-1">
                    Version 1.0.0
                  </div>

                </div>

                <SettingRow
                  title="Privacy Policy"
                  description="Read our privacy policy."
                />

                <SettingRow
                  title="Terms & Conditions"
                  description="Read our terms of service."
                />

              </div>
            )}

            <div className="border-t mt-8 pt-6">

              <SettingRow
                title="Logout"
                description="Sign out of your account."
                danger
                onClick={() => {handleLogout(); navigate("/login")}}
              />

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default SettingsPage;