import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4">
      <SignUp />
    </div>
  );
}
