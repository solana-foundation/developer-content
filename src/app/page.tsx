import { HomeViewComponent } from "@/components/HomeComponent";
import { redirect } from "next/navigation";

export default function Page() {
  // redirect away in non-dev mode
  if (process.env.NODE_ENV != "development") {
    redirect("https://solana.com/docs");
  }

  return <HomeViewComponent />;
}
