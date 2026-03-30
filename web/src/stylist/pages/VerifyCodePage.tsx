import { useAppDispatch } from "../store";
import { goToScreen } from "../store/consultationSlice";
import { SignInPage } from "./SignInPage";

export function VerifyCodePage() {
  const dispatch = useAppDispatch();
  return <SignInPage onBack={() => dispatch(goToScreen("sign-in"))} />;
}
