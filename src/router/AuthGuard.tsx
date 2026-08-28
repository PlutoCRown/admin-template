import { Navigate, Outlet } from "react-router";
import { Spin } from "antd";
import { useStoreHydration } from "#hooks/use-store-hydration";
import { useUserStore } from "#stores/user";

export function AuthGuard() {
  const token = useUserStore((state) => state.token);
  const hydrated = useStoreHydration();

  if (!hydrated) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
