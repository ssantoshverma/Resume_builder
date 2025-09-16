import AppLayout from "../layouts/AppLayout";
import CareerChat from "./CareerChat";

export default function CareerInsights() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Optional: Tab Navigation here */}
        <CareerChat />
      </div>
    </AppLayout>
  );
}
