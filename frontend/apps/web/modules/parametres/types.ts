export type InformationsSocieteForm = {
  nomEntreprise: string;
  numeroRC: string;
  nif: string;
  nis: string;
  adresse: string;
  wilaya: string;
  email: string;
  telephone: string;
  siteWeb: string;
  devise: string;
  logoDataUrl?: string;
};

export type RegionalLangueForm = {
  langue: string;
  fuseau: string;
  formatDate: string;
  formatNombre: string;
  separateurDecimal: string;
  calendrierFiscal: string;
  joursOuvres: string[];
};

export type NotificationsForm = {
  canaux: {
    inApp: boolean;
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  regles: {
    id: string;
    label: string;
    actif: boolean;
  }[];
  templatesWhatsapp: { nom: string; preview: string }[];
  templatesSms: { nom: string; preview: string }[];
  templatesEmail: { nom: string; preview: string }[];
};

export type GestionCommandesForm = {
  delaiConfirmation: number;
  actionExpiration: string;
  niveauxRisque: {
    niveau: string;
    absences: string;
    couleur: string;
    action: string;
  }[];
  statutsActifs: Record<string, boolean>;
  prefixeCommande: string;
  prochainNumero: string;
  formatCommande: string;
  confirmationAuto: boolean;
  delaiGrace: number;
};

export type LivraisonWilayasForm = {
  transporteurs: {
    nom: string;
    statut: string;
    delai: string;
    tarif: string;
  }[];
  wilayas: Record<number, "couvert" | "majore" | "non-desservi">;
  delaiRetour: string;
  fraisRetourCharge: string;
  remboursementAuto: boolean;
};

export type InventaireStockForm = {
  alertesActives: boolean;
  seuilCritique: number;
  seuilAvertissement: number;
  seuilFaible: number;
  entrepots: {
    nom: string;
    wilaya: string;
    responsable: string;
    statut: string;
  }[];
  reapproAuto: boolean;
  fournisseurDefaut: string;
  delaiPreavis: string;
};

export type CrmClientsForm = {
  segmentsRfm: {
    segment: string;
    emoji: string;
    criteres: string;
    couleur: string;
    action: string;
  }[];
  blacklistAuto: boolean;
  absencesPourBlacklist: number;
  periodeCalcul: string;
  reintegrationManuelle: boolean;
  otpActif: boolean;
  delaiExpirationOtp: number;
  tentativesMaxOtp: number;
  fournisseurSmsOtp: string;
};

export type UtilisateursRolesForm = {
  utilisateurs: {
    initiales: string;
    nom: string;
    email: string;
    role: string;
    statut: string;
    derniereConnexion: string;
  }[];
  roles: {
    nom: string;
    description: string;
    permissionCount: number;
    type: string;
  }[];
};

export type SecuriteAccesForm = {
  longueurMinMdp: number;
  majusculeRequise: boolean;
  caractereSpecialRequis: boolean;
  expirationMdp: string;
  deuxFacteursObligatoire: boolean;
  methode2fa: string;
  sessions: {
    appareil: string;
    ip: string;
    localisation: string;
    debut: string;
    courante: boolean;
  }[];
};

export type ParametresFormData = {
  informationsSociete: InformationsSocieteForm;
  regionalLangue: RegionalLangueForm;
  notifications: NotificationsForm;
  gestionCommandes: GestionCommandesForm;
  livraisonWilayas: LivraisonWilayasForm;
  inventaireStock: InventaireStockForm;
  crmClients: CrmClientsForm;
  utilisateursRoles: UtilisateursRolesForm;
  securiteAcces: SecuriteAccesForm;
};

export type SettingsTabId =
  | "informations-societe"
  | "regional-langue"
  | "notifications"
  | "gestion-commandes"
  | "livraison-wilayas"
  | "inventaire-stock"
  | "crm-clients"
  | "utilisateurs-roles"
  | "securite-acces";
