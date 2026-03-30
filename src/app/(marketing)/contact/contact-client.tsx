"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar, Mail, MapPin } from "lucide-react";
import { toastSuccess } from "@/lib/toast";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  company: z.string().optional(),
  subject: z.enum([
    "General Inquiry",
    "Demo Request",
    "Technical Support",
    "Billing Question",
    "Partnership",
  ]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactClient() {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: "General Inquiry",
    },
  });

  async function onSubmit(data: ContactForm) {
    setFormError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(
          typeof body.error === "string" ? body.error : "Something went wrong",
        );
        return;
      }
      reset();
      toastSuccess("Message sent", "We'll be in touch soon.");
    } catch {
      setFormError("Network error. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
        Contact
      </h1>
      <p className="mt-4 text-lg text-gray-500">
        We respond within one business day.
      </p>

      <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <form
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none ring-[#2563EB] focus:border-[#2563EB] focus:ring-2"
              {...register("name")}
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
              {...register("email")}
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Company{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="company"
              type="text"
              autoComplete="organization"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
              {...register("company")}
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Subject
            </label>
            <select
              id="subject"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
              {...register("subject")}
            >
              <option>General Inquiry</option>
              <option>Demo Request</option>
              <option>Technical Support</option>
              <option>Billing Question</option>
              <option>Partnership</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
              {...register("message")}
            />
            {errors.message ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.message.message}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#2563EB] py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Send message"}
          </button>
        </form>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <Mail className="h-8 w-8 text-[#2563EB]" />
            <h2 className="mt-4 text-lg font-semibold text-[#0F172A]">Email</h2>
            <a
              href="mailto:support@titlecomply.com"
              className="mt-2 block text-sm text-gray-600 hover:text-[#2563EB]"
            >
              support@titlecomply.com
            </a>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <Calendar className="h-8 w-8 text-[#2563EB]" />
            <h2 className="mt-4 text-lg font-semibold text-[#0F172A]">
              Schedule a Demo
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Calendly link coming soon — email us to schedule a walkthrough.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <MapPin className="h-8 w-8 text-[#2563EB]" />
            <h2 className="mt-4 text-lg font-semibold text-[#0F172A]">
              Location
            </h2>
            <p className="mt-2 text-sm text-gray-600">South Florida</p>
          </div>
        </div>
      </div>

    </div>
  );
}
