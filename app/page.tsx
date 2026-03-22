import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

export default async function Home() {
  const users = await prisma.user.findMany();
  console.log(JSON.stringify(users));

  return (
    <div>
      <div>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </div>
      <div className="text-red-600">hello</div>
      <Button>Click me</Button>
    </div>
  );
}
