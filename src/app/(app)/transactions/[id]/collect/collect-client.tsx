"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { BuyerType } from "@/generated/prisma/enums";
import { Alert, Button, Input, Progress, Select, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "@/components/ui";

type EntityForm = {
  entityName: string;
  entityType: BuyerType;
  ein: string;
  formationState: string;
  formationDate: string;
  registeredAgentName: string;
  registeredAgentAddress: string;
  principalPlaceOfBusiness: string;
  businessPurpose: string;
};

type TrustForm = {
  trustName: string;
  trustType: string;
  trustDate: string;
  trusteeName: string;
  trusteeAddress: string;
  grantorName: string;
  grantorAddress: string;
  ein: string;
};

type OwnerForm = {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssnItin: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  ownershipPercentage: number;
  idType: string;
  idNumber: string;
  idState: string;
  idCountry: string;
  idExpiration: string;
};

type SellerForm = {
  name: string;
  address: string;
  taxId: string;
};

type SettlementAgentForm = {
  companyName: string;
  agentName: string;
  licenseNumber: string;
  address: string;
  phone: string;
};

const entitySchema = z.object({
  entityName: z.string().trim().min(1),
  formationState: z.string().trim().min(1),
});

const trustSchema = z.object({
  trustName: z.string().trim().min(1),
});

const ownerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  ownershipPercentage: z.number().min(0).max(100),
});

export function CollectClient(props: {
  transactionId: string;
  buyerType: BuyerType;
  initialCollectionProgress: number;
  initialEntity: (Omit<EntityForm, "ein"> & { einLast4: string }) | null;
  initialTrust: (Omit<TrustForm, "ein"> & { einLast4: string }) | null;
  initialOwners: Array<
    Omit<OwnerForm, "dateOfBirth" | "ssnItin" | "idNumber"> & {
      dateOfBirthLast4: string;
      ssnItinLast4: string;
      idNumberLast4: string;
    }
  >;
  initialSeller: { name: string; address: string; taxIdLast4: string };
  initialSettlementAgent: SettlementAgentForm;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("entity");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [entity, setEntity] = useState<EntityForm>({
    entityName: props.initialEntity?.entityName ?? "",
    entityType:
      props.initialEntity?.entityType ??
      (props.buyerType === BuyerType.INDIVIDUAL ? BuyerType.LLC : props.buyerType),
    ein: props.initialEntity?.einLast4 ?? "",
    formationState: props.initialEntity?.formationState ?? "",
    formationDate: props.initialEntity?.formationDate ?? "",
    registeredAgentName: props.initialEntity?.registeredAgentName ?? "",
    registeredAgentAddress: props.initialEntity?.registeredAgentAddress ?? "",
    principalPlaceOfBusiness: props.initialEntity?.principalPlaceOfBusiness ?? "",
    businessPurpose: props.initialEntity?.businessPurpose ?? "",
  });

  const [trust, setTrust] = useState<TrustForm>({
    trustName: props.initialTrust?.trustName ?? "",
    trustType: props.initialTrust?.trustType ?? "",
    trustDate: props.initialTrust?.trustDate ?? "",
    trusteeName: props.initialTrust?.trusteeName ?? "",
    trusteeAddress: props.initialTrust?.trusteeAddress ?? "",
    grantorName: props.initialTrust?.grantorName ?? "",
    grantorAddress: props.initialTrust?.grantorAddress ?? "",
    ein: props.initialTrust?.einLast4 ?? "",
  });

  const [owners, setOwners] = useState<OwnerForm[]>(
    props.initialOwners.map((o) => ({
      id: o.id,
      firstName: o.firstName,
      lastName: o.lastName,
      dateOfBirth: o.dateOfBirthLast4,
      ssnItin: o.ssnItinLast4,
      address: o.address,
      city: o.city,
      state: o.state,
      zip: o.zip,
      country: o.country,
      ownershipPercentage: o.ownershipPercentage,
      idType: o.idType,
      idNumber: o.idNumberLast4,
      idState: o.idState,
      idCountry: o.idCountry,
      idExpiration: o.idExpiration,
    })),
  );

  const [seller, setSeller] = useState<SellerForm>({
    name: props.initialSeller.name,
    address: props.initialSeller.address,
    taxId: props.initialSeller.taxIdLast4,
  });

  const [agent, setAgent] = useState<SettlementAgentForm>(props.initialSettlementAgent);

  const requiredCompletion = useMemo(() => {
    const requiredFlags: boolean[] = [];
    const trustBuyer = props.buyerType === BuyerType.TRUST;
    if (!trustBuyer) {
      requiredFlags.push(Boolean(entity.entityName.trim()));
      requiredFlags.push(Boolean(entity.formationState.trim()));
    } else {
      requiredFlags.push(Boolean(trust.trustName.trim()));
    }

    requiredFlags.push(Boolean(seller.name.trim()));
    requiredFlags.push(Boolean(seller.address.trim()));
    requiredFlags.push(Boolean(agent.companyName.trim()));
    requiredFlags.push(Boolean(agent.agentName.trim()));
    requiredFlags.push(Boolean(agent.address.trim()));

    requiredFlags.push(owners.length > 0);
    for (const owner of owners) {
      requiredFlags.push(Boolean(owner.firstName.trim()));
      requiredFlags.push(Boolean(owner.lastName.trim()));
    }

    const complete = requiredFlags.filter(Boolean).length;
    const total = requiredFlags.length || 1;
    return Math.round((complete / total) * 100);
  }, [agent, entity.entityName, entity.formationState, owners, props.buyerType, seller.address, seller.name, trust.trustName]);

  const ownershipTotal = useMemo(
    () => owners.reduce((sum, owner) => sum + (owner.ownershipPercentage || 0), 0),
    [owners],
  );

  async function patchTransaction(payload: unknown) {
    const response = await fetch(`/api/transactions/${props.transactionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Save failed");
  }

  async function autoSave(action: () => Promise<void>) {
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      await action();
      await patchTransaction({ collectionProgress: requiredCompletion });
      setMessage("Saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save");
    } finally {
      setSaving(false);
    }
  }

  async function saveEntity() {
    const trustBuyer = props.buyerType === BuyerType.TRUST;
    if (trustBuyer) {
      const parsed = trustSchema.safeParse(trust);
      if (!parsed.success) {
        throw new Error("Trust name is required");
      }
      await fetch(`/api/transactions/${props.transactionId}/trust`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      return;
    }
    const parsed = entitySchema.safeParse(entity);
    if (!parsed.success) {
      throw new Error("Entity legal name and formation state are required");
    }
    await fetch(`/api/transactions/${props.transactionId}/entity`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entity),
    });
  }

  async function saveOwner(owner: OwnerForm, index: number) {
    const parsed = ownerSchema.safeParse(owner);
    if (!parsed.success) {
      throw new Error(`Owner ${index + 1}: first name, last name, and ownership are required`);
    }
    const response = await fetch(`/api/transactions/${props.transactionId}/beneficial-owners`, {
      method: owner.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(owner),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Owner save failed");
    if (!owner.id && body.owner?.id) {
      setOwners((prev) => prev.map((o, idx) => (idx === index ? { ...o, id: body.owner.id } : o)));
    }
  }

  function addOwner() {
    setOwners((prev) => [
      ...prev,
      {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        ssnItin: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "US",
        ownershipPercentage: 0,
        idType: "",
        idNumber: "",
        idState: "",
        idCountry: "US",
        idExpiration: "",
      },
    ]);
  }

  async function validateAndProceed() {
    setError(null);
    const trustBuyer = props.buyerType === BuyerType.TRUST;
    if (!trustBuyer && !entity.entityName.trim()) {
      setError("Entity legal name is required");
      setTab("entity");
      return;
    }
    if (trustBuyer && !trust.trustName.trim()) {
      setError("Trust name is required");
      setTab("entity");
      return;
    }
    if (owners.length < 1) {
      setError("At least one beneficial owner is required");
      setTab("owners");
      return;
    }
    if (ownershipTotal < 75) {
      setError("Ownership percentages should total at least 75%");
      setTab("owners");
      return;
    }
    if (!seller.name.trim() || !seller.address.trim()) {
      setError("Seller name and address are required");
      setTab("seller");
      return;
    }
    await autoSave(async () => {
      await saveEntity();
      await Promise.all(owners.map((owner, i) => saveOwner(owner, i)));
      await patchTransaction({
        seller,
        settlementAgent: agent,
        collectionProgress: requiredCompletion,
      });
    });
    router.push(`/transactions/${props.transactionId}/documents`);
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Data collection</h1>
          <p className="mt-1 text-sm text-muted">
            Enter required FinCEN filing data. Fields marked <span className="text-danger">*</span> are required.
          </p>
        </div>
        <Button
          variant="secondary"
          loading={saving}
          onClick={() =>
            autoSave(async () =>
              patchTransaction({
                seller,
                settlementAgent: agent,
                collectionProgress: requiredCompletion,
              }),
            )
          }
        >
          Save & Continue Later
        </Button>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Completion progress</span>
          <span className="text-xs text-muted">{Math.round(requiredCompletion)}%</span>
        </div>
        <Progress value={requiredCompletion} showLabel={false} />
      </div>

      {error ? (
        <Alert className="mt-4" variant="error" title="Validation issue">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert className="mt-4" variant="success">
          {message}
        </Alert>
      ) : null}

      <Tabs className="mt-5" value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="entity">Entity/Trust Information</TabsTrigger>
          <TabsTrigger value="owners">Beneficial Owners</TabsTrigger>
          <TabsTrigger value="seller">Seller Information</TabsTrigger>
          <TabsTrigger value="agent">Settlement Agent</TabsTrigger>
        </TabsList>

        <TabsContent value="entity">
          {props.buyerType === BuyerType.TRUST ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Trust name *" value={trust.trustName} onChange={(e) => setTrust((p) => ({ ...p, trustName: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Select
                label="Trust type"
                value={trust.trustType}
                onChange={(e) => setTrust((p) => ({ ...p, trustType: e.target.value }))}
                onBlur={() => autoSave(saveEntity)}
                options={[
                  { value: "", label: "Select type" },
                  { value: "revocable", label: "Revocable" },
                  { value: "irrevocable", label: "Irrevocable" },
                  { value: "land_trust", label: "Land trust" },
                ]}
              />
              <Input label="Trust date" variant="date" value={trust.trustDate} onChange={(e) => setTrust((p) => ({ ...p, trustDate: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Input label="EIN (last 4 shown)" value={trust.ein} onChange={(e) => setTrust((p) => ({ ...p, ein: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Input label="Trustee name" value={trust.trusteeName} onChange={(e) => setTrust((p) => ({ ...p, trusteeName: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Input label="Trustee address" value={trust.trusteeAddress} onChange={(e) => setTrust((p) => ({ ...p, trusteeAddress: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Input label="Grantor name" value={trust.grantorName} onChange={(e) => setTrust((p) => ({ ...p, grantorName: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Input label="Grantor address" value={trust.grantorAddress} onChange={(e) => setTrust((p) => ({ ...p, grantorAddress: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Entity legal name *" value={entity.entityName} onChange={(e) => setEntity((p) => ({ ...p, entityName: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Select
                label="Entity type *"
                value={entity.entityType}
                onChange={(e) => setEntity((p) => ({ ...p, entityType: e.target.value as BuyerType }))}
                onBlur={() => autoSave(saveEntity)}
                options={[
                  { value: BuyerType.LLC, label: "LLC" },
                  { value: BuyerType.CORPORATION, label: "Corporation" },
                  { value: BuyerType.PARTNERSHIP, label: "Partnership" },
                  { value: BuyerType.OTHER_ENTITY, label: "Other Entity" },
                ]}
              />
              <Input label="EIN (last 4 shown)" value={entity.ein} onChange={(e) => setEntity((p) => ({ ...p, ein: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Input label="Formation state *" value={entity.formationState} onChange={(e) => setEntity((p) => ({ ...p, formationState: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Input label="Formation date" variant="date" value={entity.formationDate} onChange={(e) => setEntity((p) => ({ ...p, formationDate: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Input label="Registered agent name" value={entity.registeredAgentName} onChange={(e) => setEntity((p) => ({ ...p, registeredAgentName: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Input label="Registered agent address" value={entity.registeredAgentAddress} onChange={(e) => setEntity((p) => ({ ...p, registeredAgentAddress: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Input label="Principal place of business" value={entity.principalPlaceOfBusiness} onChange={(e) => setEntity((p) => ({ ...p, principalPlaceOfBusiness: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
              <Textarea className="sm:col-span-2" label="Business purpose" value={entity.businessPurpose} onChange={(e) => setEntity((p) => ({ ...p, businessPurpose: e.target.value }))} onBlur={() => autoSave(saveEntity)} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="owners">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted">
              List all beneficial owners (25%+ ownership).
            </p>
            <Button size="sm" onClick={addOwner}>
              Add Beneficial Owner
            </Button>
          </div>

          {owners.length === 0 ? (
            <Alert variant="warning">At least one beneficial owner is required.</Alert>
          ) : null}

          {ownershipTotal < 75 ? (
            <Alert className="mb-3" variant="warning">
              Ownership percentages total {ownershipTotal.toFixed(1)}%. Minimum recommended total is 75%.
            </Alert>
          ) : null}

          <div className="space-y-4">
            {owners.map((owner, index) => (
              <div key={owner.id ?? `owner-${index}`} className="rounded-md border border-slate-200 p-3">
                <p className="mb-2 text-sm font-semibold text-foreground">Owner {index + 1}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="First name *" value={owner.firstName} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, firstName: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                  <Input label="Last name *" value={owner.lastName} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, lastName: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                  <Input label="Date of birth (last 4 shown)" value={owner.dateOfBirth} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, dateOfBirth: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                  <Input label="SSN/ITIN (last 4 shown)" value={owner.ssnItin} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, ssnItin: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                  <Input label="Residential address" value={owner.address} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, address: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                  <Input label="City" value={owner.city} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, city: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                  <Input label="State" value={owner.state} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, state: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                  <Input label="ZIP" value={owner.zip} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, zip: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                  <Input label="Ownership percentage *" variant="number" value={String(owner.ownershipPercentage)} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, ownershipPercentage: Number(e.target.value || 0) } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                  <Select label="ID document type" value={owner.idType} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, idType: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} options={[{ value: "", label: "Select type" }, { value: "drivers_license", label: "Driver's license" }, { value: "passport", label: "Passport" }, { value: "state_id", label: "State ID" }]} />
                  <Input label="ID number (last 4 shown)" value={owner.idNumber} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, idNumber: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                  <Input label="Issuing state/country" value={owner.idState || owner.idCountry} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, idState: e.target.value, idCountry: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                  <Input label="ID expiration" variant="date" value={owner.idExpiration} onChange={(e) => setOwners((prev) => prev.map((it, i) => (i === index ? { ...it, idExpiration: e.target.value } : it)))} onBlur={() => autoSave(() => saveOwner(owners[index], index))} />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="seller">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Seller name *" value={seller.name} onChange={(e) => setSeller((p) => ({ ...p, name: e.target.value }))} onBlur={() => autoSave(() => patchTransaction({ seller }))} />
            <Input label="Seller SSN/EIN (if entity, last 4 shown)" value={seller.taxId} onChange={(e) => setSeller((p) => ({ ...p, taxId: e.target.value }))} onBlur={() => autoSave(() => patchTransaction({ seller }))} />
            <Input className="sm:col-span-2" label="Seller address *" value={seller.address} onChange={(e) => setSeller((p) => ({ ...p, address: e.target.value }))} onBlur={() => autoSave(() => patchTransaction({ seller }))} />
          </div>
        </TabsContent>

        <TabsContent value="agent">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Company name *" value={agent.companyName} onChange={(e) => setAgent((p) => ({ ...p, companyName: e.target.value }))} onBlur={() => autoSave(() => patchTransaction({ settlementAgent: agent }))} />
            <Input label="Agent name *" value={agent.agentName} onChange={(e) => setAgent((p) => ({ ...p, agentName: e.target.value }))} onBlur={() => autoSave(() => patchTransaction({ settlementAgent: agent }))} />
            <Input label="License number" value={agent.licenseNumber} onChange={(e) => setAgent((p) => ({ ...p, licenseNumber: e.target.value }))} onBlur={() => autoSave(() => patchTransaction({ settlementAgent: agent }))} />
            <Input label="Phone" value={agent.phone} onChange={(e) => setAgent((p) => ({ ...p, phone: e.target.value }))} onBlur={() => autoSave(() => patchTransaction({ settlementAgent: agent }))} />
            <Input className="sm:col-span-2" label="Address *" value={agent.address} onChange={(e) => setAgent((p) => ({ ...p, address: e.target.value }))} onBlur={() => autoSave(() => patchTransaction({ settlementAgent: agent }))} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-5 flex items-center justify-between gap-2">
        <Button variant="secondary" onClick={() => router.push(`/transactions/${props.transactionId}`)}>
          Back to Transaction
        </Button>
        <Button loading={saving} onClick={validateAndProceed}>
          Validate & Proceed
        </Button>
      </div>
    </div>
  );
}
