import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import AssetForm from "@/components/assets/AssetForm";

export const metadata = { title: "Add Asset — Protea Hotels by Marriott" };

export default function NewAssetPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar title="Add Asset" subtitle="Register a new asset in the system" />
        <div className="p-6">
          <div className="max-w-2xl">
            <AssetForm />
          </div>
        </div>
      </main>
    </div>
  );
}
