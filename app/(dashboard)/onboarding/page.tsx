import { redirect } from 'next/navigation'

// O wizard completo vive em /onboarding (fora do grupo dashboard)
// para ter layout focado sem a nav do painel.
export default function OnboardingRedirect() {
  redirect('/onboarding')
}
