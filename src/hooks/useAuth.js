import { useState, useEffect } from "react";
import { getCurrentUser, signIn, signOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    error: null,
  });

  const checkAuthState = async () => {
    try {
      const user = await getCurrentUser();
      setAuthState({ user, loading: false, error: null });
    } catch (error) {
      setAuthState({ user: null, loading: false, error: null });
    }
  };

  useEffect(() => {
    // Initial auth check
    checkAuthState();

    // Listen for auth events
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      const { event } = payload;
      if (event === "signedIn" || event === "signedOut") {
        checkAuthState(); // re-check user state
      }
    });

    return () => unsubscribe(); // cleanup
  }, []);

  const login = async (email, password) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await signIn({ username: email, password });
      // No need to call getCurrentUser manually – Hub will re-trigger checkAuthState
      return { success: true };
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Login failed",
      }));
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const logout = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true }));
      await signOut();
      // Hub will handle state cleanup
    } catch (error) {
      console.error("Logout error:", error);
      setAuthState({ user: null, loading: false, error: null });
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    isAuthenticated: !!authState.user,
  };
};
