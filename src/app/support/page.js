import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  Clock,
  MessageSquare,
  Search,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function SupportLandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  How can we help you today?
                </h1>
                <p className="text-xl text-muted-foreground">
                  Our support team is here to assist you with any questions or
                  issues you may have.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="font-medium">
                    <Link href="/support/create-ticket">
                      <Ticket className="mr-2 h-5 w-5" />
                      Submit a Ticket
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="font-medium"
                  >
                    <Link href="#faq">
                      <Search className="mr-2 h-5 w-5" />
                      Browse FAQs
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <Image
                  src="https://res.cloudinary.com/dg8w1kluo/image/upload/v1746423766/support-letters-scrabble-help-032a312c32dabbfb01138874965d6505_hpjjxz.jpg"
                  alt="Support illustration"
                  width={800}
                  height={400}
                  className="rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How Our Support Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We&apos;ve designed our support system to be simple, secure, and
                effective.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-blue-700" />
                  </div>
                  <CardTitle>1. Submit a Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fill out our support form with details about your issue.
                    You&apos;ll receive a secure link to track your ticket via
                    email.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-amber-700" />
                  </div>
                  <CardTitle>2. Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Use the secure link in your email to view your ticket
                    status, add more information, and respond to our team.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-700" />
                  </div>
                  <CardTitle>3. Get Resolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our support team will work with you to resolve your issue.
                    You&apos;ll receive email notifications for any updates.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg">
                <Link href="/support/create-ticket">Create Support Ticket</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Support Options Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Support Options</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the support option that works best for you.
              </p>
            </div>

            <Tabs defaultValue="ticket" className="max-w-3xl mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ticket">Support Ticket</TabsTrigger>
                <TabsTrigger value="check">Check Ticket Status</TabsTrigger>
              </TabsList>
              <TabsContent
                value="ticket"
                className="p-6 bg-white rounded-lg shadow-md mt-4"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Submit a Support Ticket
                  </h3>
                  <p>
                    Create a new support ticket to get help with any issues or
                    questions you have. Our team will respond as quickly as
                    possible.
                  </p>
                  <div className="flex items-center space-x-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span>Secure & confidential communication</span>
                  </div>
                  <div className="pt-4">
                    <Button asChild>
                      <Link href="/support/create-ticket">
                        <Ticket className="mr-2 h-4 w-4" />
                        Create New Ticket
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                value="check"
                className="p-6 bg-white rounded-lg shadow-md mt-4"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Check Ticket Status</h3>
                  <p>
                    Already submitted a ticket? Use the secure link sent to your
                    email to check the status and continue the conversation.
                  </p>
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      The secure link was sent to your email when you created
                      the ticket. Please check your inbox and spam folder.
                    </p>
                    <p className="text-sm font-medium">
                      If you can&apos;t find the email, please create a new
                      ticket and mention your previous ticket details.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find quick answers to common questions about our support system.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    How quickly will I receive a response?
                  </AccordionTrigger>
                  <AccordionContent>
                    We aim to respond to all support tickets within 24 hours
                    during business days. For urgent issues, we typically
                    respond much faster. You&apos;ll receive an email
                    notification when we reply to your ticket.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Can I attach files to my support ticket?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, you can attach files such as screenshots, documents, or
                    logs to your support ticket. This helps us understand and
                    resolve your issue more quickly. You can add attachments
                    both when creating a ticket and when replying to an existing
                    conversation.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    How secure is the support system?
                  </AccordionTrigger>
                  <AccordionContent>
                    Our support system uses secure, encrypted communications.
                    Each ticket is accessible only via a unique, secure link
                    sent to your email. We never share your information with
                    third parties, and all communications are confidential.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    I lost my ticket link. What should I do?
                  </AccordionTrigger>
                  <AccordionContent>
                    If you&apos;ve lost your secure ticket link, please submit a
                    new ticket and mention that you&apos;ve lost access to a
                    previous ticket. Include any information about the original
                    issue, and we&apos;ll help reconnect you with your previous
                    conversation.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    Can I reopen a closed ticket?
                  </AccordionTrigger>
                  <AccordionContent>
                    Once a ticket is closed, you cannot reopen it directly.
                    However, you can create a new ticket and reference the
                    previous ticket number. For ongoing issues related to a
                    closed ticket, we recommend creating a new ticket for better
                    tracking.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg mb-4">Still have questions?</p>
              <Button asChild>
                <Link href="/support/create-ticket">Contact Support</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Support?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Our team is standing by to help you with any questions or issues
              you may have.
            </p>
            <Button asChild size="lg" className="font-medium">
              <Link href="/support/create-ticket">
                <Ticket className="mr-2 h-5 w-5" />
                Submit a Support Ticket
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
