import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProvider } from "./context/AppContext";
import { InventoryProvider } from "./context/InventoryContext";
import { SalesProvider } from "./context/SalesContext";
import { OrdersProvider } from "./context/OrdersContext";
import { registerSW } from "virtual:pwa-register";
import { AccountsProvider } from "./context/AccountsContext";
import { MilaProvider } from "./context/MilaContext";
import { SandwichProvider } from "./context/SandwichContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

registerSW();

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <AppProvider>
      <InventoryProvider>
        <SalesProvider>
          <OrdersProvider>
            <AccountsProvider>
              <SandwichProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </SandwichProvider>
            </AccountsProvider>
          </OrdersProvider>
        </SalesProvider>
      </InventoryProvider>
    </AppProvider>
  </AuthProvider>
);
