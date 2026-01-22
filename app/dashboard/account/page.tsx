"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccountInfo } from "@/components/settings/account-info";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { ChangeEmailDialog } from "@/components/settings/change-email-dialog";
import { DeleteAccountForm } from "@/components/settings/delete-account-form";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard/settings" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mt-2">Account</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your account and security</p>
      </div>

      <div className="space-y-6">
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              View your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountInfo />
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowChangePasswordDialog(true)}>
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle>Change Email</CardTitle>
            <CardDescription>
              Update the email address associated with your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowChangeEmailDialog(true)}>
              Change Email
            </Button>
          </CardContent>
        </Card>

        <DeleteAccountForm />
      </div>

      <ChangePasswordDialog
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
      />
      <ChangeEmailDialog
        open={showChangeEmailDialog}
        onOpenChange={setShowChangeEmailDialog}
      />
    </>
  );
}
