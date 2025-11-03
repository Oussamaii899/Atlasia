import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Profile settings',
    href: '/settings/profile',
  },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
  const { auth } = usePage<SharedData>().props;

  const [data, setData] = useState({
    name: auth.user.name,
    email: auth.user.email,
    bio: auth.user.bio || '',
    avatar: null as File | null,
    banner: null as File | null,
  });

  const [errors, setErrors] = useState<any>({});
  const [processing, setProcessing] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('bio', data.bio);
    formData.append('_method', 'PATCH');

    if (data.avatar) {
      formData.append('avatar', data.avatar);
      console.log('Appending avatar:', data.avatar);
    }

    if (data.banner) {
      formData.append('banner', data.banner);
      console.log('Appending banner:', data.banner);
    }

    // Debug FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    router.post(route('profile.update'), formData, {
      preserveScroll: true,
      onSuccess: () => {
        setProcessing(false);
        setRecentlySuccessful(true);
        setTimeout(() => setRecentlySuccessful(false), 2000);
        console.log('Success!');
      },
      onError: (errors) => {
        setProcessing(false);
        setErrors(errors);
        console.log('Errors:', errors);
      },
      onFinish: () => {
        setProcessing(false);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile settings" />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall title="Profile information" description="Update your profile details." />

          <form onSubmit={submit} className="space-y-6">
            {/* Avatar */}
            <div className="grid gap-2">
              <Label htmlFor="avatar">Avatar</Label>
              {auth.user.avatar && (
                <img
                  src={auth.user.avatar}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover border"
                />
              )}
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  console.log('Selected avatar file:', file);
                  setData(prev => ({ ...prev, avatar: file }));
                }}
              />
              {errors.avatar && <InputError message={errors.avatar} className="mt-2" />}
            </div>

            {/* Banner */}
            <div className="grid gap-2">
              <Label htmlFor="banner">Banner</Label>
              {auth.user.banner && (
                <img
                  src={auth.user.banner}
                  alt="Banner"
                  className="h-32 w-full object-cover rounded-lg border"
                />
              )}
              <Input
                id="banner"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  console.log('Selected banner file:', file);
                  setData(prev => ({ ...prev, banner: file }));
                }}
              />
              {errors.banner && <InputError message={errors.banner} className="mt-2" />}
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                required
                autoComplete="name"
              />
              {errors.name && <InputError message={errors.name} className="mt-2" />}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                required
                autoComplete="email"
              />
              {errors.email && <InputError message={errors.email} className="mt-2" />}
            </div>

            {/* Bio */}
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={data.bio}
                onChange={(e) => setData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                placeholder="Tell us a little about yourself"
              />
              {errors.bio && <InputError message={errors.bio} className="mt-2" />}
            </div>

            {/* Email verification */}
            {mustVerifyEmail && auth.user.email_verified_at === null && (
              <div>
                <p className="text-muted-foreground text-sm -mt-2">
                  Your email is unverified.{' '}
                  <Link
                    href={route('verification.send')}
                    method="post"
                    as="button"
                    className="underline"
                  >
                    Resend verification email.
                  </Link>
                </p>
                {status === 'verification-link-sent' && (
                  <p className="text-sm text-green-600 mt-2">
                    A new verification link has been sent.
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button disabled={processing}>Save</Button>
              <Transition
                show={recentlySuccessful}
                enter="transition ease-in-out"
                enterFrom="opacity-0"
                leave="transition ease-in-out"
                leaveTo="opacity-0"
              >
                <p className="text-sm text-neutral-600">Saved.</p>
              </Transition>
            </div>
          </form>
        </div>

        <DeleteUser />
      </SettingsLayout>
    </AppLayout>
  );
}