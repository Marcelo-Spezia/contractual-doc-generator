import { Suspense } from "react";
import Wizard from "@/components/Wizard";

export default function GeneratorPage() {
  return (
    <Suspense fallback={null}>
      <Wizard />
    </Suspense>
  );
}
