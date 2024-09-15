import { useEffect } from "react";

export const useAutoLogin = () => {
  useEffect(() => {
    const storeTokenFromUrl = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("user");
      console.log(token);

      if (token) {
        const [header, payload, signature] = token.split(".");

        const decodedPayload = JSON.parse(decodeBase64Url(payload));
        const user = decodedPayload._doc;

        localStorage.setItem("user", JSON.stringify(user));

        //Clean up the URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Reload the page
        window.location.reload();
      }
    };

    storeTokenFromUrl();
  }, []);

  const decodeBase64Url = (str) => {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    return atob(paddedBase64);
  };
};
