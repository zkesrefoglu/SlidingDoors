import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to main site - this page shouldn't be directly accessible
  redirect('https://zke-solutions.com')
}
