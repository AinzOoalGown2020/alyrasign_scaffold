import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>AlyraSign</title>
        <meta
          name="description"
          content="Application de signature AlyraSign"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
