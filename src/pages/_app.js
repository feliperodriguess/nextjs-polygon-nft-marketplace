import '../styles/globals.css'
import Link from 'next/link'

import { HEADER_ITEMS } from '../utils/helpers'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Metaverse Marketplace</p>
        <div className="flex mt-4">
          {HEADER_ITEMS.map(({ label, href }) => (
            <Link key={label} href={href}>
              <a className="mr-6 text-pink-500">{label}</a>
            </Link>
          ))}
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
