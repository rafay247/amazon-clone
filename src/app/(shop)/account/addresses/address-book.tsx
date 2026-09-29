"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import type { Address } from "@/lib/types";
import { deleteAddress, setDefaultAddress } from "@/lib/account-actions";
import { Modal } from "@/components/modal";
import { AddressForm } from "@/components/address-form";

export function AddressBook({ addresses, userName }: { addresses: Address[]; userName: string }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className={`mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${pending ? "opacity-60" : ""}`}>
      <button
        onClick={() => setAdding(true)}
        className="flex min-h-[250px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#c7c7c7] text-muted hover:bg-[#f7fafa]"
      >
        <Plus size={40} />
        <span className="text-xl font-bold">Add Address</span>
      </button>
      {addresses.map((a) => (
        <div key={a.id} className="flex min-h-[250px] flex-col rounded-lg border border-line text-sm">
          {a.is_default ? (
            <p className="border-b border-line px-5 py-2 text-xs text-muted">
              Default: <span className="font-bold text-ink">Cartly</span>
            </p>
          ) : (
            <div className="h-[33px]" />
          )}
          <div className="flex-1 px-5 pt-3">
            <p className="font-bold">{a.full_name}</p>
            <p>{a.line1}</p>
            {a.line2 && <p>{a.line2}</p>}
            <p>
              {a.city}, {a.state} {a.zip}
            </p>
            <p>{a.country}</p>
            {a.phone && <p>Phone number: {a.phone}</p>}
          </div>
          <div className="flex gap-3 px-5 pb-4 text-xs">
            <button
              onClick={() =>
                start(async () => {
                  await deleteAddress(a.id);
                  router.refresh();
                })
              }
              className="link"
            >
              Remove
            </button>
            {!a.is_default && (
              <>
                <span className="text-line">|</span>
                <button
                  onClick={() =>
                    start(async () => {
                      await setDefaultAddress(a.id);
                      router.refresh();
                    })
                  }
                  className="link"
                >
                  Set as Default
                </button>
              </>
            )}
          </div>
        </div>
      ))}
      {adding && (
        <Modal title="Add a new address" onClose={() => setAdding(false)} width="max-w-lg">
          <AddressForm
            defaultName={userName}
            submitLabel="Add address"
            onSaved={() => {
              setAdding(false);
              router.refresh();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
