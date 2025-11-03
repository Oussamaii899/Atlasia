import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex aspect-square size-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
      </div>
      <span className="font-bold text-lg">Atlasia</span>
    </div>
  )
}
