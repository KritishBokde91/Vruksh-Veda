// app/plants/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PlantClient from "./PlantClient";

type PlantRow = {
  name: string;
  botanical_name?: string | null;
  family?: string | null;
  synonyms?: string[] | null;
  useful_parts?: string[] | null;
  indications?: string[] | null;
  shloka?: string | null;
  images?: string[] | null;
};

export default function PlantPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [plant, setPlant] = useState<PlantRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("plants")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        router.replace("/not-found");
        return;
      }
      setPlant(data as PlantRow);
      setLoading(false);
    })();
  }, [params, router]);

  if (loading) return null;
  if (!plant) return null;

  return (
    <PlantClient
      plant={{
        name: plant.name,
        botanical_name: plant.botanical_name ?? null,
        family: plant.family ?? null,
        synonyms: plant.synonyms ?? null,
        useful_parts: plant.useful_parts ?? null,
        indications: plant.indications ?? null,
        shloka: plant.shloka ?? null,
        images: (plant.images as string[] | null) ?? [],
      }}
    />
  );
}