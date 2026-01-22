import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Expense Tracker
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Track your expenses with categories and filters
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle>Track Expenses</CardTitle>
                <CardDescription>Add and manage income and expenses with ease</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Log transactions quickly and keep all your financial data in one place
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Organize transactions with color-coded categories</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create custom categories to group and visualize your spending patterns
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>View your balance, income, and expenses at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get instant insights with clear summaries and visualizations
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle>Recurring Transactions</CardTitle>
                <CardDescription>Set up automatic recurring payments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Never miss a payment by scheduling recurring income and expenses
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle>Smart Filtering</CardTitle>
                <CardDescription>Filter by category, date range, and transaction type</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Find exactly what you need with powerful search and filter options
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>Your financial data stays secure and private</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built with security in mind to protect your sensitive information
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to take control of your finances?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Start tracking your expenses today and gain insights into your spending habits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
