import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TicketSubmittedPage() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-16 flex justify-center items-center min-h-[50vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">
              Ticket Submitted Successfully
            </CardTitle>
            <CardDescription>
              Thank you for contacting our support team
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>
              We have received your support request and will respond as soon as
              possible.
            </p>

            <Alert
              variant="warning"
              className="bg-amber-50 border-amber-200 text-left"
            >
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Important:</strong> Please check your spam/junk folder
                for the confirmation email if you don't see it in your inbox.
              </AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your email address with a
              secure link to track your ticket.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/support/create-ticket">
              <Button variant="outline" className="mr-2">
                Submit Another Ticket
              </Button>
            </Link>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
