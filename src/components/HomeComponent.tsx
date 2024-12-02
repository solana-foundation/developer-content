import Link from "next/link";
import Image from "next/image";
import solanaLogo from "@/../public/solana-logo.svg";
import solanaWordmark from "@/../public/solana-wordmark.svg";

export const HomeViewComponent = () => {
  return (
    <main className="items-center max-w-6xl p-8 mx-auto space-y-8 md:py-16">
      <Link
        href="https://solana.com/docs"
        className="flex items-center justify-center gap-1 md:gap-5"
      >
        <Image
          priority
          src={solanaLogo}
          alt=""
          height={64}
          className="max-h-10 md:max-h-16"
        />
        <Image
          priority
          src={solanaWordmark}
          alt="Solana"
          height={50}
          className="max-h-8 md:max-h-12"
        />
      </Link>

      <section className="space-y-2 text-center">
        {/* <h1 className="text-4xl font-semibold md:text-6xl">
          Solana Developer Content
        </h1> */}
        <p className="text-lg text-gray-300">
          Documentation, educational guides, and more developer resources
        </p>
      </section>

      <section className="grid justify-center gap-6 mx-auto md:grid-cols-3">
        <Link
          href="https://solana.com/docs"
          className="card hover:border-gray-500"
        >
          <h2>Solana Core Documentation</h2>
          <p>
            Read and explore the core Solana blockchain documentation, including
            the Solana programming model and RPC API.
          </p>
        </Link>
        <Link
          href="https://docs.solanalabs.com/"
          className="card hover:border-gray-500"
        >
          <h2>Solana Validator Client</h2>
          <p>
            Read and explore the documentation for the Validator Client
            originally developed by Solana Labs, including the Solana CLI
            tool-suite and validator architecture.
          </p>
        </Link>
        <Link
          href="https://solana.com/developers"
          className="card hover:border-gray-500"
        >
          <h2>Solana Developer Resources</h2>
          <p>
            A collection of resources for learning in the Solana ecosystem, from
            education guides to popular ecosystem tooling.
          </p>
        </Link>
      </section>

      <div className="!bg-yellow-800 !border-yellow-600 card">
        <h3 className="text-lg font-semibold">
          The Solana Documentation has moved!
        </h3>
        <p className="!text-white">
          Recently, the original Solana documentation was split into two
          different documentation websites:
        </p>
        <ul className="ml-10 list-disc">
          <li className="">
            <Link href="https://solana.com/docs" className="">
              solana.com/docs
            </Link>
          </li>
          <li className="">
            <Link href="https://docs.solanalabs.com" className="">
              docs.solanalabs.com
            </Link>
          </li>
        </ul>
        <p className="!text-white">
          The Solana blockchain&apos;s core documentation can now be found on{" "}
          <Link href="https://solana.com/docs" className="">
            solana.com/docs
          </Link>
          , which contains all the common information an application developer
          would need to know and understand to build on Solana. Including things
          like the Solana programming model&apos;s{" "}
          <Link href={"https://solana.com/docs/core/accounts"}>
            Core Concepts
          </Link>
          , <Link href={"https://solana.com/docs/rpc"}>Solana RPC methods</Link>
          , and{" "}
          <Link href={"https://solana.com/docs/rpc"}>
            writing onchain programs
          </Link>
          .
        </p>

        <p className="!text-white">
          The documentation for the original Solana Validator Client developed
          by Solana Labs can now be found on{" "}
          <Link href="https://docs.solanalabs.com" className="">
            docs.solanalabs.com
          </Link>
          , which contains all the information specific to that validator
          client&apos;s implementation and inner workings. Including{" "}
          <Link href={"https://solana.com/docs/intro/installation"}>
            installing the Solana CLI tool-suite
          </Link>
          , this{" "}
          <Link href={"https://docs.solanalabs.com/architecture"}>
            validator&apos;s architecture
          </Link>
          , and{" "}
          <Link
            href={"https://docs.solanalabs.com/operations/setup-a-validator"}
          >
            how to operate a validator
          </Link>
          .
        </p>
      </div>
    </main>
  );
};
