import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getSetting } from "@/lib/siteSettings.server";
import { paymentProvider } from "@/lib/payments/providers";

// Configuration publique du paiement manuel : opérateurs activés,
// bénéficiaire, instructions et délai de vérification.
export const GET = apiHandler(async () => {
	const { value } = await getSetting("payments");
	const operators = Object.fromEntries(
		Object.entries(value.operators || {}).filter(([, o]) => o?.enabled && o?.number)
	);
	return NextResponse.json({
		provider: paymentProvider().key,
		operators,
		beneficiary: value.beneficiary || "",
		instructions: value.instructions || "",
		verificationDelay: value.verificationDelay || "",
	});
});
