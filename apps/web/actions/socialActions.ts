"use server";
import { signIn, signOut } from "apps/web/lib/auth";
// --------------------------------------------------------------------
export async function handleLogin(formData: FormData) {
  const action = formData.get("action");
     await signIn(action as string,{redirectTo: "/"});
  }

// --------------------------------------------------------------------
export async function handleLogout() {
  await signOut({ redirectTo: "/" });
}

export async function handleCredentialsLogin(formData: FormData) {
  try {
    const response = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      // this is false because in case incorect credentials we want to stay on the same page and show an error message instead of redirecting to the home page
      redirect: false,
    });
    
    return response;
  } catch (error) {
    console.log("ERROR FROM SOCIALACTIONS.TS:", error);
    return { error: "An error occurred during login" };
  }
}
