
'use client';

import { useAuth, useRequireAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { useState } from 'react';
import { useLocalization } from '@/context/localization-context';

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();
  const { t } = useLocalization();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || PlaceHolderImages[0].imageUrl);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // In a real app, these would be separate forms with state and submission logic.
  // For now, it's a static display.
  
  if (loading || !user) {
    return <div>Loading...</div>;
  }
  
  const handleAvatarSelect = (imageUrl: string) => {
    setSelectedAvatar(imageUrl);
    // Here you would typically call an API to update the user's avatar
    // For mock purposes, we can update localStorage
    const updatedUser = { ...user, avatar: imageUrl };
    localStorage.setItem('cardioart_user', JSON.stringify(updatedUser));
    setIsDialogOpen(false);
    // Force a reload or use a state management library to update the avatar in the layout
    window.location.reload(); 
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h1>
        <p className="text-muted-foreground">{t('profile.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.avatar')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">{t('profile.changeAvatar')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('profile.selectAvatar')}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {PlaceHolderImages.map((img) => (
                  <div key={img.id} className="relative cursor-pointer group" onClick={() => handleAvatarSelect(img.imageUrl)}>
                    <Image
                      src={img.imageUrl}
                      alt={img.description}
                      width={150}
                      height={150}
                      className={`rounded-full transition-all ${selectedAvatar === img.imageUrl ? 'ring-4 ring-primary ring-offset-2' : 'group-hover:ring-2 ring-accent'}`}
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      
      {/* Forms for profile info, password, and language would go here */}
      <Card>
        <CardHeader>
            <CardTitle>{t('profile.language')}</CardTitle>
        </CardHeader>
        <CardContent>
            {/* The language switcher is in the header, but could also be placed here */}
            <p className="text-sm text-muted-foreground">
                {t('profile.language')} selection is available in the top-right corner of the navigation bar.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
