import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = "https://storyframes-backend-1.onrender.com";

export default function PayPalCheckout({
  productId = 1,
  clientId = "YOUR_CLIENT_ID",
  apiBase = API_BASE,
  onSuccess,
  onError
}) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);

  const handleError = useCallback(
    (message) => {
      if (onError) {
        onError(message);
        return;
      }
      alert(message);
    },
    [onError]
  );

  const handleSuccess = useCallback(
    (status) => {
      if (onSuccess) {
        onSuccess(status);
        return;
      }
      alert("Payment status: " + status);
    },
    [onSuccess]
  );

  useEffect(() => {
    if (!clientId || clientId === "YOUR_CLIENT_ID") {
      handleError("PayPal client ID is missing or invalid.");
      return;
    }
    setLoaded(false);
    const existingScript = document.querySelector(
      `script[data-paypal-sdk="true"][data-client-id="${clientId}"]`
    );
    if (existingScript) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.dataset.paypalSdk = "true";
    script.dataset.clientId = clientId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [clientId, handleError]);

  useEffect(() => {
    if (!loaded || !window.paypal) return;
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    window.paypal
      .Buttons({
        createOrder: async () => {
          try {
            const orderParams = new URLSearchParams({ product_id: String(productId) });
            const res = await fetch(`${apiBase}/pay/paypal?${orderParams.toString()}`, {
              method: "POST"
            });
            if (!res.ok) {
              const message = await res.text();
              throw new Error(message || "Failed to create PayPal order.");
            }
            const data = await res.json();
            if (!data.orderID) {
              throw new Error("Missing order ID.");
            }
            return data.orderID;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to create PayPal order.";
            handleError(message);
            throw error;
          }
        },
        onApprove: async (data) => {
          try {
            const captureParams = new URLSearchParams({ order_id: String(data.orderID) });
            const res = await fetch(`${apiBase}/pay/paypal/capture?${captureParams.toString()}`, {
              method: "POST"
            });
            if (!res.ok) {
              const message = await res.text();
              throw new Error(message || "Failed to capture PayPal order.");
            }
            const capture = await res.json();
            handleSuccess(capture.status);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to capture PayPal order.";
            handleError(message);
          }
        }
      })
      .render(container);

    return () => {
      container.innerHTML = "";
    };
  }, [apiBase, handleError, handleSuccess, loaded, productId]);

  return <div ref={containerRef}></div>;
}
