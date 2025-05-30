
import { useState } from 'react';
import { Header } from '@/components/Header';
import { LinkShortener } from '@/components/LinkShortener';
import { LinksList } from '@/components/LinksList';
import { AdvertisementUpload } from '@/components/AdvertisementUpload';
import { UserAdvertisements } from '@/components/UserAdvertisements';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, Image } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="links" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="links" className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span>الروابط</span>
            </TabsTrigger>
            <TabsTrigger value="my-links" className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span>روابطي</span>
            </TabsTrigger>
            <TabsTrigger value="add-ad" className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span>إضافة إعلان</span>
            </TabsTrigger>
            <TabsTrigger value="my-ads" className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span>إعلاناتي</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="links" className="space-y-6">
            <LinkShortener />
          </TabsContent>
          
          <TabsContent value="my-links" className="space-y-6">
            <LinksList />
          </TabsContent>
          
          <TabsContent value="add-ad" className="space-y-6">
            <AdvertisementUpload />
          </TabsContent>
          
          <TabsContent value="my-ads" className="space-y-6">
            <UserAdvertisements />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
