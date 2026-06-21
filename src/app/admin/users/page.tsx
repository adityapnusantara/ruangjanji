import Link from "next/link";
import { redirect } from "next/navigation";
import { updateUserRoleAction, updateUserStatusAction } from "@/app/admin/actions";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "admin") redirect("/dashboard");

  const users = await query<UserRow>(
    `select id, name, email, role, status, created_at
     from users
     order by created_at desc`,
  );

  return (
    <main className="min-h-screen bg-[#fff9f1] px-6 py-10 text-[#2b2118] lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/admin" className="text-sm text-[#8d7350]">← Admin</Link>
        <h1 className="mt-6 font-serif text-5xl tracking-[-0.04em]">Users</h1>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-[#eadcc6] bg-white/65">
          <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_1fr] gap-4 border-b border-[#eadcc6] px-6 py-4 text-sm text-[#8d7350]">
            <span>User</span><span>Role</span><span>Status</span><span>Action</span>
          </div>
          {users.rows.map((user) => (
            <div key={user.id} className="grid grid-cols-[1.4fr_0.7fr_0.7fr_1fr] items-center gap-4 border-b border-[#eadcc6] px-6 py-4 last:border-b-0">
              <div>
                <p className="font-medium">{user.name || "Tanpa nama"}</p>
                <p className="text-sm text-[#6f5f4d]">{user.email}</p>
              </div>
              <span className="text-sm">{user.role}</span>
              <span className="text-sm">{user.status}</span>
              <div className="flex flex-wrap gap-2">
                <form action={updateUserRoleAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="role" value={user.role === "admin" ? "user" : "admin"} />
                  <button disabled={user.id === currentUser.id} className="rounded-full border border-[#dfcfb8] px-3 py-1.5 text-xs disabled:opacity-40">
                    {user.role === "admin" ? "Make user" : "Make admin"}
                  </button>
                </form>
                <form action={updateUserStatusAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="status" value={user.status === "active" ? "suspended" : "active"} />
                  <button disabled={user.id === currentUser.id} className="rounded-full border border-[#dfcfb8] px-3 py-1.5 text-xs disabled:opacity-40">
                    {user.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
