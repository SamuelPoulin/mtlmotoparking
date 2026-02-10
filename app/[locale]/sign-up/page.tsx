import { SignUpClient } from "@/src/components/SignUpClient";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  return <SignUpClient />;
}
