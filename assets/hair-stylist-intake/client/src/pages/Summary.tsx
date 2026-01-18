import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Check, Loader2, Calendar } from "lucide-react";

/**
 * Booking summary and confirmation page
 * Shows selected services, total price, and collects client information
 */
export default function Summary() {
  const [, params] = useRoute("/summary/:id");
  const [, setLocation] = useLocation();
  const treeId = params?.id ? parseInt(params.id) : null;

  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDateTime: "",
    notes: "",
  });

  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("Booking request submitted successfully!");
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error) => {
      toast.error(`Failed to submit booking: ${error.message}`);
    },
  });

  // Get state from sessionStorage (passed from Intake page)
  const [bookingData, setBookingData] = useState<{
    selectedServices: any[];
    totalPrice: number;
    totalDuration: number;
    appliedRules: string[];
  } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`booking-${treeId}`);
    if (stored) {
      setBookingData(JSON.parse(stored));
    }
  }, [treeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientInfo.name || !clientInfo.email) {
      toast.error("Please provide your name and email");
      return;
    }

    if (!bookingData) {
      toast.error("No booking data found");
      return;
    }

    createBookingMutation.mutate({
      decisionTreeId: treeId!,
      selectedServices: JSON.stringify(bookingData.selectedServices),
      totalPrice: bookingData.totalPrice,
      totalDuration: bookingData.totalDuration,
      appliedRules: bookingData.appliedRules.length > 0 ? JSON.stringify(bookingData.appliedRules) : undefined,
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientPhone: clientInfo.phone || undefined,
      preferredDateTime: clientInfo.preferredDateTime || undefined,
      notes: clientInfo.notes || undefined,
    });
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Booking Data</CardTitle>
            <CardDescription>Please complete the service selection first</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} variant="outline" className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-foreground">Booking Summary</h1>
          <p className="text-muted-foreground mt-1">Review your selections and schedule your appointment</p>
        </div>
      </header>

      <main className="container max-w-4xl py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Services summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selected Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingData.selectedServices.map((service, index) => (
                    <div key={index} className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">{service.selectedOption.label}</div>
                          <div className="text-sm text-muted-foreground">{service.question}</div>
                          {service.duration > 0 && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatDuration(service.duration)}
                            </div>
                          )}
                        </div>
                      </div>
                      {service.price > 0 && (
                        <div className="text-foreground font-medium whitespace-nowrap">
                          ${(service.price / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Duration</span>
                      <span className="text-foreground font-medium">{formatDuration(bookingData.totalDuration)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total Price</span>
                      <span className="text-foreground">${(bookingData.totalPrice / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  {bookingData.appliedRules.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm font-medium text-foreground mb-2">Applied Discounts</div>
                        <ul className="space-y-1">
                          {bookingData.appliedRules.map((rule, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <Check className="w-3 h-3 text-primary" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client information form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>We'll use this to confirm your appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="datetime">Preferred Date & Time</Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={clientInfo.preferredDateTime}
                      onChange={(e) => setClientInfo({ ...clientInfo, preferredDateTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={clientInfo.notes}
                      onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                      placeholder="Any special requests or information..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={createBookingMutation.isPending}>
                      {createBookingMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Request Appointment
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation(`/intake/${treeId}`)}
                      disabled={createBookingMutation.isPending}
                    >
                      Back
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}hr`;
  return `${hours}hr ${mins}min`;
}
