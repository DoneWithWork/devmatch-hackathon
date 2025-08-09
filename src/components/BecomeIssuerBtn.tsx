"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";

import { ApproveIssuerAction } from "@/app/actions/ApproveIssuer";
import { ApprovalIssuerSchema } from "@/schema/schema";
import { initialState } from "@/types/types";
import {
  Check,
  Circle,
  CircleUser,
  Clipboard,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { OurUploadDropzone } from "./UploadDropzone";
import { env } from "@/lib/env/client";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import Link from "next/link";
const TXT_RECORD = `hashcred=${env.NEXT_PUBLIC_TXT_KEY}`;
export default function BecomeIssuerBtn({ isIssuer }: { isIssuer: boolean }) {
  const [copied, setCopied] = useState<boolean>(false);
  const [domain, setDomain] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const [successDns, setSuccessDns] = useState<boolean>(false);
  const [files, setFileUrls] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const [state, action, actionPending] = useActionState(
    ApproveIssuerAction,
    initialState
  );
  const form = useForm<z.infer<typeof ApprovalIssuerSchema>>({
    resolver: zodResolver(ApprovalIssuerSchema),
    defaultValues: {},
  });
  function CopyTxtRecord() {
    setCopied(true);
    navigator.clipboard.writeText(TXT_RECORD);
    toast.success("Copied TXT record");
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }
  useEffect(() => {
    if (state?.success) {
      setDialogOpen(false);
      toast(state.message);
    } else if (state?.errorMessage && !state.success) {
      setSuccessDns(false);
      toast(state.errorMessage);
    }
  }, [state, form]);
  async function performLookUp() {
    try {
      if (!domain) {
        toast.error("Enter a domain name!");
        if (ref.current) ref.current.focus();
        return;
      }
      setPending(true);
      const res = await fetch(`/api/utils/dns/${domain}`, {
        method: "GET",
      });
      if (!res.ok) {
        toast.error("Error checking DNS lookup");
        return;
      }
      const data = (await res.json()) as { status: boolean };
      setSuccessDns(data.status);
      if (data.status) {
        toast.success("Successfully found TXT record!");
        setSuccessDns(true);
      } else {
        toast.error("Cannot find TXT record. Please wait some time.");
      }
    } catch {
      toast.error("An error occured!");
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      {isIssuer ? (
        <SidebarMenuItem key={"issuer link"}>
          <SidebarMenuButton
            asChild
            className="cursor-pointer rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 font-medium shadow-lg text-white hover:text-white my-2  hover:from-orange-600 hover:to-orange-700 transition-all duration-200  h-12 hover:shadow-xl transform hover:scale-[101%]"
          >
            <Link href={"/dashboard/issuer"}>
              <CircleUser size={20} />
              Issuer
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ) : (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="glass-container">Become An Issuer</Button>
          </DialogTrigger>
          <DialogContent className="glass-container">
            <DialogHeader>
              <DialogTitle>Application</DialogTitle>
              <DialogDescription>
                Follow the steps below to become an issuer
              </DialogDescription>
              <Form {...form}>
                <form action={action} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <Label
                          htmlFor="dns"
                          className="flex flex-row items-center gap-3"
                        >
                          <span>
                            1. Add the following TXT record to your DNS
                          </span>
                          {successDns ? (
                            <Check
                              className="size-6 text-green-500 "
                              size={20}
                            />
                          ) : (
                            <Circle className="animate-caret-blink text-orange-500" />
                          )}
                        </Label>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="flex flex-row items-center gap-1 border-[1px] rounded-md">
                              <Input
                                readOnly
                                name="dns"
                                disabled={successDns}
                                className="border-l-0 border-r-[1px] rounded-none border-t-0 border-b-0"
                                value={TXT_RECORD}
                              ></Input>
                              <div className="px-1">
                                {copied ? (
                                  <ClipboardCheck className="size-6 text-green-500 cursor-pointer" />
                                ) : (
                                  <Clipboard
                                    onClick={CopyTxtRecord}
                                    className="size-6 text-orange-500 cursor-pointer"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor="domain">
                                Enter domain name to verify DNS TXT record
                              </Label>
                              <Input
                                {...field}
                                placeholder="hashcred.com"
                                ref={ref}
                                id="domain"
                                readOnly={successDns}
                                name="domain"
                                onChange={(e) => setDomain(e.target.value)}
                              ></Input>
                            </div>
                          </div>
                        </FormControl>
                        <Button
                          type="button"
                          onClick={performLookUp}
                          disabled={successDns}
                          className="w-full"
                        >
                          <span>Verify TXT records</span>
                          {pending && (
                            <Loader2
                              size={20}
                              className="size-5 animate-spin"
                            />
                          )}
                        </Button>
                        {state?.errors?.domain && (
                          <p id="city-error" className="text-sm text-red-500">
                            {state.errors.domain[0]}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <div className="space-y-3">
                    <Label>2. Upload supporting documents</Label>
                    <OurUploadDropzone setFileUrls={setFileUrls} />
                    {files &&
                      files.map((file, index) => <div key={index}>{file}</div>)}
                  </div>
                  <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>3. Institution</FormLabel>
                        <Select
                          defaultValue="university"
                          name="institution"
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a verified email to display" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="university">
                              University
                            </SelectItem>
                            <SelectItem value="college">College</SelectItem>
                            <SelectItem value="school">School</SelectItem>
                            <SelectItem value="online_center">
                              Online Center
                            </SelectItem>
                            <SelectItem value="gov_agency">
                              Government Agency
                            </SelectItem>
                            <SelectItem value="research_institute">
                              Research Institute
                            </SelectItem>
                            <SelectItem value="training_provider">
                              Training Provider
                            </SelectItem>
                            <SelectItem value="non_profit">
                              Non-Profit Organization
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {state?.errors?.institution && (
                          <p id="city-error" className="text-sm text-red-500">
                            {state.errors.institution[0]}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={actionPending || !successDns}
                  >
                    <span>Submit</span>
                    {actionPending && (
                      <Loader2 size={20} className="size-5 animate-spin" />
                    )}
                  </Button>
                </form>
              </Form>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
