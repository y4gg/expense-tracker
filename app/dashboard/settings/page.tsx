import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { RecurringList } from "@/components/recurring/recurring-list";
import { AddRecurringDialog } from "@/components/recurring/add-recurring-dialog";

export default function SettingsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Theme</h3>
                <p className="text-sm text-muted-foreground">
                  Select your preferred theme (light, dark, or system)
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recurring Transactions</CardTitle>
                <CardDescription>
                  Manage your recurring transactions
                </CardDescription>
              </div>
              <AddRecurringDialog>
                <Button size="default">Add Recurring</Button>
              </AddRecurringDialog>
            </div>
          </CardHeader>
          <CardContent>
            <RecurringList />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
