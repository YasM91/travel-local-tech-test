import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en-GB">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#0f766e" />
        <meta property="og:site_name" content="TravelLocal" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_GB" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
