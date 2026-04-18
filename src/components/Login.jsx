import { useGoogleLogin } from "@react-oauth/google";
import { updateSetting } from "../services/settingsService";

export default function Login({ onLogin }) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Login Success:", tokenResponse);
      updateSetting('google_access_token', tokenResponse.access_token);
      if (onLogin) onLogin();
    },
    onError: () => {
      console.log("Login Failed");
    },
    scope: "https://www.googleapis.com/auth/calendar.readonly",
  });

  return (
    <button className="btn-ghost settings-connect-btn" onClick={() => login()}>
      Connect
    </button>
  );
}
