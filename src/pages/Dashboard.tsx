
import { useState } from 'react';
import { Header } from '@/components/Header';
import { LinkShortener } from '@/components/LinkShortener';
import { LinksList } from '@/components/LinksList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, List } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>إنشاء رابط</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>إدارة الروابط</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <LinkShortener />
          </TabsContent>
          
          <TabsContent value="manage">
            <LinksList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
