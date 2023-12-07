import Head from "next/head";

export function getServerSideProps() {
  // redirect away in non-dev mode
  if (process.env.NODE_ENV != "development") {
    return {
      redirect: {
        destination: "https://solana.com/developers",
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
}

export default function Page() {
  return (
    <>
      <Head>
        <title>Solana Developer Content</title>
      </Head>

      <main className="p-4">nothing to see here</main>
    </>
  );
}
