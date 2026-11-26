// Interface commune aux fournisseurs de paiement de la BLUE Academy.
//
// Chaque fournisseur expose :
//   key            identifiant unique ("manual", "cinetpay", …)
//   label          nom affiché dans l'admin
//   describe()     renvoie ce que le visiteur doit voir (numéros Mobile
//                  Money, instructions…) — NEVER any secret
//   preparePayment({ course, learner })   amorce une demande de paiement
//                  et renvoie { instructions } pour le visiteur
//   statusOf(payment)                    statut courant
//
// Fournisseur « manual » (actuel) : l'admin configure les numéros Mobile
// Money dans /admin/formations > Réglages de paiement ; le visiteur envoie
// sa référence de transaction ; l'admin valide à la main.
//
// BRANCHER UN FOURNISSEUR EN LIGNE PLUS TARD (CinetPay ou autre) :
//   1. Créer lib/payments/cinetpay.server.js exposant le même objet
//      { key, label, describe, preparePayment, statusOf } + webhook de
//      confirmation.
//   2. L'ajouter dans PROVIDERS ci-dessous.
//   3. Le parcours visiteur (soumission → paiement → accès) ne change pas :
//      seul preparePayment() retournera un lien de paiement au lieu de
//      numéros Mobile Money. La validation admin (ouverture de l'accès,
//      création du compte BLUE-EXT) reste dans lib/data/local/payments.js.

export const PROVIDERS = {
	manual: {
		key: "manual",
		label: "Paiement manuel (Mobile Money)",
	},
};

export const paymentProvider = (key = "manual") => PROVIDERS[key] || PROVIDERS.manual;
