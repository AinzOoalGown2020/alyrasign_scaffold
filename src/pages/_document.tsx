import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <title>AlyraSign</title>
        <link rel="icon" href="/AlyraSign.png" />
        <meta name="description" content="Application de signature AlyraSign" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
