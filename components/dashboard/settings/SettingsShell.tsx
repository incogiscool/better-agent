"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "./AccountTab";
import { SecurityTab } from "./SecurityTab";

type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
};

export function SettingsShell({ user }: { user: User }) {
  return (
    <Tabs defaultValue="account">
      <div className="border-b border-border px-6">
        <TabsList className="h-auto gap-6 rounded-none bg-transparent p-0">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="account" className="mt-0">
        <AccountTab user={user} />
      </TabsContent>

      <TabsContent value="security" className="mt-0">
        <SecurityTab />
      </TabsContent>
    </Tabs>
  );
}
