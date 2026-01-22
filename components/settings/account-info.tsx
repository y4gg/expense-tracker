"use client";

import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export function AccountInfo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setName(session.data.user.name);
          setEmail(session.data.user.email);
          setEmailVerified(session.data.user.emailVerified || false);
        }
      } catch {
      }
    };

    getSession();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">Name</h3>
        <p className="text-sm text-muted-foreground">{name}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <h3 className="font-medium">Email</h3>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        {emailVerified && (
          <Badge variant="default">Verified</Badge>
        )}
      </div>
    </div>
  );
}
